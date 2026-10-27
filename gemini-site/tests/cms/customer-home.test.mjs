import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM} from 'jsdom';

for(const width of [1280,390])test(`homepage at ${width}px renders stock states, saved deliveries and the exact address`,async t=>{
 const template=readFileSync(new URL('../../out/index.html',import.meta.url),'utf8');
 const css=readFileSync(new URL('../../public/customer-refinements.css',import.meta.url),'utf8');
 const fixture=JSON.parse(readFileSync(new URL('../../data/public-site.json',import.meta.url),'utf8')).document;
 const car=fixture.vehicles[0];
 fixture.vehicles=['available','reserved','sold'].map((status,i)=>({...car,id:`fixture-${status}`,stockId:`CHECK-${i}`,status,priceRm:200000+i*1000}));
 Object.assign(fixture.vehicles[0],{auctionGrade:'',interiorGrade:'',conditionExample:false,transmission:'AMG SPEEDSHIFT 9G automatic'});
 fixture.homepage.showSoldVehicles=true;
 fixture.profile.location='Bukit Jelutong, Glenmarie, Shah Alam';
 const dom=new JSDOM(template,{url:'https://preview.test/',pretendToBeVisual:true});
 const win=dom.window;win.CMS_DATA=fixture;win.CMS_CONTENT_CURRENT=true;win.SITE_BASE='/';
 Object.defineProperty(win,'innerWidth',{value:width});
 win.matchMedia=query=>({matches:/max-width:\s*(\d+)px/.test(query)?width<=Number(query.match(/max-width:\s*(\d+)px/)[1]):/min-width:\s*(\d+)px/.test(query)?width>=Number(query.match(/min-width:\s*(\d+)px/)[1]):false,addEventListener(){},removeEventListener(){}});
 const previous=new Map();
 const globals={scrollY:0,scrollX:0,innerWidth:width,innerHeight:900,addEventListener:win.addEventListener.bind(win),removeEventListener:win.removeEventListener.bind(win),getComputedStyle:win.getComputedStyle.bind(win),CustomEvent:win.CustomEvent,Event:win.Event,window:win,document:win.document,location:win.location,localStorage:win.localStorage,sessionStorage:win.sessionStorage,Element:win.Element,HTMLElement:win.HTMLElement,HTMLInputElement:win.HTMLInputElement,IntersectionObserver:class{observe(){}unobserve(){}disconnect(){}},requestAnimationFrame:()=>0,cancelAnimationFrame(){},matchMedia:win.matchMedia,fetch:async()=>new Response('{}',{status:200})};
 for(const [key,value] of Object.entries(globals)){previous.set(key,Object.getOwnPropertyDescriptor(globalThis,key));Object.defineProperty(globalThis,key,{value,writable:true,configurable:true});}
 t.after(()=>{dom.window.close();for(const [key,descriptor] of previous){if(descriptor)Object.defineProperty(globalThis,key,descriptor);else delete globalThis[key];}});
 await import(`../../public/showroom.mjs?customer-check=${Date.now()}`);
 await new Promise(resolve=>setImmediate(resolve));
 const style=win.document.createElement('style');style.textContent=css;win.document.head.append(style);
 const all=[...win.document.querySelectorAll('#inventoryGrid .stock-card')];assert.equal(all.length,3);
 const ungraded=win.document.querySelector('[data-id="fixture-available"] .spec-row');
 assert.doesNotMatch(ungraded.textContent,/AMG|SPEEDSHIFT|automatic/);
 assert.equal(ungraded.querySelector('.listing-grade'),null);
 assert.match(win.document.querySelector('[data-id="fixture-reserved"] .spec-row').textContent,/Grade.*4.5\/B/);
 for(const card of all){
  const status=card.dataset.status,badge=card.querySelector('.photo-status');
  assert.equal(badge.dataset.status,status);
  assert.equal(win.getComputedStyle(badge).backgroundColor,status==='available'?'rgb(8, 127, 91)':'rgb(189, 49, 56)');
  assert.equal(Boolean(card.querySelector('.stock-price s')),status!=='available');
  if(status!=='available')assert.equal(win.getComputedStyle(card.querySelector('.stock-photo img')).filter,'grayscale(1)');
 }
 const location=win.document.querySelector('#contact [data-showroom-address]');
 assert.match(location.textContent,/4, Jalan Para U8\/103/);
 const map=win.document.querySelector('#contact [data-showroom-map]');assert.match(decodeURIComponent(map.src),/4, Jalan Para U8\/103/);
 assert.equal(win.document.querySelectorAll('.concierge-title-row .brand-logo').length,0);
 assert.equal(win.document.querySelector('.concierge-name').textContent,'Danny Ong');
 for(const review of win.document.querySelectorAll('.testimonial-body')){
  assert.match(review.querySelector('.testimonial-verified').textContent,/Example review/);
  assert.equal(review.querySelector('.testimonial-stars').textContent,'★★★★★');
  assert.doesNotMatch(review.textContent,/Marcus Tan|Jason Lim|Kelvin Wong|Mont Kiara|Subang Jaya|Petaling Jaya|Verified Owner/);
 }
 const compact=win.document.querySelector('[data-view="compact"]');compact.click();
 const rows=[...win.document.querySelectorAll('#inventoryGrid .compact-row')];assert.equal(rows.length,3);
 assert.doesNotMatch(win.document.querySelector('[data-id="fixture-available"] .compact-meta').textContent,/AMG|SPEEDSHIFT|automatic/);
 for(const row of rows)assert.equal(Boolean(row.querySelector('.stock-price s')),row.dataset.status!=='available');
});
