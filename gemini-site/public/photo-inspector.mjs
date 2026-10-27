import {photoUrl} from './browser-stock.mjs';
import {displayPhoto} from './photo-sources.mjs';
import {createGalleryPhotoCache,wrapIndex} from './vehicle-gallery.mjs';

export function createPhotoInspector(doc=document,{load}={}){
 const cache=createGalleryPhotoCache(path=>photoUrl(path));
 const resolve=load||((path)=>cache.load(displayPhoto(path,'detail',doc.defaultView?.SITE_BASE||'/')));
 const dialog=doc.createElement('dialog');dialog.className='photo-inspector';dialog.setAttribute('aria-label','Photo preview');
 dialog.innerHTML='<header class="photo-inspector-header"><strong></strong><button type="button" aria-label="Close photo preview">×</button></header><div class="photo-inspector-stage" data-mode="full" aria-busy="false"><img alt=""><span class="photo-inspector-loading" role="status">Loading photo…</span></div><footer class="photo-inspector-toolbar"><div class="photo-inspector-modes" role="group" aria-label="Preview mode"><button type="button" data-preview-mode="full" aria-pressed="true">Full photo</button><button type="button" data-preview-mode="framed" aria-pressed="false">Framing preview</button></div><div class="photo-inspector-nav"><button type="button" data-inspector-prev aria-label="Previous photo">←</button><output aria-live="polite"></output><button type="button" data-inspector-next aria-label="Next photo">→</button></div></footer>';
 doc.body.append(dialog);
 const stage=dialog.querySelector('.photo-inspector-stage'),image=stage.querySelector('img'),count=dialog.querySelector('output');
 let source=()=>[],position=0,request=0,overflow='',title='';
 async function select(index){
  const photos=source();if(!photos.length)return;
  position=wrapIndex(index,photos.length);const selected=position,photo=photos[selected],token=++request;
  stage.setAttribute('aria-busy','true');stage.querySelector('[role=status]').textContent='Loading photo…';
  try{
   const src=await resolve(photo.url);
   if(token!==request||!dialog.open)return;
   image.src=src;image.alt=`${title} · Photo ${selected+1}`;image.style.objectPosition=`${Number(photo.cropX??50)}% ${Number(photo.cropY??50)}%`;
   count.textContent=`${selected+1} / ${photos.length}`;stage.setAttribute('aria-busy','false');
  }catch{
   if(token!==request)return;
   stage.querySelector('[role=status]').textContent='Photo unavailable. Try another photo.';
  }
 }
 dialog.querySelector('.photo-inspector-header button').onclick=()=>dialog.close();
 dialog.querySelector('[data-inspector-prev]').onclick=()=>select(position-1);
 dialog.querySelector('[data-inspector-next]').onclick=()=>select(position+1);
 dialog.querySelectorAll('[data-preview-mode]').forEach(button=>button.onclick=()=>{
  stage.dataset.mode=button.dataset.previewMode;
  dialog.querySelectorAll('[data-preview-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
 });
 dialog.addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight'].includes(event.key))return;event.preventDefault();void select(position+(event.key==='ArrowLeft'?-1:1));});
 dialog.addEventListener('close',()=>{request++;doc.body.style.overflow=overflow;});
 return {dialog,open(photos,index=0,label='Vehicle photos'){
  source=typeof photos==='function'?photos:()=>photos;title=label;
  dialog.querySelector('strong').textContent=title;
  const multiple=source().length>1;
  dialog.querySelectorAll('[data-inspector-prev],[data-inspector-next]').forEach(button=>button.disabled=!multiple);
  if(!dialog.open){overflow=doc.body.style.overflow;doc.body.style.overflow='hidden';dialog.showModal();}
  void select(index);
 }};
}
