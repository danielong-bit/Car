import {readFile,writeFile,mkdir,copyFile,access} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {normalizeDocument} from '../public/inventory-domain.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
export async function prepareExhibition(){
 await mkdir(path.join(root,'public/vendor'),{recursive:true});
 const bundle=path.join(root,'public/vendor/zip.mjs');
 // The small reviewed ZIP writer is committed so Pages publishes without npm install.
 try{await access(bundle);}catch{
  const {build}=await import('esbuild');
  await build({stdin:{contents:"export {zipSync,strToU8} from 'fflate';",resolveDir:root},bundle:true,format:'esm',minify:true,outfile:bundle});
  await copyFile(path.join(root,'node_modules/fflate/LICENSE'),path.join(root,'public/vendor/fflate-LICENSE.txt'));
 }
 let inventory;try{inventory=JSON.parse(await readFile(path.join(root,'data/inventory-workbench.json'),'utf8'));}catch{inventory=JSON.parse(await readFile(path.join(root,'data/public-site.json'),'utf8'));}
 await writeFile(path.join(root,'public/inventory-workbench.json'),JSON.stringify({document:normalizeDocument(inventory.document)}));
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))await prepareExhibition();
