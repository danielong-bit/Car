import {displayPhoto} from './photo-sources.mjs';
import {photoUrl} from './browser-stock.mjs';
import {escapeHtml as esc,translator} from './vehicle-tools.mjs';

export function photoCategory(value='') {
 const text=String(value).toLowerCase();
 if(/engine|引擎|发动机/.test(text))return 'engine';
 if(/interior|seat|dashboard|climate|audio|olufsen|boot|trunk|内饰|座|车厢/.test(text))return 'interior';
 if(/exterior|wheel|tyre|外观|轮/.test(text))return 'exterior';
 return 'details';
}
export function wrapIndex(index,length){return length?((index%length)+length)%length:0;}
export function createGalleryPhotoCache(resolveSource,makeImage=()=>new Image()){
 const entries=new Map();
 return {load(path,priority='high'){
  if(entries.has(path))return entries.get(path);
  const promise=(async()=>{
   const source=await resolveSource(path),image=makeImage();
   image.decoding='async';image.fetchPriority=priority;image.src=source;
   await image.decode();return source;
  })();
  entries.set(path,promise);
  promise.catch(()=>entries.delete(path));return promise;
 }};
}
function staticSrc(url,base=(typeof window!=='undefined'&&window.SITE_BASE)||'/',size='detail'){return displayPhoto(url,size,base);}
export function galleryMarkup(photos,title,lang){
 const tr=translator(lang),labels={all:tr('All photos','全部照片','Semua foto'),exterior:tr('Exterior','外观','Luaran'),interior:tr('Interior','内饰','Dalaman'),engine:tr('Engine','引擎','Enjin'),details:tr('Details','细节','Butiran')};
 if(!photos.length)return `<section class="vehicle-gallery" id="vehicleGallery"><div class="gallery-empty">${tr('Photos will be added soon.','照片待上传。','Foto akan ditambah.')}</div></section>`;
 const groups=[...new Set(photos.map(m=>photoCategory(m.category)))];
 const firstUrl=staticSrc(photos[0]?.url);
 return `<section class="vehicle-gallery" id="vehicleGallery" data-photo-count="${photos.length}" aria-label="${tr('Photo gallery','车辆图库','Galeri foto')}" tabindex="0"><div class="gallery-stage"><button class="detail-main-photo" id="mainPhoto" aria-label="${tr('Enlarge photo','放大照片','Besarkan foto')}" ${photos.length?'':'disabled'}><img id="activePhoto" ${firstUrl?`src="${esc(firstUrl)}"`:''} alt="${esc(title)}" fetchpriority="high" decoding="async"></button><button type="button" class="gallery-arrow gallery-prev" id="galleryPrevious" aria-label="${tr('Previous photo','上一张照片','Foto sebelumnya')}" ${photos.length<2?'disabled hidden':''}><svg class="gallery-arrow-svg" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg></button><button type="button" class="gallery-arrow gallery-next" id="galleryNext" aria-label="${tr('Next photo','下一张照片','Foto seterusnya')}" ${photos.length<2?'disabled hidden':''}><svg class="gallery-arrow-svg" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg></button><span class="gallery-enlarge" aria-hidden="true">↗ ${tr('tap to enlarge','点击放大','ketik untuk besarkan')}</span><span class="gallery-stage-counter" id="galleryStageCount" aria-hidden="true">1 / ${photos.length}</span></div><div class="gallery-caption"><span id="galleryCaption"></span><span id="galleryCount" role="status" aria-live="polite" aria-atomic="true"></span></div>${groups.length>1?`<div class="gallery-categories" aria-label="${tr('Photo categories','照片分类','Kategori foto')}">${['all',...groups].map(group=>`<button type="button" data-photo-category-filter="${group}" aria-pressed="${group==='all'}">${labels[group]} <span>${group==='all'?photos.length:photos.filter(m=>photoCategory(m.category)===group).length}</span></button>`).join('')}</div>`:''}<div class="detail-thumbs" id="galleryThumbnails" ${photos.length<2?'hidden':''}></div></section>`;
}

export function bindGallery(photos,title,lang,base,openPhoto){
 const stage=document.getElementById('vehicleGallery');if(!stage||!photos.length)return;
 const tr=translator(lang),dialog=document.getElementById('photoModal');
 let filtered=photos.map((_,i)=>i),position=0,displayedPosition=0,request=0,touch=null,swiped=false;
 const cache=createGalleryPhotoCache(path=>photoUrl(path,base));
 const current=()=>photos[filtered[position]];
 function thumbs(){
  const strip=document.getElementById('galleryThumbnails');
  strip.hidden=filtered.length<2;
  strip.innerHTML=filtered.map((index,i)=>{const s=staticSrc(photos[index].url,base,'card');return `<button type="button" data-photo="${i}" aria-label="${tr('Photo','照片','Foto')} ${i+1}" aria-pressed="${i===position}"><img ${s?`src="${esc(s)}"`:''} data-source="${esc(photos[index].url)}" alt="${esc(photos[index].category||title)}" loading="lazy" decoding="async"></button>`;}).join('');
  stage.querySelectorAll('[data-photo]').forEach(button=>button.onclick=()=>{if(strip.dataset.dragMoved==='true')return;select(Number(button.dataset.photo));});
  stage.querySelectorAll('img[data-source]').forEach(async img=>{if(img.getAttribute('src'))return;try{img.src=await photoUrl(staticSrc(img.dataset.source,base,'card'),base);}catch{img.alt=tr('Photo unavailable','照片暂不可用','Foto tidak tersedia');}});
 }
 const thumbStrip=document.getElementById('galleryThumbnails');
 if(thumbStrip&&!thumbStrip.dataset.dragBound){
  thumbStrip.dataset.dragBound='true';
  let dragStartX=0,dragScrollLeft=0,isDragging=false;
  thumbStrip.addEventListener('pointerdown',e=>{
   if(e.pointerType==='mouse'&&e.button===0){
    isDragging=true;
    thumbStrip.dataset.dragMoved='false';
    dragStartX=e.clientX;
    dragScrollLeft=thumbStrip.scrollLeft;
   }
  });
  window.addEventListener('pointermove',e=>{
   if(!isDragging)return;
   const dx=e.clientX-dragStartX;
   if(Math.abs(dx)>5){
    thumbStrip.dataset.dragMoved='true';
    thumbStrip.classList.add('is-dragging');
    thumbStrip.scrollLeft=dragScrollLeft-dx;
   }
  });
  window.addEventListener('pointerup',()=>{
   if(!isDragging)return;
   isDragging=false;
   thumbStrip.classList.remove('is-dragging');
   setTimeout(()=>{thumbStrip.dataset.dragMoved='false';},40);
  });
  thumbStrip.addEventListener('wheel',e=>{
   if(Math.abs(e.deltaY)>Math.abs(e.deltaX)&&thumbStrip.scrollWidth>thumbStrip.clientWidth){
    e.preventDefault();
    thumbStrip.scrollLeft+=e.deltaY;
   }
  },{passive:false});
 }
 function modalState(source){
  if(!dialog.open||dialog.dataset.gallery!=='true')return;
  document.getElementById('lightboxPhoto').src=source;document.getElementById('photoTitle').textContent=title;
  document.getElementById('lightboxCount').textContent=`${displayedPosition+1} / ${filtered.length}`;
  ['lightboxPrevious','lightboxNext'].forEach(id=>{const el=document.getElementById(id);el.disabled=filtered.length<2;el.hidden=filtered.length<2;});
 }
 async function select(index){
  const token=++request;position=wrapIndex(index,filtered.length);const selectedPosition=position,photo=current();
  stage.querySelectorAll('[data-photo]').forEach(button=>{
   const active=Number(button.dataset.photo)===position;
   button.setAttribute('aria-pressed',String(active));
  });
  const strip=document.getElementById('galleryThumbnails'),activeBtn=strip?.querySelector('[data-photo="'+position+'"]');
  if(strip&&activeBtn&&strip.scrollWidth>strip.clientWidth){
   const targetLeft=activeBtn.offsetLeft-(strip.clientWidth/2)+(activeBtn.clientWidth/2);
   strip.scrollTo({left:Math.max(0,targetLeft),behavior:'smooth'});
  }
  ['galleryPrevious','galleryNext'].forEach(id=>{const el=document.getElementById(id);el.disabled=filtered.length<2;el.hidden=filtered.length<2;});
  if(!photo)return;
  const img=document.getElementById('activePhoto'),detail=staticSrc(photo.url,base),preview=staticSrc(photo.url,base,'card');
  stage.dataset.photoLoading='true';stage.setAttribute('aria-busy','true');
  document.getElementById('galleryCount').textContent=tr('Loading photo','正在加载照片','Memuatkan foto')+` ${selectedPosition+1} / ${filtered.length}`;
  let detailShown=false,previewShown=false;
  const commit=(source,full=false)=>{
   if(token!==request||!stage.isConnected||(!full&&detailShown))return;
   if(full)detailShown=true;previewShown=true;displayedPosition=selectedPosition;
   img.src=source;img.alt=title+' · '+(photo.category||tr('Photo','照片','Foto'));
   img.style.objectPosition=`${Number(photo.cropX??50)}% ${Number(photo.cropY??50)}%`;img.style.transformOrigin=img.style.objectPosition;img.style.transform=`scale(${Math.max(100,Math.min(200,Number(photo.cropZoom)||100))/100})`;
   stage.dataset.photoLoading='false';stage.setAttribute('aria-busy','false');
   const count=`${selectedPosition+1} / ${filtered.length}`;
   document.getElementById('galleryCount').textContent=count;
   document.getElementById('galleryStageCount').textContent=count;
   document.getElementById('galleryCaption').textContent={exterior:tr('Exterior','外观','Luaran'),interior:tr('Interior','内饰','Dalaman'),engine:tr('Engine','引擎','Enjin'),details:tr('Details','细节','Butiran')}[photoCategory(photo.category)];
   modalState(source);
  };
  const thumbnail=stage.querySelector(`[data-photo="${selectedPosition}"] img`);
  if(img.complete&&img.naturalWidth&&img.getAttribute('src')===detail)commit(detail,true);
  else if(thumbnail?.complete&&thumbnail.naturalWidth)commit(thumbnail.currentSrc||thumbnail.src);
  else if(preview!==detail)void cache.load(preview).then(source=>commit(source)).catch(()=>{});
  try{
   const source=await cache.load(detail);commit(source,true);
   if(token!==request||!stage.isConnected)return;
   for(const offset of [1,-1]){
    const neighbour=photos[filtered[wrapIndex(selectedPosition+offset,filtered.length)]];
    if(neighbour&&neighbour!==photo)void cache.load(staticSrc(neighbour.url,base),'low').catch(()=>{});
   }
  }catch{
   if(token!==request||!stage.isConnected||previewShown)return;
   stage.dataset.photoLoading='false';stage.setAttribute('aria-busy','false');
   document.getElementById('galleryCaption').textContent=tr('Photo unavailable. Try another photo.','照片暂不可用，请试试其他照片。','Foto tidak tersedia. Cuba foto lain.');
  }
 }
 const move=step=>select(position+step);
 document.getElementById('galleryPrevious').onclick=()=>move(-1);document.getElementById('galleryNext').onclick=()=>move(1);
 stage.querySelectorAll('[data-photo-category-filter]').forEach(button=>button.onclick=()=>{
  const category=button.dataset.photoCategoryFilter;filtered=photos.map((_,i)=>i).filter(i=>category==='all'||photoCategory(photos[i].category)===category);position=0;thumbs();select(0);
  stage.querySelectorAll('[data-photo-category-filter]').forEach(node=>node.setAttribute('aria-pressed',String(node===button)));
 });
 document.getElementById('mainPhoto').onclick=()=>{if(swiped){swiped=false;return;}if(stage.dataset.photoLoading==='true')return;const photo=current();if(!photo)return;openPhoto(document.getElementById('activePhoto').src,title,{previous:()=>move(-1),next:()=>move(1),count:`${displayedPosition+1} / ${filtered.length}`,disabled:filtered.length<2});};
 const onKey=event=>{if(!['ArrowLeft','ArrowRight'].includes(event.key))return;event.preventDefault();move(event.key==='ArrowLeft'?-1:1);};
 stage.onkeydown=onKey;dialog.onkeydown=event=>{if(dialog.dataset.gallery==='true')onKey(event);};
 dialog.onclose=()=>{touch=null;swiped=false;};
 for(const target of [stage.querySelector('.gallery-stage'),dialog.querySelector('.lightbox-stage')]){
  if(!target)continue;
  target.addEventListener('touchstart',event=>{if(! event.touches?.length)return;touch={x:event.touches[0].clientX,y:event.touches[0].clientY};swiped=false;},{passive:true});
  target.addEventListener('touchend',event=>{if(!touch||!event.changedTouches?.length)return;const dx=event.changedTouches[0].clientX-touch.x,dy=event.changedTouches[0].clientY-touch.y;touch=null;if(Math.abs(dx)>32&&Math.abs(dx)>Math.abs(dy)*1.15){swiped=true;move(dx<0?1:-1);}},{passive:true});
  target.onpointerdown=event=>{if(event.pointerType==='touch'&&(!dialog.open||dialog.dataset.gallery==='true')){touch={x:event.clientX,y:event.clientY};swiped=false;}};
  target.onpointerup=event=>{if(!touch)return;const dx=event.clientX-touch.x,dy=event.clientY-touch.y;touch=null;if(Math.abs(dx)>32&&Math.abs(dx)>Math.abs(dy)*1.15){swiped=true;move(dx<0?1:-1);}};
  target.onpointercancel=()=>{touch=null;swiped=false;};
 }
 thumbs();select(0);
}
