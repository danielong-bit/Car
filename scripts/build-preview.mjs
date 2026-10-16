import {spawnSync} from 'node:child_process';
const result=spawnSync(process.execPath,['scripts/build-github-pages.mjs'],{stdio:'inherit',env:{...process.env,PAGES_BASE_PATH:'/',PAGES_OUTPUT:'dist-preview'}});
process.exit(result.status??1);
