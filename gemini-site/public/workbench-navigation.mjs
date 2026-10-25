import {icon} from './stock-icons.mjs';
import {themeButtonMarkup} from './site-theme.mjs';

const groups=[
 ['Workspace',[['overview','Overview','grid'],['inventory','Vehicles','car']]],
 ['Website',[['homepage','Homepage','home'],['deliveries','Deliveries','check'],['services','Services &amp; Tint','gear'],['media','Media library','photo']]],
 ['Administration',[['settings','Website settings','filter'],['advanced','Backups','archive']]],
];

export function ownerNavigationMarkup(active='overview'){
 return groups.map(([name,items],index)=>`<section class="owner-nav-group" aria-labelledby="owner-nav-heading-${index}"><p class="owner-nav-heading" id="owner-nav-heading-${index}">${name}</p>${items.map(([key,label,glyph])=>`<button type="button" title="${label.replaceAll('&amp;','&')}" data-nav="${key}"${key===active?' aria-current="page"':''}>${icon(glyph)}<span class="owner-nav-label">${label}</span></button>`).join('')}</section>`).join('');
}

export function ownerSidebarMarkup(base='/',active='overview'){
 const preview=typeof window!=='undefined'&&window.DANNY_PREVIEW_EDITOR===true;
 const logout=preview?`<a class="owner-logout" href="${base}">Exit preview</a>`:`<form action="/api/owner/logout" method="post"><button type="submit" class="owner-logout">Log out</button></form>`;
 return `<aside class="wb-sidebar"><div class="owner-sidebar-brand"><button type="button" class="owner-sidebar-toggle" aria-label="Collapse sidebar" aria-expanded="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="3"/><path d="M9 4v16"/></svg></button><a href="${base}" class="wordmark" aria-label="Danny Recon Select"><span class="brand-logo full-brand" aria-hidden="true"><img class="brand-logo-img logo-dark" src="${base}assets/brand-wordmark-black.png" alt="" width="28" height="20" decoding="async"><img class="brand-logo-img logo-light" src="${base}assets/brand-wordmark-white.png" alt="" width="28" height="20" decoding="async"></span><span>DANNY<small>RECON SELECT</small></span></a><p class="wb-context">${preview?'Preview workspace':'Owner workspace'}</p></div><nav aria-label="Workbench">${ownerNavigationMarkup(active)}</nav><div class="wb-sidebar-bottom"><a class="owner-website-link" href="${base}">View website ${icon('external')}</a><div class="owner-sidebar-controls">${themeButtonMarkup()}${logout}</div></div><div class="owner-mobile-controls">${themeButtonMarkup()}${logout}</div></aside>`;
}

export function bindSidebarToggle(){
 const toggle=document.querySelector('.owner-sidebar-toggle');if(!toggle)return;
 const sync=collapsed=>{document.body.classList.toggle('sidebar-collapsed',collapsed);toggle.setAttribute('aria-expanded',String(!collapsed));toggle.setAttribute('aria-label',collapsed?'Expand sidebar':'Collapse sidebar');};
 try{sync(localStorage.getItem('danny-sidebar-collapsed')==='true');}catch{}
 toggle.onclick=()=>{const collapsed=!document.body.classList.contains('sidebar-collapsed');sync(collapsed);try{localStorage.setItem('danny-sidebar-collapsed',String(collapsed));}catch{}};
}
