import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM} from 'jsdom';
import {renderBuyingTools} from '../../public/buying-tools.mjs';
import {renderServiceCare} from '../../public/service-care.mjs';
import {showroomLocation,SHOWROOM_ADDRESS} from '../../public/showroom-location.mjs';

function page(t,html='<main id="host"></main>'){
 const dom=new JSDOM(html,{url:'https://preview.test/tools/'});
 const saved={window:globalThis.window,document:globalThis.document,location:globalThis.location,FormData:globalThis.FormData};
 Object.assign(globalThis,{window:dom.window,document:dom.window.document,location:dom.window.location,FormData:dom.window.FormData});
 t.after(()=>{dom.window.close();Object.assign(globalThis,saved);});
 return dom.window;
}
test('calculator offers inventory cars next to an editable custom price and clears stale car identity',t=>{
 const win=page(t),host=win.document.getElementById('host');
 const vehicles=[{id:'audi',stockId:'A1',make:'Audi',model:'S5',year:2025,status:'available',priceRm:438000,engineCc:2995,body:'Wagon'},{id:'sold',make:'Toyota',model:'Sold',status:'sold',priceRm:100000}];
 renderBuyingTools(host,{vehicles,profile:{phone:'60125686528'}},'en');
 const select=host.querySelector('#buyingCarPreset'),form=host.querySelector('#buyingLoan');
 assert.equal(select.closest('form'),form);
 assert.deepEqual([...select.options].map(x=>x.value),['','audi']);
 select.value='audi';select.dispatchEvent(new win.Event('change',{bubbles:true}));
 assert.equal(form.elements.price.value,'438000');
 assert.match(host.querySelector('#buyingPresetLink').getAttribute('href'),/vehicle\/audi/);
 assert.match(decodeURIComponent(host.querySelector('#buyingLoanWa').href),/Stock #A1/);
 form.elements.price.value='196000';form.elements.price.dispatchEvent(new win.Event('input',{bubbles:true}));
 assert.equal(select.value,'');
 assert.equal(host.querySelector('#buyingPresetLink').getAttribute('href'),'/#inventory');
 assert.doesNotMatch(decodeURIComponent(host.querySelector('#buyingLoanWa').href),/Stock #A1/);
 assert.match(host.querySelector('#buyingLoanBreakdown').textContent,/196,000/);
});
test('calculator retains manual price input when no inventory is available',t=>{
 const win=page(t),host=win.document.getElementById('host');renderBuyingTools(host,{vehicles:[]},'zh');
 assert.equal(host.querySelectorAll('#buyingCarPreset option').length,1);
 host.querySelector('#buyingLoan').elements.price.value='250000';
 host.querySelector('#buyingLoan').dispatchEvent(new win.Event('input',{bubbles:true}));
 assert.match(host.querySelector('#buyingMonthly').textContent,/RM/);
});
test('tint shade controls switch correctly and do not claim invented heat or temperature performance',t=>{
 const win=page(t),host=win.document.getElementById('host');
 renderServiceCare(host,[],'en',()=> 'https://wa.me/60125686528');
 host.querySelector('[data-vlt="30"]').click();
 assert.equal(host.querySelector('[data-vlt="30"]').getAttribute('aria-pressed'),'true');
 assert.equal(host.querySelector('[data-vlt="50"]').getAttribute('aria-pressed'),'false');
 const preview=host.querySelector('.tint-simulator-card');
 assert.match(preview.textContent,/Lower % = darker/);
 assert.doesNotMatch(preview.textContent,/°C|IRR|TSER|Executive|Obsidian|Solar Heat Rejection/);
 assert.match(preview.querySelector('.tint-sim-stage').getAttribute('style'),/0.62/);
});
test('light and dark selected tint buttons have explicit contrasting foregrounds',t=>{
 const css=readFileSync(new URL('../../public/customer-refinements.css',import.meta.url),'utf8');
 const win=page(t,`<style>${css}</style><section id="service-care"><button class="tint-vlt-btn" aria-pressed="true"><strong>50%</strong></button></section>`);
 const button=win.document.querySelector('button');
 win.document.documentElement.dataset.theme='light';
 assert.equal(win.getComputedStyle(button).backgroundColor,'rgb(23, 107, 74)');
 assert.equal(win.getComputedStyle(button).color,'rgb(255, 255, 255)');
 win.document.documentElement.dataset.theme='dark';
 assert.equal(win.getComputedStyle(button).backgroundColor,'rgb(200, 169, 126)');
 assert.equal(win.getComputedStyle(button).color,'rgb(16, 20, 25)');
});
test('all legacy short location values resolve to the full supplied workplace address',()=>{
 assert.equal(showroomLocation({location:'Bukit Jelutong, Glenmarie, Shah Alam'}),SHOWROOM_ADDRESS);
 assert.equal(showroomLocation({}),SHOWROOM_ADDRESS);
 assert.equal(showroomLocation({location:SHOWROOM_ADDRESS}),SHOWROOM_ADDRESS);
 assert.equal(showroomLocation({location:'New authorised showroom address'}),'New authorised showroom address');
});
