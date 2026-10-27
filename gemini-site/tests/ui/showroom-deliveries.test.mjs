import {test} from 'node:test';
import assert from 'node:assert/strict';
import {normalizeStory} from '../../public/inventory-domain.mjs';
import {JSDOM} from 'jsdom';
import {SHOWROOMS,showroomLocationOptions,showroomLocationsMarkup,bindShowroomLocations} from '../../public/showroom-locations.mjs';
import {displayPhoto} from '../../public/photo-sources.mjs';
import {optimizedPhotos} from '../../public/optimized-photos.mjs';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

test('an intentionally empty caption survives saving, normalizing and reloading',()=>{
 const input={id:'delivery',title:'Porsche',caption:'',date:'Mai Auto (Bukit Jelutong)',published:true,consent:'approved'};
 const reloaded=normalizeStory(JSON.parse(JSON.stringify(normalizeStory(input))));
 assert.equal(reloaded.caption,'');
 assert.equal(normalizeStory({...input,caption:'  My own caption  '}).caption,'My own caption');
});

test('all three showroom controls change the address, map, navigation and copied text together',async()=>{
 const dom=new JSDOM('<div id="host">'+showroomLocationsMarkup()+'</div>');
 const host=dom.window.document.querySelector('#host');let copied;
 bindShowroomLocations(host,{copy:async value=>{copied=value;}});
 for(const showroom of SHOWROOMS){
  host.querySelector(`[data-showroom="${showroom.id}"]`).click();
  assert.equal(host.querySelector('[data-showroom-address]').textContent,showroom.address);
  assert.ok(decodeURIComponent(host.querySelector('iframe').src).includes(showroom.address));
  assert.ok(decodeURIComponent(host.querySelector('[data-showroom-maps]').href).includes(showroom.address));
  assert.equal(host.querySelectorAll('[aria-pressed=true]').length,1);
  await host.querySelector('[data-copy-showroom]').onclick();assert.equal(copied,showroom.address);
 }
});

test('location select preserves blank and existing legacy values and recognizes Zaman spelling',()=>{
 for(const value of ['', 'Mai Auto (Bukit Jelutong)', 'Zaman Motor (Glenmarie)', 'Old custom location']){
  const dom=new JSDOM('<select>'+showroomLocationOptions(value)+'</select>');
  const actual=dom.window.document.querySelector('select').value;
  assert.equal(actual,value==='Zaman Motor (Glenmarie)'?'Zaman Motors (Glenmarie)':value);
 }
});

test('known uploads use lightweight copies while unknown uploads and external hosts remain intact',()=>{
 const key=Object.keys(optimizedPhotos)[0];
 assert.equal(displayPhoto('https://danny.stocklist.workers.dev'+key,'card'),optimizedPhotos[key].card);
 assert.equal(displayPhoto(key,'detail','/preview/'),'/preview'+optimizedPhotos[key].detail);
 assert.equal(displayPhoto('https://other.example'+key),'https://other.example'+key);
 assert.equal(displayPhoto('/assets/uploads/new.webp'),'/assets/uploads/new.webp');
});

test('the actual homepage renderer shows the saved caption and location without filling blank captions',()=>{
 const dom=new JSDOM('<div id="deliveryRail"></div><div><button id="deliveryPrev"></button><button id="deliveryNext"></button></div>');
 const source=readFileSync(new URL('../../public/showroom.mjs',import.meta.url),'utf8');
 const renderer=source.slice(source.indexOf('function renderDeliveries()'),source.indexOf('function renderHome()'));
 const context={document:dom.window.document,$:s=>dom.window.document.querySelector(s),d:{vehicles:[],stories:[
  normalizeStory({id:'one',title:'Porsche Panamera',caption:'My saved caption',date:'Mai Auto (Bukit Jelutong)'}),
  normalizeStory({id:'two',title:'Lexus RX',caption:''})
 ]},lang:'en',esc:s=>String(s??'').replaceAll('<','&lt;'),tr:en=>en,staticImgSrc:s=>s,deliveryCarousel:null,startDeliveryCarousel:()=>({destroy(){}})};
 vm.createContext(context);vm.runInContext(renderer+';renderDeliveries();',context);
 const cards=dom.window.document.querySelectorAll('.delivery-card');
 assert.equal(cards[0].querySelector('blockquote').textContent,'My saved caption');
 assert.equal(cards[0].querySelector('footer small').textContent,'Mai Auto (Bukit Jelutong)');
 assert.equal(cards[1].querySelector('blockquote'),null);
 assert.equal(cards[1].querySelector('footer strong').textContent,'Lexus RX');
 dom.window.close();
});
