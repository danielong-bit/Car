const activeCarousels=new WeakMap();

export function startDeliveryCarousel(rail,{previous,next,pause,interval=4500,labels={pause:'Pause slideshow',play:'Play slideshow'}}={}) {
 activeCarousels.get(rail)?.destroy();
 rail.querySelectorAll(':scope > [data-carousel-clone="true"]').forEach(node=>node.remove());
 const win=rail.ownerDocument.defaultView,doc=rail.ownerDocument;
 const media=win.matchMedia('(prefers-reduced-motion: reduce)');
 const originals=[...rail.children],clones=[];
 let paused=media.matches,hover=false,focused=false,visible=true,destroyed=false;
 const step=()=>{
  const first=rail.firstElementChild;
  return first?first.getBoundingClientRect().width+(parseFloat(win.getComputedStyle(rail).columnGap)||parseFloat(win.getComputedStyle(rail).gap)||16):0;
 };
 const prepareLoop=()=>{
  clones.splice(0).forEach(node=>node.remove());
  if(originals.length<2)return;
  const sets=Math.max(1,Math.ceil(Math.ceil(rail.clientWidth/(step()||1))/originals.length));
  for(let i=0;i<sets;i++)for(const original of originals){
   const clone=original.cloneNode(true);clone.dataset.carouselClone='true';clone.setAttribute('aria-hidden','true');
   const from=original.querySelectorAll('button,a'),to=clone.querySelectorAll('button,a');
   to.forEach((node,index)=>{node.tabIndex=-1;node.onclick=from[index]?.onclick||null;});
   clone.querySelectorAll('[id]').forEach(node=>node.removeAttribute('id'));
   rail.append(clone);clones.push(clone);
  }
 };
 prepareLoop();
 const move=direction=>{
  const max=Math.max(0,rail.scrollWidth-rail.clientWidth);
  if(max<2)return;
  const cycle=originals.length*step();
  if(clones.length&&direction>0&&rail.scrollLeft>=cycle-2)rail.scrollTo({left:Math.max(0,rail.scrollLeft-cycle),behavior:'instant'});
  if(clones.length&&direction<0&&rail.scrollLeft<=2)rail.scrollTo({left:Math.min(cycle,max),behavior:'instant'});
  const target=direction>0?Math.min(max,rail.scrollLeft+step()):Math.max(0,rail.scrollLeft-step());
  rail.scrollTo({left:target,behavior:media.matches?'auto':'smooth'});
 };
 const symbol=kind=>'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+({previous:'<path d="m14 6-6 6 6 6"/>',next:'<path d="m10 6 6 6-6 6"/>',pause:'<path d="M9 5v14M15 5v14"/>',play:'<path d="m9 5 10 7-10 7Z"/>'})[kind]+'</svg>';
 if(previous)previous.innerHTML=symbol('previous');
 if(next)next.innerHTML=symbol('next');
 pause?.parentElement?.classList.add('delivery-controls');
 const update=()=>{
  if(pause){pause.innerHTML=symbol(paused?'play':'pause');pause.setAttribute('aria-label',paused?labels.play:labels.pause);pause.setAttribute('aria-pressed',String(paused));}
 };
 const handlers={pointerenter:()=>{hover=true;},pointerleave:()=>{hover=false;},focusin:()=>{focused=true;},focusout:e=>{focused=rail.contains(e.relatedTarget);},pointerdown:()=>{paused=true;update();}};
 Object.entries(handlers).forEach(([event,fn])=>rail.addEventListener(event,fn));
 if(previous)previous.onclick=()=>{paused=true;update();move(-1);};
 if(next)next.onclick=()=>{paused=true;update();move(1);};
 if(pause)pause.onclick=()=>{paused=!paused;update();};
 const observer=win.IntersectionObserver?new win.IntersectionObserver(entries=>{visible=entries.some(e=>e.isIntersecting);}):null;
 observer?.observe(rail);
 const motion=()=>{if(media.matches){paused=true;update();}};media.addEventListener?.('change',motion);
 const advance=()=>{if(!destroyed&&!paused&&!hover&&!focused&&visible&&!doc.hidden)move(1);};
 const timer=win.setInterval(advance,interval);update();
 const resize=()=>{prepareLoop();rail.scrollTo({left:0,behavior:'instant'});};win.addEventListener('resize',resize);
 const controller={advance,destroy(){destroyed=true;win.clearInterval(timer);observer?.disconnect();win.removeEventListener('resize',resize);clones.forEach(node=>node.remove());media.removeEventListener?.('change',motion);Object.entries(handlers).forEach(([event,fn])=>rail.removeEventListener(event,fn));if(previous)previous.onclick=null;if(next)next.onclick=null;if(pause)pause.onclick=null;if(activeCarousels.get(rail)===controller)activeCarousels.delete(rail);}};
 activeCarousels.set(rail,controller);
 return controller;
}
