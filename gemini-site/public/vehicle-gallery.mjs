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
function staticSrc(url,base=(typeof window!=='undefined'&&window.SITE_BASE)||'/'){
 const p=String(url||'');
 if(!p||p.startsWith('/assets/uploads/'))return '';
 if(base!=='/'&&p.startsWith(base))return p;
 return p.startsWith('/assets/')?base+p.slice(1):p;
}
export function galleryMarkup(photos,title,lang){
 const tr=translator(lang),labels={all:tr('All photos','全部照片','Semua foto'),exterior:tr('Exterior','外观','Luaran'),interior:tr('Interior','内饰','Dalaman'),engine:tr('Engine','引擎','Enjin'),details:tr('Details','细节','Butiran')};
 if(!photos.length)return `<section class="vehicle-gallery" id="vehicleGallery"><div class="gallery-empty">${tr('Photos will be added soon.','照片待上传。','Foto akan ditambah.')}</div></section>`;
 const groups=[...new Set(photos.map(m=>photoCategory(m.category)))];
 const firstUrl=staticSrc(photos[0]?.url);
 return `<section class="vehicle-gallery" id="vehicleGallery" aria-label="${tr('Photo gallery','车辆图库','Galeri foto')}" tabindex="0"><div class="gallery-stage"><button class="detail-main-photo" id="mainPhoto" aria-label="${tr('Enlarge photo','放大照片','Besarkan foto')}" ${photos.length?'':'disabled'}><img id="activePhoto" ${firstUrl?`src="${esc(firstUrl)}"`:''} alt="${esc(title)}" fetchpriority="high" decoding="async"></button><button type="button" class="gallery-arrow gallery-prev" id="galleryPrevious" aria-label="${tr('Previous photo','上一张照片','Foto sebelumnya')}" ${photos.length<2?'disabled hidden':''}>‹</button><button type="button" class="gallery-arrow gallery-next" id="galleryNext" aria-label="${tr('Next photo','下一张照片','Foto seterusnya')}" ${photos.length<2?'disabled hidden':''}>›</button><span class="gallery-enlarge" aria-hidden="true">↗ ${tr('tap to enlarge','点击放大','ketik untuk besarkan')}</span><span class="gallery-stage-counter" id="galleryStageCount" aria-hidden="true">1 / ${photos.length}</span></div><div class="gallery-caption"><span id="galleryCaption"></span><span id="galleryCount" role="status" aria-live="polite" aria-atomic="true"></span></div>${groups.length>1?`<div class="gallery-categories" aria-label="${tr('Photo categories','照片分类','Kategori foto')}">${['all',...groups].map(group=>`<button type="button" data-photo-category-filter="${group}" aria-pressed="${group==='all'}">${labels[group]} <span>${group==='all'?photos.length:photos.filter(m=>photoCategory(m.category)===group).length}</span></button>`).join('')}</div>`:''}<div class="detail-thumbs" id="galleryThumbnails" ${photos.length<2?'hidden':''}></div></section>`;
}

export function bindGallery(photos,title,lang,base,openPhoto){
 const stage=document.getElementById('vehicleGallery');if(!stage||!photos.length)return;
 const tr=translator(lang),dialog=document.getElementById('photoModal');
 let filtered=photos.map((_,i)=>i),position=0,request=0,touch=null,swiped=false;
 const current=()=>photos[filtered[position]];
 function thumbs(){
  const strip=document.getElementById('galleryThumbnails');
  strip.hidden=filtered.length<2;
  strip.innerHTML=filtered.map((index,i)=>{const s=staticSrc(photos[index].url,base);return `<button type="button" data-photo="${i}" aria-label="${tr('Photo','照片','Foto')} ${i+1}" aria-pressed="${i===position}"><img ${s?`src="${esc(s)}"`:''} data-source="${esc(photos[index].url)}" alt="${esc(photos[index].category||title)}" loading="${i<6?'eager':'lazy'}" decoding="async"></button>`;}).join('');
  stage.querySelectorAll('[data-photo]').forEach(button=>button.onclick=()=>select(Number(button.dataset.photo)));
  stage.querySelectorAll('img[data-source]').forEach(async img=>{try{img.src=await photoUrl(img.dataset.source,base);}catch{img.alt=tr('Photo unavailable','照片暂不可用','Foto tidak tersedia');}});
 }
 function modalState(source){
  if(!dialog.open||dialog.dataset.gallery!=='true')return;
  document.getElementById('lightboxPhoto').src=source;document.getElementById('photoTitle').textContent=title;
  document.getElementById('lightboxCount').textContent=`${position+1} / ${filtered.length}`;
  ['lightboxPrevious','lightboxNext'].forEach(id=>{const el=document.getElementById(id);el.disabled=filtered.length<2;el.hidden=filtered.length<2;});
 }
 async function select(index){
  const token=++request;position=wrapIndex(index,filtered.length);const photo=current();
  const countText=filtered.length?`${position+1} / ${filtered.length}`:tr('No photos yet','照片待上传','Belum ada foto');
  document.getElementById('galleryCount').textContent=countText;
  const stageCounter=document.getElementById('galleryStageCount');
  if(stageCounter)stageCounter.textContent=filtered.length?`${position+1} / ${filtered.length}`:'';
  document.getElementById('galleryCaption').textContent=photo?({exterior:tr('Exterior','外观','Luaran'),interior:tr('Interior','内饰','Dalaman'),engine:tr('Engine','引擎','Enjin'),details:tr('Details','细节','Butiran')}[photoCategory(photo.category)]):tr('Photo gallery','车辆图库','Galeri foto');
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
  try{const source=await photoUrl(photo.url,base);if(token!==request||!stage.isConnected)return;const img=document.getElementById('activePhoto');img.src=source;img.alt=title+' · '+(photo.category||tr('Photo','照片','Foto'));modalState(source);}catch{document.getElementById('galleryCaption').textContent=tr('Photo unavailable. Try another photo.','照片暂不可用，请试试其他照片。','Foto tidak tersedia. Cuba foto lain.');}
 }
 const move=step=>select(position+step);
 document.getElementById('galleryPrevious').onclick=()=>move(-1);document.getElementById('galleryNext').onclick=()=>move(1);
 stage.querySelectorAll('[data-photo-category-filter]').forEach(button=>button.onclick=()=>{
  const category=button.dataset.photoCategoryFilter;filtered=photos.map((_,i)=>i).filter(i=>category==='all'||photoCategory(photos[i].category)===category);position=0;thumbs();select(0);
  stage.querySelectorAll('[data-photo-category-filter]').forEach(node=>node.setAttribute('aria-pressed',String(node===button)));
 });
 document.getElementById('mainPhoto').onclick=()=>{if(swiped){swiped=false;return;}const photo=current();if(!photo)return;openPhoto(document.getElementById('activePhoto').src,title,{previous:()=>move(-1),next:()=>move(1),count:`${position+1} / ${filtered.length}`,disabled:filtered.length<2});};
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
