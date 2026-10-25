import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const cwd=fileURLToPath(new URL('..',import.meta.url));
const result=spawnSync(process.execPath,['scripts/build-github-pages.mjs'],{cwd,stdio:'inherit',env:{...process.env,PAGES_BASE_PATH:'/',PAGES_OUTPUT:'dist-preview',PREVIEW_EDITOR:'1',OWNER_WORKER_BUILD:'0'}});
process.exit(result.status??1);
