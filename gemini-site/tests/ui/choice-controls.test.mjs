import {test} from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {installChoiceControls} from '../../public/choice-controls.mjs';

const tick = () => new Promise(resolve => setTimeout(resolve, 15));
function setup(t, html, mobile = false) {
 const dom = new JSDOM(html, {url: 'https://example.test/', pretendToBeVisual: true});
 dom.window.matchMedia = () => ({matches: mobile});
 const doc = dom.window.document;
 const controller = installChoiceControls(doc);
 t.after(() => {controller.destroy(); dom.window.close();});
 return {dom, doc, controller};
}
const opts = n => Array.from({length: n}, (_, i) => `<option value="car-${i}">Car ${i}</option>`).join('');

test('a two-choice field is directly selectable with keyboard and submits one native form value', async t => {
 const {dom, doc} = setup(t, '<form><label>Transmission<select name="transmission"><option>Auto</option><option>Manual</option></select></label></form>');
 const radios = doc.querySelectorAll('[role=radio]'); assert.equal(radios.length, 2);
 assert.equal(doc.querySelector('[role=combobox]'), null);
 let changes = 0; doc.querySelector('select').addEventListener('change', () => changes++);
 radios[0].focus(); radios[0].dispatchEvent(new dom.window.KeyboardEvent('keydown', {key:'ArrowRight', bubbles:true}));
 assert.equal(doc.querySelector('select').value, 'Manual');
 assert.deepEqual([...new dom.window.FormData(doc.querySelector('form'))], [['transmission','Manual']]);
 assert.equal(changes, 1); assert.equal(radios[1].getAttribute('aria-checked'), 'true');
});

test('long stock lists can be searched, selected and retain a visible value', t => {
 const {doc} = setup(t, `<label>Choose stock<select name="stock">${opts(21)}</select></label>`);
 const trigger = doc.querySelector('[role=combobox]'); trigger.click();
 const search = doc.querySelector('.choice-search'); assert.ok(search);
 search.value = 'Car 17'; search.dispatchEvent(new doc.defaultView.Event('input', {bubbles:true}));
 assert.equal(doc.querySelectorAll('[role=option]').length, 1);
 doc.querySelector('[role=option]').click();
 assert.equal(doc.querySelector('select').value, 'car-17');
 assert.equal(trigger.textContent, 'Car 17'); assert.equal(doc.querySelector('.choice-panel'), null);
});

test('external presets, form reset and dynamically added options stay synchronized', async t => {
 const {dom, doc} = setup(t, `<form><label>Status<select name="status">${opts(4)}</select></label><button type="button" id="preset">Apply preset</button></form>`);
 const select = doc.querySelector('select'); doc.querySelector('#preset').onclick = () => {select.value = 'car-2';};
 doc.querySelector('#preset').click(); await tick();
 assert.equal(doc.querySelector('[aria-checked=true]').textContent, 'Car 2');
 select.add(new dom.window.Option('Car 4','car-4')); await tick();
 assert.equal(doc.querySelector('[role=radiogroup]'), null); assert.ok(doc.querySelector('[role=combobox]'));
 doc.querySelector('form').reset(); await tick();
 assert.equal(doc.querySelector('[role=combobox]').textContent, 'Car 0');
 select.disabled = true; await tick(); assert.equal(doc.querySelector('[role=combobox]').disabled, true);
});

test('required radio choices report native validation and focus the visible control', t => {
 const {doc} = setup(t, '<form><label>Condition<select name="condition" required><option value="">Choose…</option><option>Recond</option><option>Pre-owned</option></select></label></form>');
 const form = doc.querySelector('form'); assert.equal(form.checkValidity(), false);
 assert.equal(doc.activeElement.getAttribute('role'), 'radio');
 assert.equal(doc.querySelector('.choice-error').hidden, false);
 doc.querySelector('[role=radio]').click(); assert.equal(form.checkValidity(), true);
});

test('a disabled option cannot be selected and commands expose menu semantics', t => {
 const {doc} = setup(t, `<label>Action<select data-choice-kind="command"><option value="">Choose action</option>${opts(6)}</select></label>`);
 const select = doc.querySelector('select'); select.options[2].disabled = true;
 // Refresh once for the server-driven disabled state.
 doc.querySelector('.choice-trigger').click();
 assert.ok(doc.querySelector('[role=menu]')); assert.equal(doc.querySelector('[role=listbox]'), null);
 const unavailable = [...doc.querySelectorAll('[role=menuitem]')].find(b => b.textContent === 'Car 1');
 assert.equal(unavailable.disabled, true); unavailable.click(); assert.equal(select.value, '');
 doc.querySelector('[role=menuitem]').click(); assert.equal(doc.querySelector('.choice-trigger').textContent, 'Choose action');
});

test('mobile selectors use a bottom sheet near the bottom, and scrolling its list keeps it open', t => {
 const {dom, doc} = setup(t, `<label>Car<select>${opts(12)}</select></label>`, true);
 const trigger = doc.querySelector('.choice-trigger'); trigger.getBoundingClientRect = () => ({bottom:700,top:650,left:12,width:280});
 trigger.click(); assert.equal(doc.querySelector('.choice-panel').dataset.mode, 'sheet');
 assert.equal(doc.documentElement.style.overflow, 'hidden');
 doc.querySelector('.choice-list').dispatchEvent(new dom.window.Event('scroll', {bubbles:true}));
 assert.ok(doc.querySelector('.choice-panel'));
 doc.querySelector('.choice-search').dispatchEvent(new dom.window.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));
 assert.equal(doc.querySelector('.choice-panel'), null); assert.equal(doc.documentElement.style.overflow, ''); assert.equal(doc.activeElement, trigger);
});

test('upper mobile controls expand downward, and removing their form clears the open panel', async t => {
 const {doc} = setup(t, `<form><label>Car<select>${opts(6)}</select></label></form>`, true);
 const trigger = doc.querySelector('.choice-trigger'); trigger.getBoundingClientRect = () => ({bottom:90,top:46,left:12,width:280});
 trigger.click(); const panel = doc.querySelector('.choice-panel');
 assert.equal(panel.dataset.mode, 'anchored'); assert.equal(panel.style.top, '96px');
 assert.equal(panel.querySelector('input[type=search]'), null);
 doc.querySelector('form').remove(); await tick(); assert.equal(doc.querySelector('.choice-panel'), null);
});

test('a filter that rerenders its form fires one change and retains the selected visible state', async t => {
 const {doc, controller} = setup(t, `<main><label>Sort<select id="sort">${opts(2)}</select></label></main>`);
 assert.equal(installChoiceControls(doc), controller);
 let changes = 0;
 doc.querySelector('select').onchange = e => {
  changes++;
  doc.querySelector('main').innerHTML = `<label>Sort<select id="sort"><option value="car-0">Car 0</option><option value="car-1" selected>Car 1</option></select></label>`;
 };
 doc.querySelectorAll('[role=radio]')[1].click(); await tick();
 assert.equal(changes, 1); assert.equal(doc.querySelectorAll('[role=radiogroup]').length, 1);
 assert.equal(doc.querySelector('[aria-checked=true]').textContent, 'Car 1');
 assert.equal(doc.querySelector('select').value, 'car-1');
});

test('compact language controls and explicit select presentations stay dropdowns', t => {
 const {doc}=setup(t,'<label>Language<select aria-label="Language"><option>EN</option><option>中文</option><option>BM</option></select></label><label>Sort<select data-choice-presentation="select"><option>Low to high</option><option>High to low</option></select></label>');
 assert.equal(doc.querySelectorAll('[role=combobox]').length,2);
 assert.equal(doc.querySelector('[role=radiogroup]'),null);
});

test('restored language preferences synchronize when the page finishes rendering', async t => {
 const {doc}=setup(t,'<label>Language<select aria-label="Language"><option value="en">EN</option><option value="zh">中文</option><option value="ms">BM</option></select></label><main></main>');
 doc.querySelector('select').value='zh';
 doc.querySelector('main').textContent='页面内容';
 await tick();
 assert.equal(doc.querySelector('[role=combobox]').textContent,'中文');
});
