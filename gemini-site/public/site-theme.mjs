export const THEMES=['light','dark'];
export function applyTheme(theme='light'){
 const value=THEMES.includes(theme)?theme:'light';
 document.documentElement.dataset.theme=value;
 document.querySelector('meta[name="theme-color"]')?.setAttribute('content',value==='dark'?'#0c1015':'#faf9f6');
 return value;
}
export function workbenchTheme(fallback='light'){
 try{return THEMES.includes(localStorage.getItem('danny-workbench-theme'))?localStorage.getItem('danny-workbench-theme'):fallback;}catch{return fallback;}
}
export function saveWorkbenchTheme(theme){const value=applyTheme(theme);try{localStorage.setItem('danny-workbench-theme',value);}catch{}return value;}
