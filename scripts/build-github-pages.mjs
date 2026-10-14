import {cp, mkdir, readFile, readdir, rm, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputDirectory = path.resolve(projectRoot, process.env.PAGES_OUTPUT || 'dist-pages');
if (!outputDirectory.startsWith(projectRoot + path.sep)) {
  throw new Error('The Pages output directory must stay inside the repository.');
}

const repositoryName = process.env.GITHUB_REPOSITORY?.split('/')[1] || 'Car-Recond-Japan';
const requestedBase = process.env.PAGES_BASE_PATH || `/${repositoryName}/`;
const basePath = `/${requestedBase.split('/').filter(Boolean).join('/')}/`;
const baseWithoutTrailingSlash = basePath.slice(0, -1);
const publicDataPath = path.join(projectRoot, 'data', 'public-site.json');
const publicAssetsPath = path.join(projectRoot, 'public');
const templatesPath = path.join(projectRoot, 'out');
const excludedPublicFiles = new Set([
  'admin.css',
  'admin.js',
  'admin-dashboard.css',
  'admin-dashboard.js',
  'cms-studio.js',
  'cms-import.js',
  'cms-charts.js',
  'assets/configs/leads.json',
]);

function prefixRootPath(value) {
  if (!value.startsWith('/') || value.startsWith('//')) return value;
  if (value === baseWithoutTrailingSlash || value.startsWith(basePath)) return value;
  return `${baseWithoutTrailingSlash}${value}`;
}

function rewriteMarkupPaths(source) {
  return source.replace(
    /((?:href|src|action|poster|formaction|xlink:href)\s*=\s*["'])\/(?!\/)([^"']*)/gi,
    (_match, prefix, rest) => `${prefix}${prefixRootPath(`/${rest}`)}`,
  );
}

function rewriteJavaScriptPaths(source) {
  let result = rewriteMarkupPaths(source);
  result = result.replace(
    /(['"`])\/(?=(?:assets|vehicle|stock|calculator|audi(?:\.html)?|studio)(?:[/?#]|$)|#)([^'"`\s]*)/g,
    (_match, quote, rest) => `${quote}${prefixRootPath(`/${rest}`)}`,
  );
  result = result.replace(
    /(\b(?:window\.)?location\.(?:href|assign|replace)\s*(?:=\s*|\(\s*)["'\x60])\/(?!\/)/g,
    (_match, prefix) => `${prefix}${baseWithoutTrailingSlash}/`,
  );
  return result;
}

function rewriteCssPaths(source) {
  return source.replace(/url\(\s*(["']?)\/(?!\/)([^)"']*)\1\s*\)/gi, (_match, quote, rest) => {
    const value = prefixRootPath(`/${rest}`);
    return `url(${quote}${value}${quote})`;
  });
}

function normalizePublicPaths(value) {
  if (Array.isArray(value)) return value.map(normalizePublicPaths);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, normalizePublicPaths(item)]));
  }
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//')) return value;
  if (value.startsWith('/api/')) {
    throw new Error(`Static Pages cannot serve a backend media path: ${value}`);
  }
  return prefixRootPath(value);
}

async function walk(directory, relative = '') {
  const entries = await readdir(directory, {withFileTypes: true});
  const files = [];
  for (const entry of entries) {
    const nextRelative = path.posix.join(relative.split(path.sep).join('/'), entry.name);
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(absolute, nextRelative));
    else if (entry.isFile()) files.push({absolute, relative: nextRelative});
  }
  return files;
}

async function copyPublicAssets() {
  for (const {absolute, relative} of await walk(publicAssetsPath)) {
    if (excludedPublicFiles.has(relative)) continue;
    const destination = path.join(outputDirectory, relative);
    await mkdir(path.dirname(destination), {recursive: true});
    const extension = path.extname(relative).toLowerCase();
    if (['.css', '.js', '.mjs', '.html', '.svg', '.xml', '.webmanifest'].includes(extension)) {
      let content = await readFile(absolute, 'utf8');
      if (extension === '.css') content = rewriteCssPaths(content);
      else if (extension === '.js' || extension === '.mjs') content = rewriteJavaScriptPaths(content);
      else content = rewriteMarkupPaths(content);
      await writeFile(destination, content);
    } else {
      await cp(absolute, destination);
    }
  }
}

function safeInlineJson(value) {
  return JSON.stringify(value).replaceAll('<', '\\u003c').replaceAll('>', '\\u003e');
}

async function renderTemplate(templateName, {route = '', title} = {}) {
  let html = await readFile(path.join(templatesPath, templateName), 'utf8');
  if (title) html = html.replace(/<title>[^<]*<\/title>/i, `<title>${title}</title>`);

  if (/class="home(?: |")/.test(html)) {
    const slide = html.match(/<article class="showcase-slide[^]*?<\/article>/)?.[0];
    html = html.replace(/<article class="showcase-slide[^]*?<\/article>/, '');
    if (slide) html = html.replace(/(<body\b[^>]*>)/i, `$1<template id="cmsShowcaseTemplate">${slide}</template>`);
    html = html.replace(
      /<section class="customer-stories" id="customer-stories"[^]*?<\/section>/,
      '<section class="customer-stories" id="customer-stories"><p>Customer moments are shared after permission is recorded.</p></section>',
    );
  }

  html = html.replace(/<script src="\/site-languages\.js\?v=26" defer><\/script>/g, '');
  const canonicalPath = route ? `${basePath}${route.replace(/^\/+|\/+$/g, '')}/` : basePath;
  const canonicalUrl = `https://danielong-bit.github.io${canonicalPath}`;
  const metadata = `<link rel="canonical" href="${canonicalUrl}"><meta property="og:site_name" content="Danny Recon Select"><meta property="og:type" content="website"><meta property="og:url" content="${canonicalUrl}">`;
  const runtime = `<base href="${basePath}"><link rel="stylesheet" href="danny-interactions.css"><link rel="stylesheet" href="cms.css"><script>window.SITE_BASE=${safeInlineJson(basePath)};window.GITHUB_PAGES_STATIC=true;window.CMS_DATA=${safeInlineJson(publicData)};</script>`;
  if (!/<head(?:\s[^>]*)?>/i.test(html) || !/<\/body>/i.test(html)) {
    throw new Error(`Template ${templateName} is missing its document head or body.`);
  }
  html = html.replace(/<head(?:\s[^>]*)?>/i, match => `${match}${runtime}${metadata}`);
  html = html.replace(
    /<\/body>/i,
    '<script src="cms-public.js?v=pages-static"></script><script src="danny-interactions.js" defer></script><script src="select-home.js?v=25" defer></script><script src="select-polish.js?v=25" defer></script><script src="site-languages.js?v=26" defer></script></body>',
  );
  return rewriteMarkupPaths(html);
}

function managementPage() {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><base href="${basePath}"><title>Manage Danny Recon Select</title><link rel="stylesheet" href="design-system.css"><link rel="stylesheet" href="cms.css"><link rel="stylesheet" href="site-languages.css"><script>window.SITE_BASE=${safeInlineJson(basePath)};window.GITHUB_PAGES_STATIC=true;window.CMS_DATA=${safeInlineJson(publicData)};</script><script src="design-system.js" defer></script><script src="site-languages.js" defer></script></head><body><main class="public-cms-wrap"><header class="public-cms-head"><a class="public-brand" href="${basePath}">DANNY RECON SELECT</a><a href="${basePath}#inventory">View inventory</a></header><section class="public-panel"><span class="stories-eyebrow">SITE MANAGEMENT</span><h1 class="public-title">Update the live website through GitHub</h1><p class="public-muted">This website is static so it can run directly on GitHub Pages. Update the public inventory data in the repository; each change rebuilds and republishes this site.</p><div class="public-actions"><a href="https://github.com/danielong-bit/Car-Recond-Japan/edit/main/data/public-site.json" target="_blank" rel="noopener">Edit public site data ↗</a><a class="secondary" href="https://github.com/danielong-bit/Car-Recond-Japan/actions/workflows/deploy-pages.yml" target="_blank" rel="noopener">View publishing status ↗</a></div><h2>What happens to customer requests?</h2><p class="public-muted">Viewing requests open WhatsApp with the vehicle, preferred date and contact details filled in. GitHub Pages does not store bookings or private customer records.</p><p class="public-muted">For safety, this page edits only the public site data. Do not add customer enquiries, passwords or private documents to the public repository.</p></section></main></body></html>`;
}

const snapshot = JSON.parse(await readFile(publicDataPath, 'utf8'));
if (!snapshot.document || !Array.isArray(snapshot.document.vehicles) || snapshot.document.vehicles.length === 0) {
  throw new Error('data/public-site.json must contain the currently published public vehicle list.');
}
if (!/^\d{8,15}$/.test(snapshot.document.profile?.phone || '')) {
  throw new Error('The public site snapshot is missing a valid WhatsApp number.');
}
const publicData = {
  ...normalizePublicPaths(snapshot.document),
  staticSite: true,
  preview: false,
  revision: snapshot.revision || 0,
};

await rm(outputDirectory, {recursive: true, force: true});
await mkdir(outputDirectory, {recursive: true});
await copyPublicAssets();

const pages = [
  {template: 'index.html', file: 'index.html', route: '', title: 'Danny Recon Select'},
  {template: 'cms-calculator-v26.html', file: 'calculator/index.html', route: 'calculator', title: 'Car payment calculator · Danny Recon Select'},
  {template: 'audi.html', file: 'audi/index.html', route: 'audi', title: 'Audi S5 Avant · Danny Recon Select'},
];
for (const vehicle of publicData.vehicles) {
  pages.push({
    template: 'cms-vehicle.html',
    file: `vehicle/${vehicle.id}/index.html`,
    route: `vehicle/${vehicle.id}`,
    title: `${vehicle.year} ${vehicle.brand} ${vehicle.model} · Danny Recon Select`,
  });
  pages.push({
    template: 'cms-vehicle.html',
    file: `stock/${vehicle.stockId}/index.html`,
    route: `stock/${vehicle.stockId}`,
    title: `${vehicle.year} ${vehicle.brand} ${vehicle.model} · Danny Recon Select`,
  });
}

for (const page of pages) {
  const destination = path.join(outputDirectory, page.file);
  await mkdir(path.dirname(destination), {recursive: true});
  const html = await renderTemplate(page.template, {route: page.route, title: page.title});
  await writeFile(destination, html);
}

const audiAlias = await readFile(path.join(outputDirectory, 'audi', 'index.html'));
await writeFile(path.join(outputDirectory, 'audi.html'), audiAlias);
const calculatorAlias = await readFile(path.join(outputDirectory, 'calculator', 'index.html'));
await writeFile(path.join(outputDirectory, 'calculator.html'), calculatorAlias);
await mkdir(path.join(outputDirectory, 'studio'), {recursive: true});
await writeFile(path.join(outputDirectory, 'studio', 'index.html'), rewriteMarkupPaths(managementPage()));
await writeFile(
  path.join(outputDirectory, '404.html'),
  `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><base href="${basePath}"><title>Page not found · Danny Recon Select</title><link rel="stylesheet" href="design-system.css"></head><body><main class="public-cms-wrap"><section class="public-panel"><p class="stories-eyebrow">DANNY RECON SELECT</p><h1 class="public-title">That page has moved.</h1><p class="public-muted">Browse the current vehicles or return to the home page.</p><div class="public-actions"><a href="${basePath}#inventory">Browse inventory</a><a class="secondary" href="${basePath}">Home</a></div></section></main></body></html>`,
);
await writeFile(path.join(outputDirectory, '.nojekyll'), '');

console.log(`Built ${pages.length + 1} static pages at ${outputDirectory} for ${basePath}`);
