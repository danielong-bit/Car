export const THEMES=['light','dark'];
export function applyTheme(){return window.DannyTheme?.apply()||document.documentElement.dataset.theme||'light';}
export function workbenchTheme(){return window.DannyTheme?.get()||'light';}
export function saveWorkbenchTheme(value){return window.DannyTheme?.set(value)||applyTheme();}
export function themeButtonMarkup(){return `<button type="button" class="theme-control" data-theme-control aria-label="Switch color theme"><svg viewBox="0 0 24 24" aria-hidden="true"><path class="theme-sun" d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.4 1.4m11.2 11.2L19 19M5 19l1.4-1.4M17.6 6.4 19 5M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"/><path class="theme-moon" d="M20 15A9 9 0 0 1 9 4a9 9 0 1 0 11 11Z"/></svg><span class="theme-label">Day</span><span class="theme-track" aria-hidden="true"></span></button>`;}
export function bindThemeControls(){
 const sync=()=>document.querySelectorAll('[data-theme-control]').forEach(b=>{const dark=document.documentElement.dataset.theme==='dark';b.setAttribute('aria-label',dark?'Switch to light theme':'Switch to dark theme');b.setAttribute('aria-pressed',String(dark));const label=b.querySelector('.theme-label');if(label)label.textContent=dark?'Night':'Day';});
 document.querySelectorAll('[data-theme-control]').forEach(b=>b.onclick=()=>saveWorkbenchTheme(document.documentElement.dataset.theme==='dark'?'light':'dark'));sync();
 if(!window.__dannyThemeBound){document.addEventListener('danny-theme-change',sync);window.__dannyThemeBound=true;}
}
