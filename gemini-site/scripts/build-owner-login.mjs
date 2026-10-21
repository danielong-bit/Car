import {build} from 'esbuild';
import postcss from 'postcss';
import tailwind from '@tailwindcss/postcss';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('..',import.meta.url));
export async function buildOwnerLogin(output){
 const source=path.join(root,'owner-login');const target=path.join(output,'owner-login');await mkdir(target,{recursive:true});
 const result=await build({entryPoints:[path.join(source,'App.tsx')],bundle:true,minify:true,format:'esm',target:'es2022',jsx:'automatic',outdir:path.join(target,'assets'),entryNames:'login-[hash]',metafile:true,define:{'process.env.NODE_ENV':'"production"'}});
 const js=Object.keys(result.metafile.outputs).find(p=>p.endsWith('.js'));
 const cssFile=path.join(source,'index.css');const css=await postcss([tailwind({base:source,optimize:true})]).process(await readFile(cssFile,'utf8'),{from:cssFile});
 await writeFile(path.join(target,'login.css'),css.css);
 await writeFile(path.join(target,'index.html'),`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="robots" content="noindex,nofollow"><meta name="theme-color" content="#000000"><title>Owner Log In · Danny Recon Select</title><link rel="stylesheet" href="/owner-login/login.css?v=20261021a"></head><body><div id="root"></div><script type="module" src="/owner-login/assets/${path.basename(js)}"></script></body></html>`);
}
