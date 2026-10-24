export const THEMES=['light','dark'];
export function applyTheme(){return window.DannyTheme?.apply()||document.documentElement.dataset.theme||'light';}
export function workbenchTheme(){return window.DannyTheme?.get()||'light';}
export function saveWorkbenchTheme(value){return window.DannyTheme?.set(value)||applyTheme();}
export function themeButtonMarkup(){return `<button type="button" class="theme-control theme-control--simple" data-theme-control role="switch" aria-checked="false" aria-label="Switch color theme"><svg class="theme-sun" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.4 1.4m11.2 11.2L19 19M5 19l1.4-1.4M17.6 6.4 19 5"/></svg><svg class="theme-moon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.2 15.1A8.5 8.5 0 0 1 8.9 3.8 8.6 8.6 0 1 0 20.2 15.1Z"/></svg><span class="theme-label">Day</span><span class="theme-track" aria-hidden="true"></span></button>`;}
export function bindThemeControls(){
 const sync=()=>document.querySelectorAll('[data-theme-control]').forEach(b=>{const dark=document.documentElement.dataset.theme==='dark';b.setAttribute('aria-label',dark?'Switch to light theme':'Switch to dark theme');b.setAttribute('aria-checked',String(dark));const label=b.querySelector('.theme-label');if(label)label.textContent=dark?'Night':'Day';});
 document.querySelectorAll('[data-theme-control]').forEach(b=>b.onclick=()=>saveWorkbenchTheme(document.documentElement.dataset.theme==='dark'?'light':'dark'));sync();
 if(!window.__dannyThemeBound){document.addEventListener('danny-theme-change',sync);window.__dannyThemeBound=true;}
}
