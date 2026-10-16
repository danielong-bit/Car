import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {photoUrl} from '../../public/browser-stock.mjs';
test('canonical and already prefixed photo paths resolve once on GitHub Pages',async()=>{
 assert.equal(await photoUrl('/assets/car.jpg','/Car-Recond-Japan/'),'/Car-Recond-Japan/assets/car.jpg');
 assert.equal(await photoUrl('/Car-Recond-Japan/assets/car.jpg','/Car-Recond-Japan/'),'/Car-Recond-Japan/assets/car.jpg');
 assert.equal(await photoUrl('/assets/car.jpg','/'),'/assets/car.jpg');
});
test('an empty public stock snapshot builds and native upload keys remain canonical',async()=>{
 await mkdir('.test-pages',{recursive:true});
 await writeFile('.test-pages/empty.json',JSON.stringify({document:{vehicles:[],stories:[],profile:{phone:'60125686528'},homepage:{},finance:{}}}));
 execFileSync(process.execPath,['scripts/build-github-pages.mjs'],{env:{...process.env,PAGES_SNAPSHOT_PATH:'.test-pages/empty.json',PAGES_OUTPUT:'.test-pages/site'},stdio:'pipe'});
 const html=await readFile('.test-pages/site/index.html','utf8'),storage=await readFile('.test-pages/site/browser-stock.mjs','utf8'),workbench=await readFile('.test-pages/site/workbench.mjs','utf8');
 assert.match(html,/window.SITE_BASE="\/Car-Recond-Japan\/"/);
 assert.ok(storage.includes("canonical.startsWith('/assets/uploads/')"));
 assert.ok(!storage.includes("startsWith('/Car-Recond-Japan/assets/") );
 assert.ok(workbench.includes("files['public'+url]"));
 assert.ok(workbench.includes("p.startsWith('/assets/uploads/')"));
 assert.ok(!html.includes('DEMO SHOWROOM'));
});
