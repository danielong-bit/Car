import {test} from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {galleryMarkup,bindGallery} from '../../public/vehicle-gallery.mjs';
import {suggestFrame,frameControlsMarkup,bindPhotoFraming} from '../../public/photo-framing.mjs';
import {normalizeVehicle} from '../../public/inventory-domain.mjs';

const tick=()=>new Promise(resolve=>setImmediate(resolve));
test('Next warms nearby photos and never pairs a new count with the previous photo while loading',async t=>{
 const photos=['a','b','c'].map((name,index)=>({url:`/assets/${name}.jpg`,category:index===1?'Interior':'Exterior'}));
 const dom=new JSDOM(galleryMarkup(photos,'Car','en')+'<dialog id="photoModal"><div class="lightbox-stage"></div><img id="lightboxPhoto"><span id="photoTitle"></span><span id="lightboxCount"></span><button id="lightboxPrevious"></button><button id="lightboxNext"></button></dialog>',{url:'https://local.test/'});
 const previous=new Map(),pending=new Map(),loads=[];
 class FakeImage{set src(value){this.source=value;loads.push(value);}decode(){return new Promise(resolve=>pending.set(this.source,resolve));}}
 for(const [key,value] of Object.entries({document:dom.window.document,window:dom.window,Image:FakeImage})){
  previous.set(key,Object.getOwnPropertyDescriptor(globalThis,key));Object.defineProperty(globalThis,key,{value,configurable:true,writable:true});
 }
 t.after(()=>{dom.window.close();for(const [key,value] of previous){if(value)Object.defineProperty(globalThis,key,value);else delete globalThis[key];}});
 const doc=dom.window.document;
 doc.querySelector('#galleryThumbnails').scrollTo=()=>{};
 bindGallery(photos,'Car','en','/',()=>{});await tick();
 pending.get('/assets/a.jpg')();await tick();
 assert.ok(loads.includes('/assets/b.jpg'));assert.ok(loads.includes('/assets/c.jpg'));
 doc.querySelector('#galleryNext').click();await tick();
 assert.equal(doc.querySelector('#vehicleGallery').dataset.photoLoading,'true');
 assert.equal(doc.querySelector('#galleryStageCount').textContent,'1 / 3');
 pending.get('/assets/b.jpg')();await tick();
 assert.equal(doc.querySelector('#activePhoto').getAttribute('src'),'/assets/b.jpg');
 assert.equal(doc.querySelector('#galleryStageCount').textContent,'2 / 3');
 assert.equal(doc.querySelector('#galleryCaption').textContent,'Interior');
 doc.querySelector('#galleryNext').click();doc.querySelector('#galleryPrevious').click();await tick();
 pending.get('/assets/c.jpg')();await tick();
 assert.equal(doc.querySelector('#activePhoto').getAttribute('src'),'/assets/b.jpg');
 assert.equal(doc.querySelector('#galleryStageCount').textContent,'2 / 3');
 assert.equal(loads.filter(url=>url==='/assets/b.jpg').length,1);
});

test('automatic framing follows a high-contrast subject and keeps uniform images centred',()=>{
 const width=100,height=40,data=new Uint8ClampedArray(width*height*4);
 assert.deepEqual(suggestFrame({data,width,height}),{cropX:50,cropY:50});
 for(let y=8;y<32;y++)for(let x=75;x<94;x++){
  const i=(y*width+x)*4;data[i]=data[i+1]=data[i+2]=(x+y)%2?255:0;data[i+3]=255;
 }
 const frame=suggestFrame({data,width,height});assert.ok(frame.cropX>60);assert.equal(frame.cropY,50);
});

test('range and numeric framing controls synchronize, reset, and survive vehicle saving',async()=>{
 const photo={id:'one',url:'/assets/car.jpg',cropX:50,cropY:35};
 const dom=new JSDOM('<article><img>'+frameControlsMarkup(0,photo)+'</article>');
 const tile=dom.window.document.querySelector('article');let changed=0,bubbled=false;
 tile.addEventListener('pointerdown',()=>{bubbled=true;});
 let activePhotos=[photo];
 bindPhotoFraming([tile],()=>activePhotos,{onChange:()=>changed++,analyze:async()=>({cropX:75,cropY:60})});
 const range=tile.querySelector('[data-crop][data-axis=cropX]');
 range.dispatchEvent(new dom.window.Event('pointerdown',{bubbles:true}));assert.equal(bubbled,false);
 range.value='72';range.dispatchEvent(new dom.window.Event('input'));
 assert.equal(photo.cropX,72);assert.equal(tile.querySelector('[data-crop-number][data-axis=cropX]').value,'72');
 const number=tile.querySelector('[data-crop-number][data-axis=cropY]');number.value='200';number.dispatchEvent(new dom.window.Event('input'));
 assert.equal(photo.cropY,100);
 await tile.querySelector('[data-auto-frame]').onclick({currentTarget:tile.querySelector('[data-auto-frame]')});
 assert.equal(photo.cropX,75);assert.equal(photo.cropY,60);
 assert.equal(normalizeVehicle({gallery:[photo]}).gallery[0].cropY,60);
 tile.querySelector('[data-reset-frame]').click();assert.equal(photo.cropX,50);assert.equal(photo.cropY,50);
 assert.ok(changed>=5);dom.window.close();
});

test('framing continues to edit the current photo record after another field normalizes the vehicle',()=>{
 let photos=[{url:'/assets/a.jpg',cropX:50,cropY:50}];
 const dom=new JSDOM('<article><img>'+frameControlsMarkup(0,photos[0])+'</article>');
 const tile=dom.window.document.querySelector('article');
 bindPhotoFraming([tile],()=>photos);
 photos=normalizeVehicle({gallery:photos}).gallery;
 const input=tile.querySelector('[data-crop][data-axis=cropY]');input.value='65';input.dispatchEvent(new dom.window.Event('input'));
 assert.equal(photos[0].cropY,65);dom.window.close();
});

test('photo zoom previews immediately and is retained when saving or resetting',()=>{
 const photo={url:'/assets/car.jpg',cropX:50,cropY:50};
 const dom=new JSDOM('<article><img>'+frameControlsMarkup(0,photo)+'</article>');
 const tile=dom.window.document.querySelector('article'); bindPhotoFraming([tile],[photo]);
 const zoom=tile.querySelector('[data-crop][data-axis=cropZoom]'); assert.ok(zoom);
 zoom.value='150';zoom.dispatchEvent(new dom.window.Event('input'));
 assert.equal(photo.cropZoom,150);assert.equal(tile.querySelector('img').style.transform,'scale(1.5)');
 assert.equal(normalizeVehicle({gallery:[photo]}).gallery[0].cropZoom,150);
 tile.querySelector('[data-reset-frame]').click();assert.equal(photo.cropZoom,100);
 dom.window.close();
});
