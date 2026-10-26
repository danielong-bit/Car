import {test} from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {compareStock,stockSortChoices,validStockSort} from '../../public/inventory-order.mjs';
import {buyerSpecificationGroups} from '../../public/buyer-specifications.mjs';
import {extraSpecificationText,updateExtraSpecifications} from '../../public/specification-editor.mjs';
import {startDeliveryCarousel} from '../../public/delivery-carousel.mjs';

const stock=[
 {id:'a',priceRm:300000,mileageKm:12000,year:2024},
 {id:'b',priceRm:200000,mileageKm:23000,year:2022},
 {id:'c',priceRm:null,mileageKm:null,year:null},
];
test('price, mileage and year sort both ways and place missing data last',()=>{
 for(const [key,expected] of [['price-up','bac'],['price-down','abc'],['mileage-up','abc'],['mileage-down','bac'],['year-new','abc'],['year-old','bac']]){
  assert.equal([...stock].sort(compareStock(key)).map(v=>v.id).join(''),expected,key);
 }
 assert.equal(stockSortChoices('en').length,6);assert.equal(stockSortChoices('zh')[2][1],'里程：少到多');
 assert.equal(validStockSort('mileage-down'),true);assert.equal(validStockSort('invalid'),false);
});
test('missing mileage labels stay last instead of being treated as zero kilometres',()=>{
 const cars=[{id:'unknown',mileage:'Not provided'},{id:'known',mileage:'12,500 km'}];
 assert.equal(cars.sort(compareStock('mileage-up'))[0].id,'known');
});
test('specifications omit duplicate overview facts and demo notes but retain useful equipment',()=>{
 const v={engine:'3.0L TFSI',exteriorColor:'Grey',specs:{Powertrain:[['Engine','3.0L TFSI'],['Power','349 hp (demo)'],['Drive','AWD']],Observed:[['Brakes','Red caliper visible']],'Vehicle status':[['Year','To verify']],Interior:[['Speakers','Bang & Olufsen'],['Model','Audi S5']]}};
 const original=structuredClone(v);
 const result=buyerSpecificationGroups(v,{auctionGrade:'4.5',interiorGrade:'B',example:true});
 assert.deepEqual(result.core,[['Engine','3.0L TFSI'],['Drive','AWD'],['Colour','Grey'],['Auction grade','4.5/B · Example']]);
 assert.deepEqual(result.additional,[['Speakers','Bang & Olufsen']]);
 assert.deepEqual(v,original);
});
test('technical specifications are separate from equipment and repeated equipment is shown once',()=>{
 const v={engine:'2.0L Turbo',transmission:'9G automatic',features:['4MATIC AWD','9G automatic','360° camera','Head-up display','Digital instrument cluster','Heated seats','Heated seats'],specs:{Powertrain:[['Drive','4MATIC AWD'],['Transmission','9G automatic']],Equipment:[['Camera','360° camera'],['Display','Head-up display and digital instrument cluster']]}};
 const groups=buyerSpecificationGroups(v);
 assert.deepEqual(groups.core,[['Engine','2.0L Turbo'],['Transmission','9G automatic'],['Drive','4MATIC AWD']]);
 assert.deepEqual(groups.features,['Heated seats']);
 assert.deepEqual(groups.additional,[['Camera','360° camera'],['Display','Head-up display and digital instrument cluster']]);
 assert.deepEqual(buyerSpecificationGroups({transmission:'Auto',features:['Automatic headlights']}).features,['Automatic headlights']);
});
test('owners can edit extra specifications without losing the existing technical source record',()=>{
 const v={engine:'2.0L Turbo',transmission:'Auto',specs:{Powertrain:[['Engine','2.0L Turbo'],['Drive','AWD']],Equipment:[['Camera','360° camera']],Observed:[['Seats','Leather visible']]}};
 assert.equal(extraSpecificationText(v),'Drive: AWD\nCamera: 360° camera');
 const edited={...v,specs:updateExtraSpecifications(v,'Drive: RWD\nAudio：Burmester: surround sound')};
 assert.equal(extraSpecificationText(edited),'Drive: RWD\nAudio: Burmester: surround sound');
 assert.deepEqual(edited.specs.Observed,v.specs.Observed);
 assert.deepEqual(buyerSpecificationGroups(edited).core,[['Engine','2.0L Turbo'],['Transmission','Auto'],['Drive','RWD']]);
 assert.throws(()=>updateExtraSpecifications(v,'Drive AWD'),/Name: Value/);
});
function carousel(t,reduced=false){
 const dom=new JSDOM('<div id="rail"><article></article><article></article><article></article></div><button id="previous"></button><button id="next"></button><button id="pause"></button>',{pretendToBeVisual:true});
 const doc=dom.window.document,rail=doc.querySelector('#rail');
 dom.window.matchMedia=()=>({matches:reduced,addEventListener(){},removeEventListener(){}});
 Object.defineProperties(rail,{clientWidth:{value:300},scrollWidth:{get:()=>rail.children.length*216-16}});
 rail.firstElementChild.getBoundingClientRect=()=>({width:200});rail.style.gap='16px';
 rail.scrollTo=({left})=>{rail.scrollLeft=left;};
 const api=startDeliveryCarousel(rail,{previous:doc.querySelector('#previous'),next:doc.querySelector('#next'),pause:doc.querySelector('#pause')});
 t.after(()=>{api.destroy();dom.window.close();});return {dom,doc,rail,api};
}
test('delivery autoplay advances one card at a time and loops at the end',t=>{
 const {rail,api}=carousel(t);api.advance();assert.equal(rail.scrollLeft,216);
 rail.scrollLeft=648;api.advance();assert.equal(rail.scrollLeft,216);
});
test('delivery autoplay pauses for hovering, manual navigation and the pause button',t=>{
 const {dom,doc,rail,api}=carousel(t);
 rail.dispatchEvent(new dom.window.Event('pointerenter'));api.advance();assert.equal(rail.scrollLeft,0);
 rail.dispatchEvent(new dom.window.Event('pointerleave'));api.advance();assert.equal(rail.scrollLeft,216);
 doc.querySelector('#next').click();assert.equal(rail.scrollLeft,432);api.advance();assert.equal(rail.scrollLeft,432);
 doc.querySelector('#pause').click();api.advance();assert.equal(rail.scrollLeft,648);
});
test('reduced motion starts the delivery slideshow paused',t=>{
 const {doc,rail,api}=carousel(t,true);api.advance();assert.equal(rail.scrollLeft,0);
 assert.equal(doc.querySelector('#pause').getAttribute('aria-pressed'),'true');
});
test('reinitializing the delivery rail replaces its old loop clones',t=>{
 const {doc,rail,api:first}=carousel(t);
 const second=startDeliveryCarousel(rail,{previous:doc.querySelector('#previous'),next:doc.querySelector('#next'),pause:doc.querySelector('#pause')});
 assert.equal(rail.children.length,6);
 assert.equal(rail.querySelectorAll('[data-carousel-clone="true"]').length,3);
 second.destroy();first.destroy();
});
