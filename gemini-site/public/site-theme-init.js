(function(){
 const key='danny-theme';
 const media=window.matchMedia('(prefers-color-scheme: dark)');
 const read=()=>{try{return localStorage.getItem(key)}catch{return null}};
 const resolve=()=>['light','dark'].includes(read())?read():(media.matches?'dark':'light');
 function apply(value){document.documentElement.dataset.theme=value;document.querySelector('meta[name="theme-color"]')?.setAttribute('content',value==='dark'?'#0b1423':'#faf9f6');document.dispatchEvent(new CustomEvent('danny-theme-change',{detail:value}));return value;}
 window.DannyTheme={get:()=>document.documentElement.dataset.theme||resolve(),set(value){if(!['light','dark','system'].includes(value))return;try{value==='system'?localStorage.removeItem(key):localStorage.setItem(key,value)}catch{}return apply(resolve())},apply:()=>apply(resolve())};
 apply(resolve());media.addEventListener('change',()=>{if(!['light','dark'].includes(read()))apply(resolve())});window.addEventListener('storage',e=>{if(e.key===key)apply(resolve())});
})();
