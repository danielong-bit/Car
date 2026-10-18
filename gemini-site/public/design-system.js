/* Theme state and customer entry points shared by the entire Danny Recon site. */
(() => {
  const names = { apex: 'Tokyo Apex', sapphire: 'Sapphire Stealth', gold: 'Kyoto Prestige', platinum: 'Platinum Pearl' };
  function savedTheme() { try { return localStorage.getItem('jrcg_theme') || window.CMS_DATA?.homepage?.theme || 'platinum'; } catch { return 'platinum'; } }
  function applyTheme(value, persist = false, origin) {
    const theme = names[value] ? value : 'platinum';
    const paint=()=>{document.documentElement.dataset.theme=theme;};
    const old=document.documentElement.dataset.theme;
    if(persist&&old!==theme&&document.startViewTransition&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
      const rect=origin?.getBoundingClientRect();const x=rect?rect.left+rect.width/2:innerWidth/2,y=rect?rect.top+rect.height/2:0;
      const radius=Math.hypot(Math.max(x,innerWidth-x),Math.max(y,innerHeight-y));
      const transition=document.startViewTransition(paint);transition.ready.then(()=>document.documentElement.animate({clipPath:[`circle(0px at ${x}px ${y}px)`,`circle(${radius}px at ${x}px ${y}px)`]},{duration:480,easing:'cubic-bezier(.2,.7,.2,1)',pseudoElement:'::view-transition-new(root)'})).catch(paint);
    }else paint();
    if (persist) { try { localStorage.setItem('jrcg_theme', theme); } catch {} }
    const name = document.getElementById('currentThemeName');
    if (name) name.textContent = names[theme];
    document.querySelectorAll('[data-set-theme],.theme-choice-btn').forEach(button => {
      const selected = (button.dataset.setTheme || button.dataset.theme) === theme;
      button.classList.toggle('active', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'platinum' ? '#f5f6f8' : '#10141b');
    window.dispatchEvent(new CustomEvent('danny:theme-change', { detail: { theme } }));
  }
  function whatsappURL(message) { return 'https://wa.me/' + (window.CMS_DATA?.profile?.phone || '60125686528') + '?text=' + encodeURIComponent(message); }
  function localDate(date) { return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`; }
  function vehicleEnquiry(vehicle) {
    return ['Hello Danny, I am interested in this Japan recon car:', '', `${vehicle.year} ${vehicle.brand} ${vehicle.model}`, `Stock: ${vehicle.stockId || vehicle.id}`, `Listed price: ${vehicle.price}`, `Page: ${location.origin}/vehicle/${encodeURIComponent(vehicle.id)}`, `Mileage: ${vehicle.mileage}`, `Engine: ${vehicle.engine}`, '', 'Please share the availability, auction sheet, and showroom viewing details.'].join('\n');
  }
  window.DannyDesign = Object.freeze({ applyTheme, whatsappURL, localDate, vehicleEnquiry });
  applyTheme(savedTheme());
  window.addEventListener('storage', event => { if (event.key === 'jrcg_theme') applyTheme(savedTheme()); });
  window.addEventListener('jrcg:data-change', event => { if (event.detail?.scope === 'theme') applyTheme(savedTheme()); });
  function init() {
    applyTheme(savedTheme());
    const wrap = document.getElementById('themeSwitcherWrap');
    const toggle = document.getElementById('themeToggleBtn');
    const menu = document.getElementById('themeDropdownMenu');
    const close = () => { if (menu) menu.hidden = true; toggle?.setAttribute('aria-expanded','false'); };
    toggle?.addEventListener('click', () => { const open = menu.hidden; menu.hidden = !open; toggle.setAttribute('aria-expanded',String(open)); });
    menu?.querySelectorAll('[data-set-theme]').forEach(button => button.addEventListener('click', () => {
      applyTheme(button.dataset.setTheme, true, toggle); close(); toggle.focus();
    }));
    document.addEventListener('click', event => { if (wrap && !wrap.contains(event.target)) close(); });
    document.addEventListener('keydown', event => { if (event.key === 'Escape' && menu && !menu.hidden) { close(); toggle.focus(); } });
    document.querySelectorAll('[data-whatsapp-vehicle]').forEach(link => {
      const vehicle = window.JRCG?.catalog().find(row => row.id === link.dataset.whatsappVehicle);
      if (vehicle) link.href = whatsappURL(vehicleEnquiry(vehicle));
    });
    document.querySelectorAll('[data-danny-whatsapp]').forEach(link => { link.href = whatsappURL('Hello Danny, I would like to enquire about your Japan recon cars.'); });
    const tip = document.querySelector('.calc-tip-btn');
    const tipWrap = tip?.closest('.calc-quick-tip-wrap');
    if (tip && tipWrap) {
      tip.tabIndex = 0; tipWrap.removeAttribute('role'); tipWrap.removeAttribute('tabindex');
      tip.addEventListener('click', () => { const open = tipWrap.classList.toggle('is-visible'); tip.setAttribute('aria-expanded',String(open)); });
      document.addEventListener('click', event => { if (!tipWrap.contains(event.target)) { tipWrap.classList.remove('is-visible'); tip.setAttribute('aria-expanded','false'); } });
      document.addEventListener('keydown', event => { if (event.key === 'Escape') { tipWrap.classList.remove('is-visible'); tip.setAttribute('aria-expanded','false'); } });
    }
    const groups = document.querySelectorAll('#calcTenureTabs,#downPaymentPresets,#interestRatePresets');
    groups.forEach(group => {
      const sync = () => group.querySelectorAll('button').forEach(button => button.setAttribute('aria-pressed',String(button.classList.contains('active'))));
      sync(); new MutationObserver(sync).observe(group,{subtree:true,attributes:true,attributeFilter:['class']});
    });
    const amount = document.getElementById('calcMonthlyAmount');
    if (amount) {
      const status = document.createElement('p'); status.className = 'ds-visually-hidden'; status.setAttribute('role','status'); document.getElementById('loanCalculator').append(status);
      let timer; const update = () => { clearTimeout(timer); timer = setTimeout(() => { status.textContent = `Estimated monthly payment: RM ${amount.textContent}, over ${document.getElementById('calcLoanPeriod').value} years.`; },300); };
      new MutationObserver(update).observe(amount,{childList:true,characterData:true,subtree:true});
    }
    if (new URLSearchParams(location.search).get('viewing') === '1') document.getElementById('bookViewingBtn')?.click();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',init); else init();
})();
