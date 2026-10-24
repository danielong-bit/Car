import {photoUrl} from './browser-stock.mjs';

const mounts=new WeakMap();
let bundle;
export function mountContactLanyard(container,options){
 if(!container)return;
 let state=mounts.get(container);
 if(!state){
  state={options,version:0,near:false};mounts.set(container,state);
  const observer=new IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting)){observer.disconnect();state.near=true;void render();}},{rootMargin:'200px'});
  observer.observe(container);
 }
 state.options=options;
 async function render(){
  const version=++state.version,current=state.options;
  try{
   bundle??=import('./assets/contact-lanyard.js?v=lanyard-20261024d').catch(error=>{bundle=undefined;throw error;});
   const [ui,portrait]=await Promise.all([bundle,photoUrl(current.portrait,current.base)]);
   if(version!==state.version||!container.isConnected)return;
   ui.renderContactLanyard(container,{...current,portrait});
  }catch{ /* Keep the original contact photo if the optional enhancement cannot load. */ }
 }
 if(state.near)void render();
}
