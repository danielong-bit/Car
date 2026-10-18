(() => {
  if (!document.body.classList.contains('select-home')) return;
  const $ = s => document.querySelector(s), d = window.CMS_DATA;
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const icon = name => `<img class="select-icon" src="/assets/icons/${name}.svg" alt="" aria-hidden="true" width="20" height="20">`;
  const inventory = $('#inventory'), filters = inventory.querySelector('.filters');
  const chipGroup = (id, label, visual) => {
    const field = $('#'+id), options = [...field.options];
    const group = document.createElement('div');
    group.className = 'select-chip-group'; group.setAttribute('role','group'); group.setAttribute('aria-label',label);
    group.innerHTML = `<span class="select-chip-label">${label}</span><div class="select-chip-row">${options.map(o => {
      const count = d.vehicles.filter(v => o.value==='all'||v[visual==='body'?'body':'brand']===o.value).length;
      return `<button type="button" data-filter-field="${id}" data-filter-value="${escape(o.value)}" aria-pressed="${field.value===o.value}">${visual==='body'?icon('car'):''}<span>${escape(o.value==='all'?'All '+label.toLowerCase():o.text)}</span><small>${count}</small></button>`;
    }).join('')}</div>`;
    filters.after(group);
    group.querySelectorAll('button').forEach(button => button.onclick = () => {
      window.DannyAllStock = true; inventory.classList.add('select-all-stock');
      field.value = button.dataset.filterValue; field.dispatchEvent(new Event('change',{bubbles:true}));
      sync();
    });
    return group;
  };
  const bodies = chipGroup('bodyFilter','Body types','body');
  const brands = chipGroup('brandFilter','Brands','brand');
  filters.after(brands); brands.after(bodies);
  $('#brandFilter').parentElement.classList.add('select-native-filter');
  $('#bodyFilter').parentElement.classList.add('select-native-filter');
  const searchLabel = $('#searchFilter').parentElement;
  searchLabel.insertAdjacentHTML('beforeend',icon('search'));
  $('#searchFilter').placeholder = 'Find your car. Try Audi S5 or Toyota';
  const hints = document.createElement('div'); hints.className='select-filter-feedback';
  hints.innerHTML='<div class="select-active-filters" aria-label="Active filters"></div><p>Choose two cars with Compare to see their specifications side by side.</p>';
  bodies.after(hints);
  const status = document.createElement('span'); status.className='select-copy-status'; status.setAttribute('role','status'); document.body.append(status);
  const sync = () => {
    if($('#searchFilter').value.trim()||['brandFilter','bodyFilter','yearFilter','mileageFilter','powerFilter'].some(id=>$('#'+id).value!=='all')){window.DannyAllStock=true;inventory.classList.add('select-all-stock');}
    document.querySelectorAll('[data-filter-field]').forEach(b => b.setAttribute('aria-pressed',String($('#'+b.dataset.filterField).value===b.dataset.filterValue)));
    const active = ['brandFilter','bodyFilter','yearFilter','mileageFilter','powerFilter'].map(id => $('#'+id)).filter(field=>field.value!=='all');
    hints.querySelector('.select-active-filters').innerHTML=active.map(field=>`<button type="button" data-clear-field="${field.id}" aria-label="Clear ${escape(field.selectedOptions[0].text)} filter">${escape(field.selectedOptions[0].text)} <span aria-hidden="true">×</span></button>`).join('');
    hints.querySelectorAll('[data-clear-field]').forEach(b=>b.onclick=()=>{const field=$('#'+b.dataset.clearField);field.value='all';field.dispatchEvent(new Event('change',{bubbles:true}));sync();});
    if(window.DannyAllStock){$('#inventory-title').textContent='Inventory';$('#selectAllInventory').textContent='Show Featured Only';}
  };
  filters.addEventListener('change',sync); filters.addEventListener('input',sync);
  $('#resetFilters').addEventListener('click',()=>queueMicrotask(sync));
  $('#selectAllInventory').addEventListener('click',()=>{if(!window.DannyAllStock&&typeof resetInventoryFilters==='function')resetInventoryFilters();queueMicrotask(sync);});
  $('#resultCount').setAttribute('role','status');
  const p=d.profile, contact=$('#contact');
  const wa=message=>'https://wa.me/'+p.phone+'?text='+encodeURIComponent(message);
  const map='https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(p.location);
  contact.innerHTML=`<div class="select-about-photo"><img src="${escape(p.portrait)}" alt="Danny, your recon car advisor" loading="lazy"></div><div class="select-about-copy"><h2>A car you love.<br>An advisor you know.</h2><p>${escape(p.intro)}</p><div class="select-contact-grid"><div class="select-contact-tile select-contact-direct"><span class="select-tile-icon">${icon('car')}</span><h3>Talk cars with Danny</h3><p>Ask about specifications, availability or a showroom viewing.</p><a class="select-button" href="${escape(wa('Hello Danny, I would like to enquire about a recon car and arrange a showroom viewing.'))}" target="_blank" rel="noopener">WhatsApp Danny ${icon('arrow-up-right')}</a><a class="select-email-link" href="mailto:${escape(p.email)}">${icon('mail')}Email Danny</a></div><div class="select-contact-tile"><span class="select-tile-icon">${icon('map-pin')}</span><h3>Meet at the showroom</h3><p class="select-about-location">${escape(p.location)}</p><div class="select-location-actions"><a href="${escape(map)}" target="_blank" rel="noopener">Open in Maps ${icon('arrow-up-right')}</a><button id="selectCopyLocation" type="button">${icon('copy')}Copy location</button></div><small>Message Danny to confirm the exact showroom and viewing time.</small></div></div><div class="select-follow"><div><strong>Get to know Danny.</strong><p>Car walkarounds and the latest showroom moments.</p></div><div class="select-social-links">${[['TikTok','tiktok',p.tiktok],['小红书','xiaohongshu',p.rednote],['Facebook','facebook',p.facebook||'https://www.facebook.com/reel/1834658307548568']].filter(x=>x[2]).map(([name,logo,url])=>`<a href="${escape(url)}" target="_blank" rel="noopener">${icon(logo)}<span>${name}</span>${icon('arrow-up-right')}</a>`).join('')}</div></div></div>`;
  $('#selectCopyLocation').onclick=async()=>{
    try { await navigator.clipboard.writeText(p.location); status.textContent='Location copied'; }
    catch { status.textContent='Copy this location:'; const input=document.createElement('input');input.value=p.location;input.setAttribute('aria-label','Location to copy');status.append(input);input.focus();input.select(); }
    status.classList.add('visible');setTimeout(()=>status.classList.remove('visible'),5000);
  };
  sync();
})();
