(()=>{const d=window.CMS_DATA,parts=location.pathname.split('/').filter(Boolean),vehicleId=decodeURIComponent(parts.pop()||''),v=d.vehicles.find(v=>v.id===vehicleId);if(!v)return;const host=document.getElementById('vehicleContent'),e=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),money=n=>'RM '+Number(n).toLocaleString('en-MY'),title=`${v.year} ${v.brand} ${v.model}`,photos=(v.gallery||[]).filter(m=>m.visible!==false),wa=`https://wa.me/${d.profile.phone}?text=${encodeURIComponent(`Hello Danny, I am interested in ${title}, stock ${v.stockId}, ${money(v.price)}. Please confirm availability and details. ${location.origin}${window.SITE_BASE||'/'}vehicle/${v.id}/`)}`;
host.innerHTML=`<p class="stories-eyebrow">${e(v.sample?'Illustration vehicle':v.status)} · Stock ${e(v.stockId)}</p><h1 class="public-title">${e(title)}</h1><div class="public-two"><section class="public-panel"><div id="detailMedia"></div><div class="public-gallery-thumbs">${photos.map((m,i)=>`<button data-photo="${i}" aria-label="${e(m.category||'Photo')} ${i+1}">${m.video?'Video':`<img src="${e(m.url)}" alt="${e(m.category||title)}">`}</button>`).join('')}</div></section><aside class="public-panel"><div class="public-estimate">${money(v.price)}</div><p class="public-muted">${v.sample?'Sample listing for illustration. Confirm real stock and pricing with Danny.':'Confirm final price, condition and availability with Danny.'}</p><div class="public-specs">${[['Mileage',v.mileage],['Engine',v.engine],['Power',v.power],['Body',v.body],['Colour',v.color]].map(([k,s])=>`<div><small>${k}</small><strong>${e(s||'To be confirmed')}</strong></div>`).join('')}</div><div class="public-actions"><a href="${e(wa)}" target="_blank" rel="noopener">WhatsApp enquiry ↗</a><a class="secondary" href="/calculator?vehicle=${e(v.id)}">Plan my payment</a>${v.id==='audi-s5'?'<a class="secondary" href="/audi">Open photo tour</a>':''}</div>${v.status==='sold'?'<p>This vehicle has been sold. Ask Danny about similar stock.</p>':`<details class="public-panel"><summary>Book a showroom viewing</summary><form id="viewingForm"><label class="public-field">Your name<input name="name" required minlength="2" maxlength="100" autocomplete="name"></label><label class="public-field">Phone / WhatsApp<input name="contact" required pattern="[+0-9 ()-]{8,30}" autocomplete="tel"></label><label class="public-field">Preferred date<input name="date" type="date" required min="${new Date().toISOString().slice(0,10)}"></label><label class="public-field">Anything you would like to ask?<textarea name="note" maxlength="2000"></textarea></label><input name="website" tabindex="-1" autocomplete="off" aria-hidden="true" style="display:none"><button class="public-button">Request a viewing</button><p class="public-muted">Your request is subject to availability. Danny will contact you to confirm the time. Your contact details are kept private for this enquiry.</p><p id="viewingStatus" role="status"></p></form></details>`}</aside></div><section class="public-panel"><h2>Vehicle information</h2>${Object.entries(v.specs||{}).map(([group,rows])=>`<h3>${e(group)}</h3><div class="public-specs">${(Array.isArray(rows)?rows:Object.entries(typeof rows==='object'?rows:{Value:rows})).map(([k,val])=>`<div><small>${e(k)}</small><strong>${e(val)}</strong></div>`).join('')}</div>`).join('')}${(v.features||[]).length?'<p>'+e(v.features.join(' · '))+'</p>':''}</section><section id="genericHotspots"></section><section class="public-panel"><h2>Explore other cars</h2><div class="public-actions">${d.vehicles.filter(x=>x.id!==v.id&&['available','reserved'].includes(x.status)).slice(0,3).map(x=>`<a class="secondary" href="/vehicle/${e(x.id)}">${e(x.brand+' '+x.model)}</a>`).join('')}</div></section>`;
if(v.presenter?.url){
  const panel=document.createElement('section');
  panel.className='public-panel presenter-panel';
  panel.id='danny-walkaround';
  const eyebrow=document.createElement('p');
  eyebrow.className='stories-eyebrow';
  eyebrow.textContent='CAR EXPLAINED BY DANNY';
  const heading=document.createElement('h2');
  heading.textContent=v.presenter.title||('Danny explains the '+v.brand+' '+v.model);
  const description=document.createElement('p');
  description.className='public-muted';
  description.textContent='Hear Danny walk through this car, then explore its own photos and specifications above.';
  panel.append(eyebrow,heading,description);
  const videoId=v.presenter.url.match(/\/video\/(\d+)/)?.[1];
  if(videoId){
    const frame=document.createElement('div');
    frame.className='presenter-video-frame';
    const iframe=document.createElement('iframe');
    iframe.src='https://www.tiktok.com/player/v1/'+videoId+'?autoplay=0&description=1';
    iframe.title=heading.textContent;
    iframe.loading='lazy';
    iframe.allow='encrypted-media; fullscreen; picture-in-picture';
    iframe.referrerPolicy='strict-origin-when-cross-origin';
    iframe.setAttribute('allowfullscreen','');
    frame.append(iframe);
    panel.append(frame);
  }
  const links=document.createElement('div');
  links.className='public-actions presenter-links';
  const primary=document.createElement('a');
  primary.href=v.presenter.url;
  primary.target='_blank';
  primary.rel='noopener';
  primary.textContent='Watch on TikTok ↗';
  links.append(primary);
  if(v.presenter.facebook){
    const fallback=document.createElement('a');
    fallback.href=v.presenter.facebook;
    fallback.target='_blank';
    fallback.rel='noopener';
    fallback.className='secondary';
    fallback.textContent='Facebook version ↗';
    links.append(fallback);
  }
  panel.append(links);
  host.insertBefore(panel,document.getElementById('genericHotspots'));
}const area=document.getElementById('detailMedia');function select(i){const m=photos[i];if(!m)return;area.innerHTML=m.video?`<video src="${e(m.url)}" controls preload="metadata" style="width:100%"></video>`:`<button id="openDetailPhoto" aria-label="Open full photo" style="border:0;background:none;width:100%;padding:0;overflow:hidden;border-radius:12px"><img src="${e(m.url)}" alt="${e(title)}" style="display:block;width:100%;aspect-ratio:${e(m.ratio||'4/3')};object-fit:cover;object-position:${matchMedia('(max-width:700px)').matches?m.mobileX??m.x??50:m.x??50}% ${matchMedia('(max-width:700px)').matches?m.mobileY??m.y??50:m.y??50}%;transform:scale(${m.zoom||1})"></button>`;document.getElementById('openDetailPhoto')?.addEventListener('click',()=>{const dialog=document.getElementById('vehiclePhotoDialog');document.getElementById('detailPhotoFull').src=m.url;document.getElementById('detailPhotoTitle').textContent=title;dialog.showModal();});}select(0);host.querySelectorAll('[data-photo]').forEach(b=>b.onclick=()=>select(Number(b.dataset.photo)));document.getElementById('detailPhotoClose').onclick=()=>document.getElementById('vehiclePhotoDialog').close();
const form=document.getElementById('viewingForm');
if(form&&d.staticSite){
  const submit=form.querySelector('button');
  if(submit)submit.textContent='Continue in WhatsApp';
  const note=form.querySelector('.public-muted');
  if(note)note.textContent='Opens WhatsApp with your details filled in. Danny will confirm availability and a viewing time.';
  form.onsubmit=event=>{
    event.preventDefault();
    const values=Object.fromEntries(new FormData(form));
    const message=[
      'Hi Danny, I would like to request a showroom viewing.',
      'Car: '+title+' · Stock '+v.stockId,
      'Name: '+(values.name||''),
      'Phone / WhatsApp: '+(values.contact||''),
      'Preferred date: '+(values.date||''),
      values.note?'Question: '+values.note:'',
      'Vehicle page: '+location.origin+(window.SITE_BASE||'/')+'vehicle/'+v.id+'/'
    ].filter(Boolean).join('\n');
    const status=document.getElementById('viewingStatus');
    if(status)status.textContent='Opening WhatsApp…';
    window.location.href='https://wa.me/'+d.profile.phone+'?text='+encodeURIComponent(message);
  };
}else if(form){
  form.onsubmit=async event=>{
    event.preventDefault();
    const s=document.getElementById('viewingStatus'),button=form.querySelector('button');
    button.disabled=true;s.textContent='Sending your request…';
    try{
      const b=Object.fromEntries(new FormData(form));b.vehicleId=v.id;
      const r=await fetch('/api/cms/enquiry',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(b)}),data=await r.json();
      if(!r.ok)throw Error(data.error);s.textContent=data.message;form.reset();
    }catch(error){s.textContent=error.message+' You can also contact Danny on WhatsApp.';}
    finally{button.disabled=false;}
  };
}const hotspots=v.tour?.hotspots||[];if(v.id!=='audi-s5'&&hotspots.length){const section=document.getElementById('genericHotspots');section.className='public-panel';section.innerHTML='<h2>Explore the details</h2><div class="public-actions">'+hotspots.map((h,i)=>`<button class="public-button secondary" data-hotspot="${i}">${e(h.label)}</button>`).join('')+'</div><div id="genericHotspotContent"></div>';section.querySelectorAll('[data-hotspot]').forEach(b=>b.onclick=()=>{const h=hotspots[Number(b.dataset.hotspot)];document.getElementById('genericHotspotContent').innerHTML=`<h3>${e(h.title)}</h3>${h.imageSrc?`<img src="${e(h.imageSrc)}" alt="${e(h.title)}" style="max-width:100%;border-radius:12px">`:''}<p>${e(h.description)}</p>`;});}
if(!d.preview&&!d.staticSite)fetch('/api/cms/view',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({vehicleId:v.id})}).catch(()=>{});
if(new URLSearchParams(location.search).get('viewing')==='1'&&form){form.parentElement.open=true;form.scrollIntoView({block:'center'});}
if(v.id!=='audi-s5'&&hotspots.length){const section=document.getElementById('genericHotspots'),scene=document.createElement('div');scene.className='public-gallery-main';scene.style.position='relative';scene.innerHTML=`<img src="${e(photos.find(m=>!m.video)?.url||'')}" alt="${e(title)}">`;section.querySelectorAll('[data-hotspot]').forEach(b=>{const h=hotspots[Number(b.dataset.hotspot)];b.style.cssText=`position:absolute;left:${h.x};top:${h.y};transform:translate(-50%,-50%);padding:8px 12px`;scene.append(b);});section.insertBefore(scene,section.querySelector('#genericHotspotContent'));}
})();
