import {themeButtonMarkup,bindThemeControls} from './site-theme.mjs';
let languageControlId=0;
const names={
 en:['Home','Inventory','Services & Tint','Calculators','Contact'],
 zh:['首页','现车','服务与隔热膜','购车计算器','联系'],
 ms:['Utama','Inventori','Servis & Tinted','Kalkulator','Hubungi']
};
function syncNavigation(){
 const base=new URL(window.SITE_BASE||'/',location.origin).pathname.replace(/\/$/,'')||'/';
 const path=location.pathname.replace(/\/$/,'')||'/';
 const index=path.endsWith('/services')?2:path.endsWith('/tools')?3:path===base?(location.hash==='#inventory'?1:location.hash==='#contact'?4:0):/\/(vehicle|stock)\//.test(path)||path.endsWith('/audi')?1:-1;
 document.querySelectorAll('#top nav>a').forEach((link,i)=>{if(i===index)link.setAttribute('aria-current','page');else link.removeAttribute('aria-current');});
}
window.addEventListener('hashchange',syncNavigation);
export function renderShell(lang='en'){
 const base=window.SITE_BASE||'/';const header=document.querySelector('#top');if(!header)return;
 const nav=header.querySelector('nav'),links=names[lang]||names.en;
 const path=location.pathname.replace(/\/$/,'')||'/';
 const basePath=new URL(base,location.origin).pathname.replace(/\/$/,'')||'/';
 nav.innerHTML=[base,base+'#inventory',base+'services/',base+'tools/',base+'#contact'].map((u,i)=>{const active=i===2?path.endsWith('/services'):i===3?path.endsWith('/tools'):i===0?path===basePath&&!location.hash:i===1?location.hash==='#inventory'||path.includes('/vehicle/')||path.includes('/stock/')||path.endsWith('/audi'):i===4?location.hash==='#contact':false;return `<a href="${u}"${active?' aria-current="page"':''}>${links[i]}</a>`;}).join('');
 const actions=header.querySelector('.header-actions');if(actions&&!actions.querySelector('[data-theme-control]'))actions.insertAdjacentHTML('afterbegin',themeButtonMarkup());
 if(!header.querySelector('.mobile-menu-toggle')){header.insertAdjacentHTML('beforeend','<button class="mobile-menu-toggle" type="button" aria-label="Open navigation" aria-expanded="false"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg></button>');const toggle=header.querySelector('.mobile-menu-toggle');toggle.onclick=()=>{const open=toggle.getAttribute('aria-expanded')!=='true';toggle.setAttribute('aria-expanded',String(open));header.classList.toggle('menu-open',open);};nav.onclick=()=>{header.classList.remove('menu-open');toggle.setAttribute('aria-expanded','false');};}
 const toggle=header.querySelector('.mobile-menu-toggle');
 if(toggle)toggle.setAttribute('aria-label',lang==='zh'?'打开导航菜单':lang==='ms'?'Buka navigasi':'Open navigation');
 syncNavigation();
 bindThemeControls();
 enhanceLanguageControls();
 bindScrollHeader(header);
}

export function enhanceLanguageControls(){
 document.querySelectorAll('.language-control select,.danny-language select').forEach(select=>{
  if(select.dataset.enhanced)return;select.dataset.enhanced='true';select.classList.add('language-native');select.tabIndex=-1;select.setAttribute('aria-hidden','true');
  const host=select.parentElement;host.classList.add('language-picker');host.dataset.languageControl='true';
  const button=document.createElement('button');button.type='button';button.className='language-trigger';button.setAttribute('aria-label','Choose language');button.setAttribute('aria-haspopup','listbox');button.setAttribute('aria-expanded','false');
  const menu=document.createElement('div');menu.className='language-menu';menu.id=`language-menu-${++languageControlId}`;menu.hidden=true;menu.setAttribute('role','listbox');menu.setAttribute('aria-label','Language');button.setAttribute('aria-controls',menu.id);host.append(button,menu);
  const labels={en:'English',zh:'简体中文',ms:'Bahasa Melayu'},short={en:'EN',zh:'中文',ms:'BM'};
  const sync=()=>{button.innerHTML=`<span>${short[select.value]||'EN'}</span><svg class="language-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m7 10 5 5 5-5"/></svg>`;menu.replaceChildren();Object.entries(labels).forEach(([value,label])=>{const option=document.createElement('button');option.type='button';option.setAttribute('role','option');option.setAttribute('aria-selected',String(select.value===value));option.textContent=label+(select.value===value?' ✓':'');option.onclick=e=>{e.preventDefault();select.value=value;close();select.dispatchEvent(new Event('change',{bubbles:true}));sync();button.focus();};menu.append(option);});};
  const close=()=>{menu.hidden=true;button.setAttribute('aria-expanded','false');};
  button.onclick=e=>{e.preventDefault();menu.hidden=!menu.hidden;button.setAttribute('aria-expanded',String(!menu.hidden));if(!menu.hidden)menu.querySelector('[aria-selected=true]')?.focus();};
  host.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();close();button.focus();}if(['ArrowDown','ArrowUp','Home','End'].includes(e.key)){e.preventDefault();menu.hidden=false;button.setAttribute('aria-expanded','true');const options=[...menu.children],i=options.indexOf(document.activeElement),next=e.key==='Home'?0:e.key==='End'?options.length-1:(i+(e.key==='ArrowDown'?1:-1)+options.length)%options.length;options[next].focus();}});
  host.addEventListener('focusout',e=>{if(!host.contains(e.relatedTarget))close();});
  host.addEventListener('pointerdown',e=>e.stopPropagation());select.addEventListener('change',sync);sync();
 });
}
document.addEventListener('pointerdown',()=>document.querySelectorAll('.language-menu').forEach(menu=>{menu.hidden=true;menu.parentElement.querySelector('.language-trigger')?.setAttribute('aria-expanded','false');}));

function bindScrollHeader(header){
 if(header.dataset.scrollBound)return;header.dataset.scrollBound='true';
 let previous=scrollY,pending=false;
 const show=()=>header.classList.remove('header-is-hidden');
 addEventListener('scroll',()=>{if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;const current=Math.max(0,scrollY),delta=current-previous;if(Math.abs(delta)<7&&current>120)return;header.classList.toggle('header-is-hidden',current>120&&delta>0&&!header.querySelector(':focus-visible')&&!header.querySelector('[aria-expanded="true"]')&&!header.classList.contains('menu-open'));previous=current;});},{passive:true});
 header.addEventListener('focusin',show);addEventListener('hashchange',show);
}
