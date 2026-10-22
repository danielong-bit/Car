import {themeButtonMarkup,bindThemeControls} from './site-theme.mjs';
const names={en:['Home','Inventory','Services & Tint','Contact'],zh:['首页','现车','服务与隔热膜','联系'],ms:['Utama','Inventori','Servis & Tinted','Hubungi']};
export function renderShell(lang='en'){
 const base=window.SITE_BASE||'/';const header=document.querySelector('#top');if(!header)return;
 const nav=header.querySelector('nav'),links=names[lang]||names.en;
 nav.innerHTML=[base,base+'#inventory',base+'services/',base+'#contact'].map((u,i)=>`<a href="${u}">${links[i]}</a>`).join('');
 const actions=header.querySelector('.header-actions');if(actions&&!actions.querySelector('[data-theme-control]'))actions.insertAdjacentHTML('afterbegin',themeButtonMarkup());
 if(!header.querySelector('.mobile-menu-toggle')){header.insertAdjacentHTML('beforeend','<button class="mobile-menu-toggle" type="button" aria-label="Open navigation" aria-expanded="false"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg></button>');const toggle=header.querySelector('.mobile-menu-toggle');toggle.onclick=()=>{const open=toggle.getAttribute('aria-expanded')!=='true';toggle.setAttribute('aria-expanded',String(open));header.classList.toggle('menu-open',open);};nav.onclick=()=>{header.classList.remove('menu-open');toggle.setAttribute('aria-expanded','false');};}
 bindThemeControls();
 enhanceLanguageControls();
 const footer=document.querySelector('#siteFooter .footer-column');if(footer&&!document.querySelector('[data-footer-tools]'))footer.insertAdjacentHTML('beforeend',`<a data-footer-tools href="${base}tools/">${lang==='zh'?'月供与路税':lang==='ms'?'Kalkulator & JPJ':'Calculator & JPJ'}</a>`);
}

export function enhanceLanguageControls(){
 document.querySelectorAll('.language-control select,.danny-language select').forEach(select=>{
  if(select.dataset.enhanced)return;select.dataset.enhanced='true';select.classList.add('language-native');select.tabIndex=-1;select.setAttribute('aria-hidden','true');
  const host=select.parentElement;host.classList.add('language-picker');host.dataset.languageControl='true';
  const button=document.createElement('button');button.type='button';button.className='language-trigger';button.setAttribute('aria-label','Choose language');button.setAttribute('aria-haspopup','listbox');button.setAttribute('aria-expanded','false');
  const menu=document.createElement('div');menu.className='language-menu';menu.hidden=true;menu.setAttribute('role','listbox');menu.setAttribute('aria-label','Language');host.append(button,menu);
  const labels={en:'English',zh:'简体中文',ms:'Bahasa Melayu'},short={en:'EN',zh:'中文',ms:'BM'};
  const sync=()=>{button.textContent='◎ '+short[select.value]+' ⌄';menu.replaceChildren();Object.entries(labels).forEach(([value,label])=>{const option=document.createElement('button');option.type='button';option.setAttribute('role','option');option.setAttribute('aria-selected',String(select.value===value));option.textContent=label+(select.value===value?' ✓':'');option.onclick=e=>{e.preventDefault();select.value=value;close();select.dispatchEvent(new Event('change',{bubbles:true}));sync();button.focus();};menu.append(option);});};
  const close=()=>{menu.hidden=true;button.setAttribute('aria-expanded','false');};
  button.onclick=e=>{e.preventDefault();menu.hidden=!menu.hidden;button.setAttribute('aria-expanded',String(!menu.hidden));if(!menu.hidden)menu.querySelector('[aria-selected=true]')?.focus();};
  host.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();close();button.focus();}if(['ArrowDown','ArrowUp','Home','End'].includes(e.key)){e.preventDefault();menu.hidden=false;button.setAttribute('aria-expanded','true');const options=[...menu.children],i=options.indexOf(document.activeElement),next=e.key==='Home'?0:e.key==='End'?options.length-1:(i+(e.key==='ArrowDown'?1:-1)+options.length)%options.length;options[next].focus();}});
  host.addEventListener('focusout',e=>{if(!host.contains(e.relatedTarget))close();});
  host.addEventListener('pointerdown',e=>e.stopPropagation());select.addEventListener('change',sync);sync();
 });
}
document.addEventListener('pointerdown',()=>document.querySelectorAll('.language-menu').forEach(menu=>{menu.hidden=true;menu.parentElement.querySelector('.language-trigger')?.setAttribute('aria-expanded','false');}));
