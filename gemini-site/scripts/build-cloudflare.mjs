import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root = fileURLToPath(new URL('..', import.meta.url));
const result = spawnSync(process.execPath, ['scripts/build-github-pages.mjs'], {
 cwd: root,
 stdio: 'inherit',
 env: {...process.env, PAGES_BASE_PATH: '/', PAGES_OUTPUT: 'dist-cloudflare', OWNER_WORKER_BUILD: '1'},
});
if(result.error)throw result.error;
if(result.status !== 0)process.exit(result.status ?? 1);
const {buildOwnerLogin}=await import('./build-owner-login.mjs');
await buildOwnerLogin(fileURLToPath(new URL('../dist-cloudflare/',import.meta.url)));
