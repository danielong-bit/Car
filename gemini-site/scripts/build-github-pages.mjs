import {cp, link, mkdir, readFile, readdir, rm, stat, unlink, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputDirectory = path.resolve(projectRoot, process.env.PAGES_OUTPUT || 'dist-pages');
if (!outputDirectory.startsWith(projectRoot + path.sep)) {
  throw new Error('The Pages output directory must stay inside the repository.');
}

const repositoryName = process.env.GITHUB_REPOSITORY?.split('/')[1] || 'Car-Recond-Japan';
const defaultBase = (process.env.CF_PAGES === '1' || process.env.CLOUDFLARE_PAGES === '1') ? '/' : `/${repositoryName}/`;
const requestedBase = process.env.PAGES_BASE_PATH || defaultBase;
const segments=requestedBase.split('/').filter(Boolean);
const basePath = segments.length ? `/${segments.join('/')}/` : '/';
const baseWithoutTrailingSlash = basePath.slice(0, -1);
const previewEditor=process.env.PREVIEW_EDITOR==='1';
if(previewEditor&&(process.env.OWNER_WORKER_BUILD==='1'||outputDirectory!==path.join(projectRoot,'dist-preview')))throw new Error('The preview editor may only be built into dist-preview.');
import {publicDocument} from '../lib/cms/contracts.mjs';
import {normalizeDocument} from '../public/inventory-domain.mjs';
import {prepareExhibition} from './prepare-exhibition.mjs';
import {buildUiIslands} from './build-ui-islands.mjs';
import {ownerSidebarMarkup} from '../public/workbench-navigation.mjs';
import {initialVehicleMarkup} from '../public/vehicle-initial.mjs';
const publicDataPath = path.resolve(projectRoot, process.env.PAGES_SNAPSHOT_PATH || 'data/public-site.json');
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
  source=source.replace(/(from\s*['"])(\.\/[^'"]+\.mjs)(?:\?[^'"]*)?(['"])/g,(_m,a,p,q)=>a+p+'?v=owner-20261022c'+q);
  let result = rewriteMarkupPaths(source);
  result = result.replace(
    /(['"`])\/(?=(?:assets|vehicle|stock|calculator|audi(?:\.html)?|studio)(?:[/?#]|$)|#)([^'"`\s]*)/g,
    (_match, quote, rest) => `${quote}${prefixRootPath(`/${rest}`)}`,
  );
  result = result.replace(
    /(\b(?:window\.)?location\.(?:href|assign|replace)\s*(?:=\s*|\(\s*)["'\x60])(\/(?!\/)[^"'\x60]*)/g,
    (_match, prefix, absolutePath) => `${prefix}${prefixRootPath(absolutePath)}`,
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
    if(process.env.CMS_API_BASE)return process.env.CMS_API_BASE.replace(/\/$/,'')+value;
    throw new Error(`This photo needs a permanent public URL before static export: ${value}`);
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
    if (excludedPublicFiles.has(relative) || /^(?:admin|cms-studio|cms-import|cms-charts|audi|app|catalog|showroom-data|select-home|select-polish)(?:[.-]|$)/.test(relative) || /audi-s5-(hq|v2)\/.*\.(txt|b64)$/.test(relative)) continue;
    const destination = path.join(outputDirectory, relative);
    await mkdir(path.dirname(destination), {recursive: true});
    const extension = path.extname(relative).toLowerCase();
    if (['.css', '.js', '.mjs', '.html', '.svg', '.xml', '.webmanifest'].includes(extension)) {
      let content = await readFile(absolute, 'utf8');
      if (extension === '.css') content = rewriteCssPaths(content);
      // Native modules resolve against SITE_BASE themselves. Rewriting their path
      // comparisons would corrupt both photo URLs and canonical upload ZIP keys.
      else if (extension === '.js') content = rewriteJavaScriptPaths(content);
      else if (extension === '.mjs') {content=content.replace(/(from\s*['"])(\.\/[^'"]+\.mjs)(?:\?[^'"]*)?(['"])/g,(_m,a,p,q)=>a+p+'?v=owner-20261022c'+q);}
      else content = rewriteMarkupPaths(content);
      await writeFile(destination, content);
    } else {
      try {
        const [srcStat, dstStat] = await Promise.all([stat(absolute), stat(destination)]);
        if (srcStat.ino === dstStat.ino && srcStat.size === dstStat.size) continue;
        await unlink(destination);
      } catch {}
      try { await link(absolute, destination); } catch { await cp(absolute, destination); }
    }
  }
}

function safeInlineJson(value) {
  return JSON.stringify(value).replaceAll('<', '\\u003c').replaceAll('>', '\\u003e');
}

async function renderTemplate(templateName, {route = '', title} = {}) {
  let html = await readFile(path.join(templatesPath, templateName), 'utf8');
  if (title) html = html.replace(/<title>[^<]*<\/title>/i, `<title>${String(title).replaceAll('&','&amp;').replaceAll('<','&lt;')}</title>`);

  const canonicalPath = route ? `${basePath}${route.replace(/^\/+|\/+$/g, '')}/` : basePath;
  const canonicalUrl = `https://danielong-bit.github.io${canonicalPath}`;
  const metadata = `<link rel="canonical" href="${canonicalUrl}"><meta property="og:site_name" content="Danny Recond Select"><meta property="og:type" content="website"><meta property="og:url" content="${canonicalUrl}">`;
  const runtime = `<base href="${basePath}"><script>window.SITE_BASE=${safeInlineJson(basePath)};window.GITHUB_PAGES_STATIC=true;window.DANNY_PREVIEW_EDITOR=${previewEditor};window.CMS_DATA=${safeInlineJson(publicData)};</script>`;
  if (!/<head(?:\s[^>]*)?>/i.test(html) || !/<\/body>/i.test(html)) {
    throw new Error(`Template ${templateName} is missing its document head or body.`);
  }
  html = html.replace(/<head(?:\s[^>]*)?>/i, match => `${match}${runtime}${metadata}`);
  if (['cms-vehicle.html','audi.html'].includes(templateName)) {
    const key=decodeURIComponent(route.split('/').at(-1)||'');
    const vehicle=publicData.vehicles.find(v=>v.id===key||v.stockId===key||(key==='audi'&&v.id==='audi-s5'));
    if(vehicle) html=html.replace(/(<main[^>]*id="vehicleContent"[^>]*>)[\s\S]*?(<\/main>)/,(_match,open,close)=>open+initialVehicleMarkup(vehicle,publicData,{base:basePath,pathname:canonicalPath})+close);
  }
  return rewriteMarkupPaths(html);
}

async function dashboardPage() {
  const page = await renderTemplate('workbench.html', {route:'studio',title:'Inventory workbench · Danny Recond Select'});
  return page
    .replace(/<aside class="wb-sidebar">[\s\S]*?<\/aside>/,()=>ownerSidebarMarkup('/'))
    .replace('<div id="workspaceContent">', (previewEditor?'<p class="preview-editor-notice" role="status">Preview workspace · Changes are saved in this browser. The live website stays unchanged.</p>':'')+'<div id="workspaceContent">')
    .replace('</head>', '<link rel="stylesheet" href="/assets/workbench-ui.css?v=owner-ui-20261024d"><link rel="stylesheet" href="/workbench-hierarchy.css?v=owner-nav-20261023b"></head>')
    .replace('</body>', '<div id="workbenchUiMount"></div><script type="module" src="/assets/workbench-ui.js?v=owner-ui-20261024d"></script></body>');
}

const snapshot = JSON.parse(await readFile(publicDataPath, 'utf8'));
if (!snapshot.document || !Array.isArray(snapshot.document.vehicles)) {
  throw new Error('data/public-site.json must contain the currently published public vehicle list.');
}
if (!/^\d{8,15}$/.test(snapshot.document.profile?.phone || '')) {
  throw new Error('The public site snapshot is missing a valid WhatsApp number.');
}
const publicData = {
  ...normalizePublicPaths(publicDocument({...normalizeDocument(snapshot.document),stories:(snapshot.document.stories||[]).map(s=>({...s,published:s.published??true,consent:s.consent??'approved'}))})),
  staticSite: true,
  preview: false,
  revision: snapshot.revision || 0,
};

if (process.env.KEEP_OUTPUT !== '1' && (outputDirectory !== path.resolve(projectRoot, 'dist-preview') || process.env.CLEAN_OUTPUT === '1')) {
  await rm(outputDirectory, {recursive: true, force: true});
}
await mkdir(outputDirectory, {recursive: true});
await prepareExhibition();
await copyPublicAssets();
await buildUiIslands(outputDirectory, {includeOwner: process.env.OWNER_WORKER_BUILD === '1'||previewEditor});
await writeFile(path.join(outputDirectory,'published-baseline.json'),JSON.stringify({document:publicData}));
const pages = [
  {template:'tools.html',file:'tools/index.html',route:'tools',title:'Calculator & JPJ · Danny Recon Select'},
  {template: 'index.html', file: 'index.html', route: '', title: 'Danny Recond Select · Japan Recond by Danny'},
  {template: 'services.html', file: 'services/index.html', route: 'services', title: 'Services & XPEL / 3M Tinting · Danny Recond Select'},
  {template: 'calculator-redirect.html', file: 'calculator/index.html', route: 'calculator', title: 'Car payment calculator · Danny Recond Select'},
  {template: 'audi.html', file: 'audi/index.html', route: 'audi', title: 'Audi S5 Avant · Danny Recond Select'},
];
for (const vehicle of publicData.vehicles) {
  pages.push({
    template: 'cms-vehicle.html',
    file: `vehicle/${vehicle.id}/index.html`,
    route: `vehicle/${vehicle.id}`,
    title: `${vehicle.year} ${vehicle.brand} ${vehicle.model} · Danny Recond Select`,
  });
  pages.push({
    template: 'cms-vehicle.html',
    file: `stock/${vehicle.stockId}/index.html`,
    route: `stock/${vehicle.stockId}`,
    title: `${vehicle.year} ${vehicle.brand} ${vehicle.model} · Danny Recond Select`,
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
if(process.env.OWNER_WORKER_BUILD!=='1')await writeFile(path.join(outputDirectory,'inventory-workbench.json'),JSON.stringify({document:publicData}));
const dashboard = process.env.OWNER_WORKER_BUILD === '1'||previewEditor ? await dashboardPage() : `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><meta http-equiv="refresh" content="0;url=https://car-recond-japan.danielong2005.workers.dev/studio/"><title>Owner Log In - Danny Recon Select</title></head><body><a href="https://car-recond-japan.danielong2005.workers.dev/studio/">Continue to Owner Log In</a></body></html>`;
await writeFile(path.join(outputDirectory, 'studio', 'index.html'), dashboard);
await mkdir(path.join(outputDirectory, 'admin'), {recursive: true});
await writeFile(path.join(outputDirectory, 'admin', 'index.html'), dashboard);
await writeFile(path.join(outputDirectory,'admin.html'),dashboard);
if(previewEditor){
 await mkdir(path.join(outputDirectory,'owner-login'),{recursive:true});
 await writeFile(path.join(outputDirectory,'owner-login','index.html'),'<!doctype html><html lang="en"><head><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=/studio/"><title>Preview editor</title></head><body><a href="/studio/">Open preview editor</a></body></html>');
}
await writeFile(
  path.join(outputDirectory, '404.html'),
  `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><base href="${basePath}"><title>Page not found · Danny Recond Select</title><link rel="stylesheet" href="design-system.css"></head><body><main class="public-cms-wrap"><section class="public-panel"><p class="stories-eyebrow">DANNY RECOND SELECT</p><h1 class="public-title">We couldn’t find this page.</h1><p class="public-muted">Browse the current vehicles or return to the home page.</p><div class="public-actions"><a href="${basePath}#inventory">Browse inventory</a><a class="secondary" href="${basePath}">Home</a></div></section></main></body></html>`,
);
await writeFile(path.join(outputDirectory, '.nojekyll'), '');
await writeFile(
  path.join(outputDirectory, '_headers'),
  `# Cloudflare Pages edge cache & security headers\n/assets/*\n  Cache-Control: public, max-age=31536000, immutable\n/*.css\n  Cache-Control: no-cache\n/*.mjs\n  Cache-Control: no-cache\n`,
);

console.log(`Built ${pages.length + 1} static pages at ${outputDirectory} for ${basePath}`);
