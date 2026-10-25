import {existsSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const cwd=fileURLToPath(new URL('../gemini-site/',import.meta.url));
const [command='dev',...args]=process.argv.slice(2);
if(!['dev','build'].includes(command))throw Error('Expected dev or build.');
if(!existsSync(new URL('../gemini-site/node_modules/esbuild/package.json',import.meta.url))){
 const npm=process.env.npm_execpath;
 if(!npm)throw Error('Run npm ci --ignore-scripts inside gemini-site first, then run npm run dev.');
 const install=spawnSync(process.execPath,[npm,'ci','--ignore-scripts'],{cwd,stdio:'inherit'});
 if(install.error)throw install.error;if(install.status)process.exit(install.status);
}
const result=spawnSync(process.execPath,[command==='build'?'scripts/build-preview.mjs':'scripts/preview-static.mjs',...args],{cwd,stdio:'inherit'});
if(result.error)throw result.error;process.exit(result.status??1);
