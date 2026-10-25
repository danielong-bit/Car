import {build} from 'esbuild';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('..',import.meta.url));
export async function buildOwnerLogin(output){
 const source=path.join(root,'owner-login');const target=path.join(output,'owner-login');await mkdir(target,{recursive:true});
 const result=await build({entryPoints:[path.join(source,'App.tsx')],bundle:true,minify:true,format:'esm',target:'es2022',jsx:'automatic',outdir:path.join(target,'assets'),entryNames:'login-[hash]',metafile:true,define:{'process.env.NODE_ENV':'"production"'}});
 const js=Object.keys(result.metafile.outputs).find(p=>p.endsWith('.js'));
 const componentCss=(await Promise.all(Object.keys(result.metafile.outputs).filter(p=>p.endsWith('.css')).map(p=>readFile(p,'utf8')))).join('\n');
 const cssFile=path.join(source,'index.css');
 const rawCss=await readFile(cssFile,'utf8');
 let processedCss='';
 try{
  const [{default:postcss},{default:tailwind}]=await Promise.all([import('postcss'),import('@tailwindcss/postcss')]);
  const res=await postcss([tailwind({base:source,optimize:true})]).process(rawCss,{from:cssFile});
  processedCss=res.css;
 }catch{
  processedCss=rawCss
   .replace(/@import\s+['"]tailwindcss['"];?/g,'')
   .replace(/@source\s+[^;]+;/g,'')
   .replace(/@theme\s*\{[^}]*\}/g,'')
   .replace(/@layer\s+base\s*\{([\s\S]*?)\}\s*(?=\/\*|\.)/,(_m,inner)=>inner.replace(/@apply\s+antialiased;?/g,'-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;'));
 }
 await writeFile(path.join(target,'login.css'),`${processedCss}\n${componentCss}`);
 await writeFile(path.join(target,'index.html'),`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="robots" content="noindex,nofollow"><meta name="theme-color" content="#000000"><script src="/site-theme-init.js?v=owner-20261022c"></script><link rel="stylesheet" href="/product-system.css?v=bloom-theme-20261024a"><title>Owner Log In · Danny Recon Select</title><link rel="stylesheet" href="/owner-login/login.css?v=owner-20261024c"><link rel="stylesheet" href="/brand-system.css?v=brand-final-20261025a"></head><body><div id="root"></div><script type="module" src="/owner-login/assets/${path.basename(js)}"></script></body></html>`);
}
