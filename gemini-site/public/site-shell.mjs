import {themeButtonMarkup,bindThemeControls} from './site-theme.mjs';
const names={
 en:['Home','Inventory','Services & Tint','Calculators','Contact','FAQ'],
 zh:['首页','现车','服务与隔热膜','购车计算器','联系','常见问题'],
 ms:['Utama','Inventori','Servis & Tinted','Kalkulator','Hubungi','FAQ']
};
function syncNavigation(){
 const base=new URL(window.SITE_BASE||'/',location.origin).pathname.replace(/\/$/,'')||'/';
 const path=location.pathname.replace(/\/$/,'')||'/';
 const index=path.endsWith('/services')?2:path.endsWith('/tools')?3:path===base?(location.hash==='#inventory'?1:location.hash==='#contact'?4:location.hash==='#contactFaq'?5:0):/\/(vehicle|stock)\//.test(path)||path.endsWith('/audi')?1:-1;
 document.querySelectorAll('#top nav>a').forEach((link,i)=>{if(i===index)link.setAttribute('aria-current','page');else link.removeAttribute('aria-current');});
}
window.addEventListener('hashchange',syncNavigation);
export function renderShell(lang='en'){
 const base=window.SITE_BASE||'/';const header=document.querySelector('#top');if(!header)return;
 const nav=header.querySelector('nav'),links=names[lang]||names.en;
 const path=location.pathname.replace(/\/$/,'')||'/';
 const basePath=new URL(base,location.origin).pathname.replace(/\/$/,'')||'/';
 nav.innerHTML=[base,base+'#inventory',base+'services/',base+'tools/',base+'#contact',base+'#contactFaq'].map((u,i)=>{const active=i===2?path.endsWith('/services'):i===3?path.endsWith('/tools'):i===0?path===basePath&&!location.hash:i===1?location.hash==='#inventory'||path.includes('/vehicle/')||path.includes('/stock/')||path.endsWith('/audi'):i===4?location.hash==='#contact':i===5?location.hash==='#contactFaq':false;return `<a href="${u}"${active?' aria-current="page"':''}>${links[i]}</a>`;}).join('');
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
  select.parentElement.dataset.languageControl='true';
 });
 document.dispatchEvent(new Event('danny:choices-refresh'));
}

function bindScrollHeader(header){
 if(header.dataset.scrollBound)return;header.dataset.scrollBound='true';
 let previous=scrollY,pending=false;
 const show=()=>header.classList.remove('header-is-hidden','is-hidden');
 addEventListener('scroll',()=>{if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;const current=Math.max(0,scrollY),delta=current-previous;if(Math.abs(delta)<7&&current>120)return;header.classList.toggle('header-is-hidden',current>120&&delta>0&&!header.querySelector(':focus-visible')&&!header.querySelector('[aria-expanded="true"]')&&!header.classList.contains('menu-open'));previous=current;});},{passive:true});
 header.addEventListener('focusin',show);addEventListener('hashchange',show);
}
