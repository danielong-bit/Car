import {themeButtonMarkup,bindThemeControls} from './site-theme.mjs';
const names={en:['Home','Inventory','Calculator & JPJ','Contact'],zh:['首页','现车','月供与路税','联系'],ms:['Utama','Inventori','Kalkulator & JPJ','Hubungi']};
export function renderShell(lang='en'){
 const base=window.SITE_BASE||'/';const header=document.querySelector('#top');if(!header)return;
 const nav=header.querySelector('nav'),links=names[lang]||names.en;
 nav.innerHTML=[base,base+'#inventory',base+'tools/',base+'#contact'].map((u,i)=>`<a href="${u}">${links[i]}</a>`).join('');
 const actions=header.querySelector('.header-actions');if(actions&&!actions.querySelector('[data-theme-control]'))actions.insertAdjacentHTML('afterbegin',themeButtonMarkup());
 if(!header.querySelector('.mobile-menu-toggle')){header.insertAdjacentHTML('beforeend','<button class="mobile-menu-toggle" type="button" aria-label="Open navigation" aria-expanded="false"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg></button>');const toggle=header.querySelector('.mobile-menu-toggle');toggle.onclick=()=>{const open=toggle.getAttribute('aria-expanded')!=='true';toggle.setAttribute('aria-expanded',String(open));header.classList.toggle('menu-open',open);};nav.onclick=()=>{header.classList.remove('menu-open');toggle.setAttribute('aria-expanded','false');};}
 bindThemeControls();
}
