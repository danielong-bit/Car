import {loadSiteUi} from './site-ui-loader.mjs';
/* Deterministic matching uses published available stock only. Missing evidence never earns a condition score. */
export function verifiedGrade(car){
 if(car.conditionExample||!car.gradeVerified)return null;
 const value=String(car.auctionGrade||'').toUpperCase();
 if(value==='S')return 7;
 const grade=Number(value);
 return value!==''&&Number.isFinite(grade)&&grade>0?grade:null;
}
export function matchCars(vehicles,answer={}){
 const eligible=vehicles.filter(v=>v.status==='available'&&(!answer.body||answer.body==='any'||v.body===answer.body)&&(!answer.transmission||answer.transmission==='any'||v.transmission===answer.transmission)&&(!(answer.min>0)||(v.priceRm!=null&&v.priceRm>=answer.min))&&(!(answer.max>0)||(v.priceRm!=null&&v.priceRm<=answer.max)));
 const numberOr=(v,fallback)=>v==null||!Number.isFinite(Number(v))?fallback:Number(v);
 const sorted=[...eligible].sort((a,b)=>{
  let delta=0;
  if(answer.priority==='mileage')delta=numberOr(a.mileageKm,Infinity)-numberOr(b.mileageKm,Infinity);
  else if(answer.priority==='newest')delta=numberOr(b.year,-Infinity)-numberOr(a.year,-Infinity);
  else if(answer.priority==='condition')delta=(verifiedGrade(b)??-1)-(verifiedGrade(a)??-1);
  else delta=numberOr(a.priceRm,Infinity)-numberOr(b.priceRm,Infinity);
  return (Number.isNaN(delta)?0:delta)||numberOr(a.priceRm,Infinity)-numberOr(b.priceRm,Infinity)||String(a.stockId).localeCompare(String(b.stockId));
 });
 return {cars:sorted.slice(0,3),total:eligible.length,conditionVerified:eligible.some(v=>verifiedGrade(v)!=null)};
}
export function openCarFinder(dialog,{vehicles,lang='en',details,wa,hydrate}){
 const tr=(en,zh,ms)=>lang==='zh'?zh:lang==='ms'?ms:en;
 const e=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const money=n=>n==null?tr('Ask Danny','联系 Danny','Tanya Danny'):'RM '+Number(n).toLocaleString('en-MY');
 const answer={min:0,max:0,body:'any',transmission:'any',priority:'price'};
 let step=0,budgetText=tr('No fixed budget','不限预算','Tiada bajet tetap'),progressHost,disposeProgress;
 const bodies=[...new Set(vehicles.filter(v=>v.status==='available'&&v.body).map(v=>v.body))];
 const nameBody=v=>({MPV:tr('Family MPV','家庭 MPV','MPV keluarga'),SUV:'SUV',Sedan:tr('Sedan','轿车','Sedan'),Wagon:tr('Wagon','旅行车','Wagon'),Coupe:tr('Coupe','双门轿跑','Coupe')})[v]||v;
 const priorityLabel=()=>({price:tr('Best price','价格优先','Harga terbaik'),mileage:tr('Lowest mileage','低里程优先','Perbatuan rendah'),condition:tr('Verified condition','已核实车况优先','Keadaan disahkan'),newest:tr('Newest year','年份较新优先','Tahun terkini')})[answer.priority];
 const summary=()=>[budgetText,answer.body==='any'?tr('Any body type','不限车型','Semua jenis'):nameBody(answer.body),answer.transmission==='any'?tr('Auto or manual','不限变速箱','Auto atau manual'):answer.transmission,priorityLabel()].join(' · ');
 const chip=(value,title,description='')=>`<button type="button" class="finder-choice" data-answer="${e(value)}"><strong>${e(title)}</strong>${description?`<span>${e(description)}</span>`:''}<span class="finder-choice-arrow" aria-hidden="true">↗</span></button>`;
 const close=()=>dialog.close();
 function shell(content,result=false){
  if(result){disposeProgress?.();disposeProgress=undefined;progressHost=undefined;}else progressHost?.remove();
  dialog.innerHTML=`<div class="finder-head"><span class="eyebrow">${tr('FIND YOUR CAR','找到适合你的车','CARI KERETA ANDA')}</span><button type="button" data-finder-close aria-label="${tr('Close','关闭','Tutup')}">×</button></div>${!result?`<div data-finder-progress><div class="finder-progress" aria-hidden="true">${[0,1,2,3].map(i=>`<span class="${i<=step?'complete':''}"></span>`).join('')}</div></div><p class="finder-step">${tr('Step','第','Langkah')} ${step+1} / 4</p>`:''}${content}<div class="finder-footer">${step>0&&!result?`<button type="button" data-finder-back>${tr('← Back','← 上一步','← Kembali')}</button>`:''}<button type="button" data-finder-close>${tr('Cancel','取消','Batal')}</button></div>`;
  if(!result){
   const placeholder=dialog.querySelector('[data-finder-progress]');
   if(progressHost)placeholder.replaceWith(progressHost);else progressHost=placeholder;
   const host=progressHost,current=step+1;
   host.setAttribute('aria-label',`${tr('Step','步骤','Langkah')} ${current} / 4`);
   loadSiteUi().then(ui=>{if(dialog.open&&host.isConnected)disposeProgress=ui.renderFinderStepper(host,current,lang);}).catch(()=>{});
  }
  dialog.querySelectorAll('[data-finder-close]').forEach(b=>b.onclick=close);
  dialog.querySelector('[data-finder-back]')?.addEventListener('click',()=>{step--;render();});
  dialog.querySelector('h2')?.focus({preventScroll:true});
 }
 function render(){
  if(step===4){results();return;}
  const titles=[tr('What is your budget?','你的预算是多少？','Berapakah bajet anda?'),tr('What kind of car?','你偏好哪种车型？','Jenis kereta pilihan?'),tr('Auto or manual?','Auto 还是 Manual？','Auto atau manual?'),tr('What matters most?','你最在意什么？','Apa paling penting?')];
  let choices='';
  if(step===0)choices=[['0:200000','Under RM 200,000'],['200000:300000','RM 200,000–300,000'],['300000:400000','RM 300,000–400,000'],['400000:0','RM 400,000+'],['0:0',tr('No fixed budget','不限预算','Tiada bajet tetap')],['custom',tr('Set my budget','自己填写预算','Tetapkan bajet')]].map(([value,label])=>chip(value,label)).join('');
  if(step===1)choices=[...bodies.map(v=>chip(v,nameBody(v))),chip('any',tr('Open to any type','任何车型都可以','Mana-mana jenis'))].join('');
  if(step===2)choices=[chip('Auto','Auto'),chip('Manual','Manual'),chip('any',tr('Either is fine','两种都可以','Kedua-duanya boleh'))].join('');
  if(step===3)choices=[chip('mileage',tr('Lowest mileage','最低里程','Perbatuan terendah')),chip('condition',tr('Best condition','最佳车况','Keadaan terbaik'),tr('Ranks verified grades','按已核实等级排序','Susun gred disahkan')),chip('price',tr('Best price','最优价格','Harga terbaik')),chip('newest',tr('Newest year','年份最新','Tahun terkini'))].join('');
  shell(`<h2 tabindex="-1">${titles[step]}</h2><div class="finder-options">${choices}</div><div id="finderCustom"></div>`);
  dialog.querySelectorAll('[data-answer]').forEach(b=>b.onclick=()=>{
   const value=b.dataset.answer;
   if(step===0){
    if(value==='custom'){
     dialog.querySelector('#finderCustom').innerHTML=`<form id="finderBudgetForm"><label>${tr('Maximum budget (RM)','最高预算（RM）','Bajet maksimum (RM)')}<input id="finderMax" type="number" min="1" max="100000000" step="1" inputmode="numeric" required placeholder="160000"></label><button type="submit" class="button">${tr('Continue','继续','Teruskan')} →</button></form>`;
     dialog.querySelector('#finderMax').focus();
     dialog.querySelector('#finderBudgetForm').onsubmit=event=>{event.preventDefault();const max=Number(dialog.querySelector('#finderMax').value);if(!Number.isFinite(max)||max<=0)return;answer.min=0;answer.max=max;budgetText=tr('Up to ','最高 ','Sehingga ')+money(max);step++;render();};return;
    }
    [answer.min,answer.max]=value.split(':').map(Number);budgetText=b.querySelector('strong').textContent;
   }else if(step===1)answer.body=value;
   else if(step===2)answer.transmission=value;
   else answer.priority=value;
   step++;render();
  });
 }
 function results(){
  const {cars,total,conditionVerified}=matchCars(vehicles,answer);
  const title=cars.length===3?tr('Here are your 3 matches','这三辆车适合你的需求','Ini 3 padanan anda'):cars.length?tr(`We found ${cars.length} ${cars.length===1?'match':'matches'}`,`找到 ${cars.length} 辆符合条件的车`,`Kami jumpa ${cars.length} padanan`):tr('No exact matches right now','目前没有完全符合的现车','Tiada padanan tepat buat masa ini');
  const note=answer.priority==='condition'&&!conditionVerified?`<p class="finder-notice">${tr('Verified condition grades are not available for these matches yet. Ask Danny for the original reports.','这些车辆尚无已核实等级；请向 Danny 索取原始报告。','Gred disahkan belum tersedia. Minta laporan asal daripada Danny.')}</p>`:'';
  const message=`Hi Danny, I used Find Your Car.\nPreferences: ${summary()}\n${cars.length?'Matching stock: '+cars.map(v=>`${v.make} ${v.model} (${v.stockId})`).join(', '):'Please help me find a car matching these requirements.'}`;
  shell(`<h2 tabindex="-1">${e(title)}</h2><p class="finder-summary">${e(summary())}</p>${note}<div class="finder-results">${cars.map(v=>{
   const reason=answer.priority==='mileage'&&v.mileageKm!=null?`${Number(v.mileageKm).toLocaleString()} km`:answer.priority==='newest'?String(v.year||''):answer.priority==='condition'?(verifiedGrade(v)!=null?tr('Verified grade ','已核实等级 ','Gred disahkan ')+v.auctionGrade:tr('Grade not verified','等级待核实','Gred belum disahkan')):tr('Within your selection','符合所选条件','Mengikut pilihan anda');
   return `<article class="finder-result"><img data-source="${e(v.coverImageUrl)}" alt="${e(v.make+' '+v.model)}" width="180" height="120"><div><h3>${e(v.make+' '+v.model)}</h3><small>Stock #${e(v.stockId)}</small>${answer.priority!=='price'?`<p>${e(reason)}</p>`:''}<strong>${money(v.priceRm)}</strong><div class="finder-result-actions"><a class="button small" href="${details(v)}" data-detail-id="${e(v.id)}">${tr('Details','详情','Butiran')} ↗</a><a class="finder-whatsapp" href="${e(wa(message+'\nI am interested in Stock #'+v.stockId+'\n'+location.origin+details(v)))}" target="_blank" rel="noopener">WhatsApp ↗</a></div></div></article>`;
  }).join('')}</div>${total>3?`<p class="finder-summary">${tr(`${total} cars fit your selection; showing your top three.`,`${total} 辆符合条件，先显示前三辆。`,`${total} kereta sepadan; memaparkan tiga teratas.`)}</p>`:''}<div class="finder-result-footer"><a class="button whatsapp-action" href="${e(wa(message))}" target="_blank" rel="noopener">WhatsApp Danny ↗</a><button type="button" id="finderAgain">${tr('Start again','重新选择','Mula semula')}</button></div>`,true);
  dialog.querySelector('#finderAgain').onclick=()=>{step=0;render();};hydrate();
 }
 const trigger=document.activeElement;
 dialog.onclose=()=>{disposeProgress?.();disposeProgress=undefined;document.body.classList.remove('finder-open');trigger?.focus?.({preventScroll:true});};
 document.body.classList.add('finder-open');render();dialog.showModal();dialog.querySelector('h2')?.focus();
}
