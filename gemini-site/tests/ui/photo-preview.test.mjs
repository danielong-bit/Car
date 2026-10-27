import {test} from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {createPhotoInspector} from '../../public/photo-inspector.mjs';
import {vehiclePreviewDocument} from '../../public/vehicle-preview.mjs';
import {publicContent} from '../../content-contracts.mjs';

const tick=()=>new Promise(resolve=>setImmediate(resolve));
test('photo preview opens at the clicked photograph, navigates, shows the draft crop, and restores scrolling',async()=>{
 const dom=new JSDOM('<body style="overflow:auto"></body>',{url:'https://local.test/studio/'});
 const doc=dom.window.document,photos=[{url:'/assets/a.jpg',cropX:25,cropY:70},{url:'/assets/b.jpg',cropX:60,cropY:20}];
 const inspector=createPhotoInspector(doc,{load:async path=>path});
 inspector.dialog.showModal=()=>inspector.dialog.setAttribute('open','');
 inspector.dialog.close=()=>{inspector.dialog.removeAttribute('open');inspector.dialog.dispatchEvent(new dom.window.Event('close'));};
 inspector.open(()=>photos,1,'BMW · STOCK');await tick();
 assert.equal(doc.body.style.overflow,'hidden');
 assert.equal(inspector.dialog.querySelector('img').getAttribute('src'),'/assets/b.jpg');
 assert.equal(inspector.dialog.querySelector('output').textContent,'2 / 2');
 assert.equal(inspector.dialog.querySelector('img').style.objectPosition,'60% 20%');
 inspector.dialog.querySelector('[data-inspector-prev]').click();await tick();
 assert.equal(inspector.dialog.querySelector('img').getAttribute('src'),'/assets/a.jpg');
 inspector.dialog.querySelector('[data-preview-mode=framed]').click();
 assert.equal(inspector.dialog.querySelector('.photo-inspector-stage').dataset.mode,'framed');
 assert.equal(inspector.dialog.querySelector('img').style.objectPosition,'25% 70%');
 inspector.dialog.close();assert.equal(doc.body.style.overflow,'auto');dom.window.close();
});

test('unsaved vehicle preview includes current edits and photos without changing the saved document or publishing a draft',()=>{
 const original={vehicles:[{id:'car',stockId:'STOCK',make:'BMW',model:'525LI',priceRm:100,status:'available',gallery:[{url:'/assets/old.jpg'}]}],homepage:{},profile:{},finance:{},stories:[]};
 const editing={...original.vehicles[0],priceRm:250,status:'draft',internalCost:123,gallery:[{url:'/assets/new.jpg',cropX:75,cropY:35}]};
 const before=structuredClone(original);
 const preview=publicContent(vehiclePreviewDocument(original,editing));
 assert.equal(preview.vehicles[0].priceRm,250);assert.equal(preview.vehicles[0].gallery[0].cropY,35);
 assert.equal(preview.vehicles[0].internalCost,undefined);assert.deepEqual(original,before);assert.equal(editing.status,'draft');
});
