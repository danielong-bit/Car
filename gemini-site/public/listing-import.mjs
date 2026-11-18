const labels = {
  engine: 'engine', '引擎': 'engine', 'enjin': 'engine',
  'engine size': 'engineCc', 'engine capacity': 'engineCc', 'engine cc': 'engineCc', cc: 'engineCc', '排量': 'engineCc',
  transmission: 'transmission', gearbox: 'transmission', '变速箱': 'transmission', 'transmisi': 'transmission',
  fuel: 'fuelType', 'fuel type': 'fuelType', '燃料': 'fuelType',
  warranty: 'warrantyInfo', '保修': 'warrantyInfo', 'waranti': 'warrantyInfo',
  equipment: 'features', features: 'features', '配备': 'features', '配置': 'features', 'ciri': 'features',
};

function normalizeValue(field, value) {
  if (field === 'engineCc') {
    const match = value.match(/^([\d,]+)\s*(?:cc|cm³|cm3)?$/i);
    const capacity = match && Number(match[1].replaceAll(',', ''));
    return Number.isInteger(capacity) && capacity > 0 ? String(capacity) : '';
  }
  if (field === 'fuelType') {
    return {
      petrol: 'Petrol', gasoline: 'Petrol', diesel: 'Diesel', hybrid: 'Hybrid',
      'plug-in hybrid': 'Hybrid', phev: 'Hybrid', electric: 'Electric', ev: 'Electric',
      '汽油': 'Petrol', '柴油': 'Diesel', '混合动力': 'Hybrid', '电动': 'Electric',
    }[value.toLowerCase()] || '';
  }
  return value;
}

export function parseListingDetails(text) {
  const fields = {};
  const features = [];
  const unrecognized = [];
  let section = '';
  for (const raw of String(text || '').slice(0, 6000).split(/\r?\n/)) {
    const trimmed = raw.trim();
    const isBullet = /^[•✅✔✓*\-]/u.test(trimmed);
    const line = trimmed.replace(/^[✨•✅✔✓*\-]\s*/u, '');
    if (!line) {
      section = '';
      continue;
    }
    if (/[<>\u0000-\u0008]/u.test(line)) {
      unrecognized.push(line);
      continue;
    }
    const match = line.match(/^([^:：]+)[:：]\s*(.*)$/);
    const label = (match?.[1] ?? line).trim().toLowerCase();
    const key = Object.hasOwn(labels, label) ? labels[label] : undefined;
    if (label === 'performance' && !match?.[2]) {
      section = 'performance';
      continue;
    }
    if (key === 'features') {
      section = 'equipment';
      if (match?.[2]) features.push(...match[2].split(/[;,]/).map(item => item.trim()).filter(Boolean));
      continue;
    }
    if (!key && section === 'equipment' && isBullet) {
      features.push(line);
      continue;
    }
    if (!key && section === 'performance' && isBullet) {
      const kind = /\bengine$/i.test(line) ? 'engine' : /\btransmission$/i.test(line) ? 'transmission' : '';
      if (kind && !Object.hasOwn(fields, kind)) fields[kind] = line;
      else unrecognized.push(line);
      continue;
    }
    section = '';
    const value = key && match?.[2] ? normalizeValue(key, match[2].trim()) : '';
    if (value && !Object.hasOwn(fields, key)) fields[key] = value;
    else unrecognized.push(line);
  }
  const seen = new Set();
  return {fields, features:features.filter(feature=>{
    const key=feature.toLowerCase();
    if(seen.has(key))return false;
    seen.add(key);
    return true;
  }), unrecognized};
}

const fieldTitles = {
  engine: 'Engine', engineCc: 'Engine size (cc)', transmission: 'Transmission',
  fuelType: 'Fuel type', warrantyInfo: 'Warranty',
};

export function listingImportMarkup() {
  return `<details class="listing-import">
   <summary>Paste vehicle details</summary>
   <div class="listing-import-body">
    <label class="field">Dealer notes<textarea id="listingNotes" rows="5" maxlength="6000" placeholder="Engine: 2.4L Turbo&#10;Engine size: 2393 cc&#10;Transmission: 8-speed automatic&#10;Equipment: 360° camera, Panoramic roof&#10;Warranty: 5 years"></textarea></label>
    <div><button type="button" class="button quiet" id="reviewListingNotes">Review details</button></div>
    <div id="listingImportResult" hidden>
     <p id="listingImportSummary" role="status"></p>
     <ul id="listingImportMatches" aria-label="Recognized details"></ul>
     <label class="check-field" id="listingImportReplaceControl" hidden><input type="checkbox" id="listingImportReplace"> Replace existing values shown above</label>
     <details id="listingImportUnrecognized" hidden><summary>Lines to enter manually</summary><ul></ul></details>
     <button type="button" class="button quiet" id="applyListingNotes" hidden>Fill form</button>
    </div>
   </div>
  </details>`;
}

export function bindListingImport(form) {
  const notes = form.querySelector('#listingNotes');
  if (!notes) return;
  const result = form.querySelector('#listingImportResult');
  const summary = form.querySelector('#listingImportSummary');
  const matches = form.querySelector('#listingImportMatches');
  const replaceControl = form.querySelector('#listingImportReplaceControl');
  const replace = form.querySelector('#listingImportReplace');
  const unknown = form.querySelector('#listingImportUnrecognized');
  const apply = form.querySelector('#applyListingNotes');
  const addItem = (list, text) => {
    const li = document.createElement('li');
    li.textContent = text;
    list.append(li);
  };
  let reviewed;
  notes.addEventListener('input', () => {
    reviewed = undefined;
    result.hidden = true;
  });
  form.querySelector('#reviewListingNotes').onclick = () => {
    reviewed = parseListingDetails(notes.value);
    const pairs = Object.entries(reviewed.fields);
    matches.replaceChildren();
    unknown.querySelector('ul').replaceChildren();
    const conflicts = pairs.filter(([field, value]) => {
      const before = form.elements.namedItem(field).value.trim();
      return before && before !== value;
    });
    replace.checked = false;
    replaceControl.hidden = conflicts.length === 0;
    for (const [field, value] of pairs) {
      const before = form.elements.namedItem(field).value.trim();
      addItem(matches, `${fieldTitles[field]} · ${value}${before && before !== value ? ' (currently '+before+')' : ''}`);
    }
    for (const feature of reviewed.features) addItem(matches, 'Equipment · '+feature);
    for (const line of reviewed.unrecognized) addItem(unknown.querySelector('ul'), line);
    unknown.hidden = !reviewed.unrecognized.length;
    unknown.open = !pairs.length && !reviewed.features.length;
    apply.hidden = !pairs.length && !reviewed.features.length;
    summary.textContent = apply.hidden
      ? 'No labeled details found. Use the examples above or enter the details below.'
      : 'Check the details before filling the form.';
    result.hidden = false;
  };
  apply.onclick = () => {
    if (!reviewed) return;
    const setValue = (control, value) => {
      if (control.value === value) return;
      control.value = value;
      control.dispatchEvent(new Event('input', {bubbles:true}));
      control.dispatchEvent(new Event('change', {bubbles:true}));
    };
    for (const [field, value] of Object.entries(reviewed.fields)) {
      const control = form.elements.namedItem(field);
      if (!control.value.trim() || replace.checked) setValue(control, value);
    }
    const equipment = form.elements.namedItem('features');
    const existing = equipment.value.split('\n').map(item => item.trim()).filter(Boolean);
    const saved = new Set(existing.map(item => item.toLowerCase()));
    if (reviewed.features.length) setValue(equipment, [...existing,...reviewed.features.filter(item => !saved.has(item.toLowerCase()))].join('\n'));
    form.querySelectorAll('[data-toggle-feature]').forEach(button => {
      const name = button.dataset.toggleFeature;
      const selected = equipment.value.split('\n').includes(name);
      button.classList.toggle('is-active', selected);
      button.textContent = (selected ? '✓ ' : '+ ')+name;
    });
    apply.hidden = true;
    replaceControl.hidden = true;
    summary.textContent = 'Review the form below. Save as draft or publish when you’re ready.';
  };
}
