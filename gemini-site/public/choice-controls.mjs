// The native select remains the source of form values, validation and change events.
// Commands explicitly opt in with data-choice-kind="command".
export function installChoiceControls(doc = document) {
 const installationKey = Symbol.for('danny.choiceControls');
 if (doc[installationKey]) return doc[installationKey];
 const win = doc.defaultView;
 const states = new Map();
 let serial = 0, opened = null;
 const defer = fn => win.requestAnimationFrame ? win.requestAnimationFrame(fn) : win.setTimeout(fn, 0);
 const words = () => {
  const lang = doc.documentElement.lang || 'en';
  return lang.startsWith('zh') ? ['搜索选项…', '没有符合的选项', '关闭'] : lang.startsWith('ms') ? ['Cari pilihan…', 'Tiada pilihan sepadan', 'Tutup'] : ['Search options…', 'No matching options', 'Close'];
 };
 const button = (text, className) => {
  const b = doc.createElement('button'); b.type = 'button'; b.className = className; b.textContent = text; return b;
 };
 const options = select => [...select.options].filter(o => !(o.value === '' && (o.disabled || select.required || select.dataset.choiceKind === 'command')));
 const disabled = (select, option) => select.disabled || option.disabled || (option.parentElement?.tagName === 'OPTGROUP' && option.parentElement.disabled);
 function labelFor(select) {
  if (select.getAttribute('aria-label')) return select.getAttribute('aria-label');
  const ids = select.getAttribute('aria-labelledby')?.split(/\s+/);
  if (ids?.length) return ids.map(id => doc.getElementById(id)?.textContent || '').join(' ').trim();
  const label = select.labels?.[0]?.cloneNode(true);
  label?.querySelectorAll('select,input,button,small,.choice-host,.field-quick-group').forEach(n => n.remove());
  return label?.textContent.trim().replace(/\s+/g, ' ') || select.name || 'Choose an option';
 }
 function focusControl(state) {
  const target = state.host.querySelector('[role=radio][aria-checked=true]') || state.host.querySelector('button:not(:disabled)');
  target?.focus({preventScroll: true});
 }
 function close(restore = true) {
  if (!opened) return;
  const {state, panel, mode, overflow} = opened;
  opened = null;
  if (mode === 'sheet') {
   doc.documentElement.style.overflow = overflow;
   if (panel.open && panel.close) panel.close();
  } else if (panel.dataset.popover === 'true') panel.hidePopover();
  panel.remove(); state.trigger?.setAttribute('aria-expanded', 'false');
  if (restore && state.select.isConnected) focusControl(state);
 }
 function choose(state, value) {
  const {select} = state;
  const option = options(select).find(o => o.value === value);
  if (!option || disabled(select, option)) return;
  close(false);
  const changed = select.value !== value || state.command;
  select.value = value;
  if (changed) {
   select.dispatchEvent(new win.Event('input', {bubbles: true}));
   select.dispatchEvent(new win.Event('change', {bubbles: true}));
  }
  refresh(state);
  // Existing filters may replace the entire form when their value changes.
  const id = select.id, name = select.name, formId = select.form?.id;
  defer(() => {
   const next = select.isConnected ? select : id ? doc.getElementById(id) : formId && name ? doc.getElementById(formId)?.elements.namedItem(name) : null;
   if (next && states.has(next)) focusControl(states.get(next));
  });
 }
 function open(state, last = false) {
  if (state.select.disabled) return;
  close(false);
  const {select, trigger} = state;
  const all = options(select), rect = trigger.getBoundingClientRect();
  const viewportHeight = win.visualViewport?.height || win.innerHeight;
  const sheet = win.matchMedia?.('(max-width: 700px)').matches && rect.bottom > viewportHeight * .6;
  const panel = doc.createElement('dialog');
  panel.className = 'choice-panel'; panel.dataset.mode = sheet ? 'sheet' : 'anchored';
  panel.setAttribute('aria-label', state.label); panel.id = state.id + '-panel';
  const heading = doc.createElement('div'); heading.className = 'choice-panel-heading';
  const title = doc.createElement('strong'); title.textContent = state.label;
  const dismiss = button('×', 'choice-close'); dismiss.setAttribute('aria-label', words()[2]); dismiss.onclick = () => close();
  heading.append(title, dismiss); panel.append(heading);
  let search;
  if (all.length > 10) {
   search = doc.createElement('input'); search.type = 'search'; search.className = 'choice-search';
   search.placeholder = words()[0]; search.setAttribute('aria-label', words()[0]); search.autocomplete = 'off';
   panel.append(search);
  }
  const list = doc.createElement('div'); list.className = 'choice-list';
  list.id = state.id + '-list';
  list.setAttribute('role', state.command ? 'menu' : 'listbox'); list.setAttribute('aria-label', state.label); panel.append(list);
  const renderOptions = () => {
   list.replaceChildren();
   const query = (search?.value || '').trim().toLocaleLowerCase();
   const visible = all.filter(o => (o.label + ' ' + (o.parentElement?.label || '')).toLocaleLowerCase().includes(query));
   for (const o of visible) {
    const item = button(o.label, 'choice-list-option'); item.dataset.value = o.value;
    item.setAttribute('role', state.command ? 'menuitem' : 'option');
    if (!state.command) item.setAttribute('aria-selected', String(o.selected));
    item.disabled = disabled(select, o); item.tabIndex = -1;
    item.onclick = () => choose(state, o.value); list.append(item);
   }
   if (!visible.length) {
    const empty = doc.createElement('p'); empty.className = 'choice-empty'; empty.setAttribute('role', 'status'); empty.textContent = words()[1]; list.append(empty);
   }
  };
  renderOptions(); search?.addEventListener('input', renderOptions);
  const parentDialog = select.closest('dialog[open]');
  (parentDialog || doc.body).append(panel);
  opened = {state, panel, mode: sheet ? 'sheet' : 'anchored', overflow: doc.documentElement.style.overflow};
  trigger.setAttribute('aria-expanded', 'true'); trigger.setAttribute('aria-controls', list.id);
  if (sheet) {
   doc.documentElement.style.overflow = 'hidden';
   if (panel.showModal) panel.showModal(); else panel.setAttribute('open', '');
  } else {
   if (panel.showPopover) { panel.setAttribute('popover', 'manual'); panel.showPopover(); panel.dataset.popover = 'true'; }
   else if (panel.show) panel.show(); else panel.setAttribute('open', '');
   const availableBelow = viewportHeight - rect.bottom - 12;
   const above = availableBelow < 160 && rect.top > availableBelow && !win.matchMedia?.('(max-width: 700px)').matches;
   const available = Math.max(80, above ? rect.top - 12 : availableBelow);
   panel.style.maxHeight = Math.min(264, available) + 'px';
   panel.style.width = Math.min(Math.max(rect.width, 240), win.innerWidth - 24) + 'px';
   panel.style.left = Math.max(12, Math.min(rect.left, win.innerWidth - parseFloat(panel.style.width) - 12)) + 'px';
   if (above) panel.style.bottom = viewportHeight - rect.top + 6 + 'px'; else panel.style.top = rect.bottom + 6 + 'px';
  }
  const enabled = () => [...list.querySelectorAll('button:not(:disabled)')];
  const initial = search || list.querySelector('[aria-selected=true]:not(:disabled)') || (last ? enabled().at(-1) : enabled()[0]) || dismiss;
  initial.focus({preventScroll: true});
  panel.addEventListener('cancel', e => { e.preventDefault(); close(); });
  panel.addEventListener('click', e => { if (e.target === panel) { const r = panel.getBoundingClientRect(); if (e.clientY < r.top || e.clientY > r.bottom || e.clientX < r.left || e.clientX > r.right) close(); } });
  panel.addEventListener('keydown', e => {
   if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(); return; }
   if (e.key === 'Tab' && !sheet) { close(); return; }
   if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) return;
   if (e.target === search && ['Home', 'End'].includes(e.key)) return;
   e.preventDefault(); const items = enabled(); if (!items.length) return;
   const index = items.indexOf(doc.activeElement);
   const next = e.key === 'Home' ? 0 : e.key === 'End' ? items.length - 1 : index < 0 ? (e.key === 'ArrowUp' ? items.length - 1 : 0) : (index + (e.key === 'ArrowUp' ? -1 : 1) + items.length) % items.length;
   items[next].focus({preventScroll: true}); items[next].scrollIntoView?.({block: 'nearest'});
  });
 }
 function refresh(state) {
  const {select, host} = state;
  if (!select.isConnected) return;
  const all = options(select), inline = all.length > 0 && all.length < 5 && !host.dataset.language && select.dataset.choicePresentation !== 'select';
  const signature = JSON.stringify([inline, state.command, all.map(o => [o.value, o.label, disabled(select, o)])]);
  if (signature !== state.signature) {
   if (opened?.state === state) close(false);
   state.signature = signature; host.replaceChildren();
   if (inline) {
    const group = doc.createElement('div'); group.className = 'choice-options'; group.setAttribute('role', state.command ? 'group' : 'radiogroup'); group.setAttribute('aria-label', state.label);
    if (all.length > 2 && all.some(o => o.label.length > 28)) group.classList.add('choice-options--cards');
    if (all.some(o => o.label.length > 90)) group.classList.add('choice-options--stacked');
    for (const o of all) {
     const item = button(o.label, 'choice-option'); item.dataset.value = o.value; item.disabled = disabled(select, o);
     if (!state.command) item.setAttribute('role', 'radio');
     item.onclick = e => { e.preventDefault(); choose(state, o.value); };
     group.append(item);
    }
    group.addEventListener('keydown', e => {
     if (state.command || !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(e.key)) return;
     e.preventDefault(); const items = [...group.querySelectorAll('button:not(:disabled)')]; if (!items.length) return;
     const index = items.indexOf(doc.activeElement);
     const next = e.key === 'Home' ? 0 : e.key === 'End' ? items.length - 1 : (index + (['ArrowLeft', 'ArrowUp'].includes(e.key) ? -1 : 1) + items.length) % items.length;
     items[next].focus(); choose(state, items[next].dataset.value);
    });
    host.append(group); state.trigger = null;
   } else {
    const trigger = button('', 'choice-trigger'); state.trigger = trigger;
    trigger.setAttribute('role', state.command ? 'button' : 'combobox'); trigger.setAttribute('aria-haspopup', state.command ? 'menu' : 'listbox');
    trigger.setAttribute('aria-expanded', 'false'); trigger.setAttribute('aria-label', state.label);
    trigger.onclick = e => { e.preventDefault(); if (opened?.state === state) close(); else open(state); };
    trigger.onkeydown = e => { if (['ArrowDown', 'ArrowUp'].includes(e.key)) { e.preventDefault(); open(state, e.key === 'ArrowUp'); } };
    host.append(trigger);
   }
   const error = doc.createElement('span'); error.className = 'choice-error'; error.id = state.id + '-error'; error.setAttribute('role', 'alert'); error.hidden = true; host.append(error);
  }
  if (state.trigger) {
   state.trigger.textContent = state.command ? (select.options[0]?.label || state.label) : (select.options[select.selectedIndex]?.label || state.label);
   state.trigger.disabled = select.disabled || all.length === 0;
   if (!state.command) state.trigger.setAttribute('aria-required', String(select.required));
  } else {
   const items = [...host.querySelectorAll('.choice-option')], selected = items.find(b => b.dataset.value === select.value && !b.disabled);
   items.forEach(b => { if (!state.command) { b.setAttribute('aria-checked', String(b === selected)); b.tabIndex = b === (selected || items.find(x => !x.disabled)) ? 0 : -1; } });
   host.querySelector('[role=radiogroup]')?.setAttribute('aria-required', String(select.required));
  }
  if (select.validity.valid) {
   host.classList.remove('is-invalid'); host.querySelector('.choice-error').hidden = true;
   host.querySelector('[role=combobox],[role=radiogroup]')?.removeAttribute('aria-invalid');
  }
  state.lastValue = select.value;
 }
 function enhance(select) {
  if (select.multiple || select.dataset.choiceIgnore !== undefined || states.has(select)) return;
  const state = {select, label: labelFor(select), command: select.dataset.choiceKind === 'command', id: 'choice-' + ++serial};
  const host = doc.createElement('div'); host.className = 'choice-host'; state.host = host;
  if (/language/i.test(select.id + select.getAttribute('aria-label') + select.name)) host.dataset.language = 'true';
  select.after(host); states.set(select, state);
  state.oldTabIndex = select.getAttribute('tabindex'); state.oldAriaHidden = select.getAttribute('aria-hidden');
  select.classList.add('choice-native'); select.tabIndex = -1; select.setAttribute('aria-hidden', 'true');
  state.sync = () => refresh(state); select.addEventListener('change', state.sync);
  state.invalid = e => {
   e.preventDefault(); host.classList.add('is-invalid'); const error = host.querySelector('.choice-error'); error.textContent = select.validationMessage; error.hidden = false;
   const control = host.querySelector('[role=combobox],[role=radiogroup]');
   control?.setAttribute('aria-invalid', 'true'); control?.setAttribute('aria-describedby', error.id);
   for (let parent = select.parentElement; parent; parent = parent.parentElement) if (parent.tagName === 'DETAILS') parent.open = true;
   focusControl(state);
  };
  select.addEventListener('invalid', state.invalid);
  refresh(state);
 }
 function dispose(select, state) {
  if (opened?.state === state) close(false);
  state.host.remove(); select.classList.remove('choice-native');
  if (state.oldTabIndex === null) select.removeAttribute('tabindex'); else select.setAttribute('tabindex', state.oldTabIndex);
  if (state.oldAriaHidden === null) select.removeAttribute('aria-hidden'); else select.setAttribute('aria-hidden', state.oldAriaHidden);
  select.removeEventListener('change', state.sync); select.removeEventListener('invalid', state.invalid);
  states.delete(select);
 }
 function scan(root = doc) {
  if (root.matches?.('select')) enhance(root);
  root.querySelectorAll?.('select').forEach(enhance);
 }
 const observer = new win.MutationObserver(records => {
  const changed = new Set();
  for (const record of records) {
   const select = record.target.closest?.('select'); if (select && states.has(select)) changed.add(states.get(select));
   if (record.type === 'childList') record.addedNodes.forEach(n => { if (n.nodeType === 1 && !n.closest?.('.choice-host,.choice-panel')) scan(n); });
  }
  for (const [select, state] of states) {
   if (!select.isConnected) dispose(select, state);
   else if (select.value !== state.lastValue) refresh(state);
  }
  changed.forEach(refresh);
 });
 const outside = e => { if (opened && !opened.panel.contains(e.target) && !opened.state.host.contains(e.target)) close(false); };
 const reset = e => win.setTimeout(() => states.forEach(state => { if (state.select.form === e.target) refresh(state); }), 0);
 // Preset buttons can assign select.value without emitting change. Synchronize after
 // the existing interaction finishes, without replacing native DOM property setters.
 const syncAfterInteraction = () => win.queueMicrotask(() => states.forEach(state => {
  if (state.select.value !== state.lastValue) refresh(state);
 }));
 const reposition = e => { if (opened?.mode === 'anchored' && !(e.target?.nodeType && opened.panel.contains(e.target))) close(false); };
 scan(); observer.observe(doc.body, {subtree: true, childList: true, attributes: true, attributeFilter: ['disabled', 'selected', 'label', 'value', 'required']});
 doc.addEventListener('pointerdown', outside, true); doc.addEventListener('reset', reset, true);
 const refreshAll = () => { scan(); states.forEach(refresh); };
 doc.addEventListener('danny:choices-refresh', refreshAll);
 for (const event of ['click','input','change','drop']) doc.addEventListener(event, syncAfterInteraction, true);
 win.addEventListener('resize', reposition); doc.addEventListener('scroll', reposition, true);
 const api = {refresh: refreshAll, destroy: () => {
  close(false); observer.disconnect(); doc.removeEventListener('pointerdown', outside, true); doc.removeEventListener('reset', reset, true); win.removeEventListener('resize', reposition); doc.removeEventListener('scroll', reposition, true);
  for (const event of ['click','input','change','drop']) doc.removeEventListener(event, syncAfterInteraction, true);
  doc.removeEventListener('danny:choices-refresh', refreshAll); delete doc[installationKey];
  for (const [select, state] of states) dispose(select, state);
 }};
 doc[installationKey] = api;
 return api;
}

if (typeof document !== 'undefined') {
 if (document.body) installChoiceControls(); else document.addEventListener('DOMContentLoaded', () => installChoiceControls(), {once: true});
}
