import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root = fileURLToPath(new URL('..', import.meta.url));
const result = spawnSync(process.execPath, ['scripts/build-github-pages.mjs'], {
 cwd: root,
 stdio: 'inherit',
 env: {...process.env, PAGES_BASE_PATH: '/', PAGES_OUTPUT: 'dist-cloudflare'},
});
process.exit(result.status ?? 1);
