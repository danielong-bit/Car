import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root = fileURLToPath(new URL('..', import.meta.url));
const result = spawnSync(process.execPath, ['scripts/build-github-pages.mjs'], {
 cwd: root,
 stdio: 'inherit',
 env: {...process.env, PAGES_BASE_PATH: '/', PAGES_OUTPUT: 'dist-cloudflare', OWNER_WORKER_BUILD: '1'},
});
if(result.status)process.exit(result.status);
const {buildOwnerLogin}=await import('./build-owner-login.mjs');
await buildOwnerLogin(fileURLToPath(new URL('../dist-cloudflare/',import.meta.url)));
