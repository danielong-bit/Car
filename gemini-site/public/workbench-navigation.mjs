import {icon} from './stock-icons.mjs';
import {themeButtonMarkup} from './site-theme.mjs';

const groups=[
 ['Workspace',[['overview','Overview','grid'],['inventory','Vehicles','car']]],
 ['Website',[['homepage','Homepage','home'],['deliveries','Deliveries','check'],['services','Services &amp; Tint','gear'],['media','Media library','photo']]],
 ['Administration',[['settings','Website settings','filter'],['advanced','Backups','archive']]],
];

export function ownerNavigationMarkup(active='overview'){
 return groups.map(([name,items],index)=>`<section class="owner-nav-group" aria-labelledby="owner-nav-heading-${index}"><p class="owner-nav-heading" id="owner-nav-heading-${index}">${name}</p>${items.map(([key,label,glyph])=>`<button type="button" data-nav="${key}"${key===active?' aria-current="page"':''}>${icon(glyph)}<span class="owner-nav-label">${label}</span></button>`).join('')}</section>`).join('');
}

export function ownerSidebarMarkup(base='/',active='overview'){
 const logout=`<form action="/api/owner/logout" method="post"><button type="submit" class="owner-logout">Log out</button></form>`;
 return `<aside class="wb-sidebar"><div class="owner-sidebar-brand"><a href="${base}" class="wordmark">DANNY<small>RECON SELECT</small></a><p class="wb-context">Owner workspace</p></div><nav aria-label="Workbench">${ownerNavigationMarkup(active)}</nav><div class="wb-sidebar-bottom"><a class="owner-website-link" href="${base}">View website ${icon('external')}</a><div class="owner-sidebar-controls">${themeButtonMarkup()}${logout}</div></div><div class="owner-mobile-controls">${themeButtonMarkup()}${logout}</div></aside>`;
}
