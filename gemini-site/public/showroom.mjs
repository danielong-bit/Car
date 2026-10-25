import {renderContactFaq} from './contact-faq.mjs';
import {recordVisit} from './visitor-stats.mjs';
import {renderShell} from './site-shell.mjs';
import {renderBuyingTools} from './buying-tools.mjs';
import {applyTheme} from './site-theme.mjs';
import {openCarFinder} from './car-finder.mjs';
import {loadSiteUi} from './site-ui-loader.mjs';
import {mountContactLanyard} from './contact-lanyard.mjs';
import {visibleBrandFilters,matchesInventorySelection} from './inventory-brand-filters.mjs?v=stock-20261019d';
import {galleryMarkup,bindGallery} from './vehicle-gallery.mjs';
import {renderServiceCare} from './service-care.mjs';
import {calculatorMarkup,bindVehicleCalculator,conditionValues,translator} from './vehicle-tools.mjs';
import {normalizeDocument,deriveSpecialBadges,estimate,label} from './inventory-domain.mjs?v=stock-themes-20261019';
import {readLocal,deleteLocal,photoUrl} from './browser-stock.mjs';
import {icon} from './stock-icons.mjs?v=clarity-20261020a';
const $=s=>document.querySelector(s),base=window.SITE_BASE||'/',esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const words={Stock:['现车','Stok'],About:['关于','Tentang'],Service:['隔热膜服务','Perkhidmatan'],'Find Your Car':['帮我选车','Cari Kereta Anda'],'Browse All Stock':['浏览全部现车','Lihat Semua Stok'],Details:['详情','Butiran'],'Take the long way home.':['让回家的路，多一点期待。','Nikmati perjalanan pulang.'],'Thoughtfully selected Japanese reconditioned cars for a more rewarding journey in Malaysia.':['用心甄选日本进口 RECOND 车，陪你开启更从容的下一程。','Kereta recond Jepun pilihan teliti untuk perjalanan yang lebih bermakna di Malaysia.'],'Explore inventory':['浏览现车','Terokai inventori'],'Talk to Danny':['联系 Danny','Hubungi Danny'],'Contact Danny':['联系 Danny','Hubungi Danny'],'Find your next car.':['找到你的下一辆车。','Temui kereta seterusnya.'],Home:['首页','Utama'],Services:['车主服务','Perkhidmatan'],Tinted:['隔热膜配套','Filem tingkap'],Chat:['联系','Chat'],Powertrain:['动力系统','Rangkaian kuasa'],'Exterior & chassis':['外观与底盘','Luaran & casis'],'Interior & equipment':['内饰与配备','Dalaman & kelengkapan'],'Vehicle status':['车辆状态','Status kereta'],Observed:['细节记录','Pemerhatian'],Chassis:['底盘编号','Casis'],Wagon:['旅行车','Wagon'],Coupe:['双门跑车','Coupe'],Sedan:['轿车','Sedan'],SUV:['SUV','SUV'],MPV:['MPV','MPV'],Hatchback:['掀背车','Hatchback'],Convertible:['敞篷跑车','Convertible'],Example:['示例','Contoh'],
 'Inventory':['车辆库存','Inventori'],'Contact':['联系','Hubungi'],'Services & Tint':['服务与隔热膜','Servis & Tinted'],'Ask Danny on WhatsApp':['WhatsApp 联系 Danny','WhatsApp Danny'],'Navigate':['网站导航','Navigasi'],'Social':['社交平台','Sosial'],'Calculator':['月供计算器','Kalkulator'],'Deliveries':['交车时刻','Serahan'],'Deliveries.':['交车时刻。','Serahan.'],'Recent deliveries':['交车时刻','Serahan terkini'],'About Danny':['关于 Danny','Tentang Danny'],'JAPANESE RECOND CARS IN MALAYSIA':['马来西亚日本进口 RECOND 车','KERETA RECOND JEPUN DI MALAYSIA'],'JAPANESE RECON CARS IN MALAYSIA':['马来西亚日本进口 RECOND 车','KERETA RECOND JEPUN DI MALAYSIA'],'CURATED SHOWROOM COLLECTION':['甄选现车系列','KOLEKSI SHOWROOM TERPILIH'],'PRIVATE APPOINTMENT & DIRECT CONCIERGE':['私人看车预约与专属顾问','TEMU JANJI PERIBADI & PERUNDING TERUS'],'Your next car, personally guided.':['下一辆车，让 Danny 陪你选。','Kereta seterusnya, dibimbing sendiri.'],'Carefully selected. Honestly advised. Explore the details with Danny.':['用心选车，诚恳建议。和 Danny 一起看清车辆细节。','Dipilih teliti. Nasihat jujur. Terokai butiran bersama Danny.'],'Browse inventory':['浏览车辆 →','Lihat inventori →'],'FIND YOUR NEXT CHAPTER':['找到下一段旅程','CARI PERJALANAN SETERUSNYA'],'Explore the collection.':['看看心仪的车。','Terokai koleksi.'],'The details you need. A conversation when you are ready.':['先了解车辆，准备好了再聊。','Butiran yang anda perlukan. Berbual apabila bersedia.'],'Plan your monthly payment':['计算你的月供 ↗','Rancang ansuran bulanan ↗'],'Featured only':['只看精选','Pilihan sahaja'],'KNOW WHAT YOU ARE BUYING':['看清车辆，安心选择','KENALI KERETA ANDA'],'A grade is a starting point.':['从等级开始，了解更多。','Gred ialah titik permulaan.'],'Ask Danny to review the original auction report with you. Independent pre-purchase inspections are welcome.':['欢迎向 Danny 查看原始拍卖报告，也欢迎安排独立购车前检测。','Semak laporan lelong asal bersama Danny. Pemeriksaan bebas sebelum membeli dialu-alukan.'],'Ask about an auction report':['了解拍卖报告 ↗','Tanya laporan lelong ↗'],'Excellent':['极佳','Cemerlang'],'Very good':['非常好','Sangat baik'],'Good':['良好','Baik'],'Fair':['一般','Sederhana'],'Repaired':['有修复记录','Dibaiki'],'Interior grades describe cabin condition. Ask for the report, photos and condition notes.':['内饰等级用于描述车厢状况，请结合报告、照片与车况记录。','Gred dalaman menerangkan keadaan kabin. Minta laporan, foto dan nota keadaan.'],'COLLECTION DAYS WITH DANNY':['和 DANNY 的交车时刻','HARI SERAHAN BERSAMA DANNY'],'Recent deliveries.':['交车时刻。','Serahan terkini.'],'Real moments from the showroom, shared with permission.':['经许可分享的展厅与交车时刻。','Detik showroom dikongsi dengan izin.'],'YOUR DIRECT CONTACT':['直接联系 DANNY','HUBUNGI DANNY TERUS'],'A car. A conversation. Danny.':['聊聊你的下一辆车。','Kereta. Perbualan. Danny.'],'TRANSPARENT RECOND ASSURANCE':['透明 RECOND 购车保障','JAMINAN KERETA RECOND TELUS'],'Before you decide':['决定之前','Sebelum anda memilih'],'Discuss the original auction report, import documents, registration, warranty and any inspection with Danny for the specific car.':['向 Danny 了解这辆车的原始拍卖报告、进口文件、注册、保修与独立验车安排。','Bincang laporan lelong asal, dokumen import, pendaftaran, waranti dan pemeriksaan kereta bersama Danny.'],'Talk through the details':['咨询详情 ↗','Bincang butiran ↗'],'Stock workbench':['库存工作台 ↗','Meja inventori ↗'],'Back to stock':['返回车辆列表','Kembali ke inventori'],'Search model, stock #, colour...':['搜索车型、库存编号、颜色…','Cari model, ID stok, warna…'],'Search stock ID, make or model':['搜索车型、库存编号、颜色…','Cari model, ID stok, warna…'],'Make':['品牌','Jenama'],'All makes':['全部品牌','Semua jenama'],'Status':['状态','Status'],'All stock':['全部车辆','Semua stok'],'Available':['可售','Tersedia'],'Booked':['已预订','Ditempah'],'Sold':['已售','Terjual'],'Location':['展厅地点','Lokasi'],'All locations':['全部地点','Semua lokasi'],'Transmission':['变速箱','Transmisi'],'All':['全部','Semua'],'Auto':['自动','Auto'],'Manual':['手动','Manual'],'Body':['车身','Badan'],'All body types':['全部车身类型','Semua jenis badan'],'Sort':['排序','Susun'],'Newest year':['年份由新到旧','Tahun terkini'],'Price: low → high':['价格：由低到高','Harga: rendah → tinggi'],'Price: high → low':['价格：由高到低','Harga: tinggi → rendah'],'Price: low to high':['价格：由低到高','Harga: rendah → tinggi'],'Price: high to low':['价格：由高到低','Harga: tinggi → rendah'],'Lowest mileage':['里程由低到高','Perbatuan terendah'],'Cards':['卡片','Kad'],'Compact':['精简','Ringkas'],'AVAILABLE':['可售','TERSEDIA'],'BOOKED':['已预订','DITEMPAH'],'SOLD':['已售','TERJUAL'],'LOW KM':['低里程','KM RENDAH'],'View':['查看','Lihat'],'Reset':['重置','Tetap semula'],'Compare':['加入比较','Bandingkan'],'Selected':['已加入','Dipilih'],'View details':['查看详情','Lihat butiran'],'Enquire':['询问详情','Tanya'],'Enquire about similar stock':['询问同类车辆','Tanya stok serupa'],'vehicles':['辆车','kereta'],'Units available':['辆可售车辆','Unit tersedia'],'No matching cars.':['没有符合条件的车辆。','Tiada kereta sepadan.'],'Try another filter or reset to see the collection.':['试试其他筛选，或重置查看全部车辆。','Cuba penapis lain atau tetapkan semula.'],'Compare your shortlist':['比较心仪车辆','Bandingkan senarai anda'],'Clear':['清除','Kosongkan'],'selected':['已选择','dipilih'],'Choose up to 3 cars to compare.':['最多可比较 3 辆车。','Pilih sehingga 3 kereta.'],'Cash price':['车价','Harga tunai'],'Monthly estimate':['月供估算','Anggaran bulanan'],'Year':['年份','Tahun'],'Mileage':['里程','Perbatuan'],'Auction / interior grade':['拍卖 / 内饰等级','Gred lelong / dalaman'],'Engine':['引擎','Enjin'],'Colour':['颜色','Warna'],'Features':['配置','Ciri'],'Not provided':['尚未提供','Belum diberikan'],'Condition notes':['车况记录','Nota keadaan'],'Photo gallery':['车辆图库','Galeri foto'],'View full photo':['查看大图','Lihat foto penuh'],'Plan my payment':['计算月供','Rancang ansuran'],'Book a showroom viewing':['预约到店看车','Tempah lawatan showroom'],'Your name':['你的姓名','Nama anda'],'Phone / WhatsApp':['电话 / WhatsApp','Telefon / WhatsApp'],'Preferred date':['希望日期','Tarikh pilihan'],'Your question (optional)':['想了解什么（选填）','Soalan anda (pilihan)'],'Continue in WhatsApp':['前往 WhatsApp','Teruskan di WhatsApp'],'Vehicle information':['车辆资料','Maklumat kereta'],'CAR EXPLAINED BY DANNY':['DANNY 亲自讲车','KERETA DIJELASKAN DANNY'],'See the car. Hear the story.':['看车辆，也听 Danny 介绍。','Lihat kereta. Dengar ceritanya.'],'Watch on TikTok':['在 TikTok 观看 ↗','Tonton di TikTok ↗'],'Facebook version':['在 Facebook 观看 ↗','Versi Facebook ↗'],'Play walkthrough':['播放讲车视频','Mainkan video'],'Video':['视频','Video'],'Watch video':['观看交车视频','Tonton video'],'Lowest':['最低价','Terendah'],'Newest':['最新年份','Terkini'],'Lowest km':['最低里程','KM terendah'],'Personal Sourcing':['专属寻车服务','Carian Kereta Peribadi'],'Looking for a specific JDM or European spec?':['正在寻找特定日本或欧系车型？','Mencari spesifikasi JDM atau Eropah tertentu?'],'Tell Danny your preferred model, grade and budget for direct auction or showroom sourcing.':['告诉 Danny 你心仪的车型、拍卖等级与预算，安排专属寻车与验车。','Beritahu Danny model, gred dan bajet pilihan anda untuk carian terus.'],'Ask Danny to source a car':['向 Danny 咨询寻车 ↗','Minta Danny cari kereta ↗'],'Original report review':['原始报告核对','Semakan laporan asal'],'Ask to review the original auction report and arrange a pre-purchase inspection with Danny.':['请向 Danny 查看原始拍卖报告，并咨询独立验车。','Semak laporan lelong asal dan atur pemeriksaan bersama Danny.'],'Showroom area':['展厅地区','Kawasan showroom'],'Open GPS':['打开地图','Buka GPS'],'Copy location':['复制地点','Salin lokasi'],'Copied':['已复制','Disalin'],'Call Danny':['致电 Danny','Telefon Danny'],'Email Danny':['发邮件给 Danny','E-mel Danny'],'More cars with Danny':['关注 Danny，看更多车','Lagi kereta bersama Danny'],'Past delivery':['过往交车','Serahan lalu'],'Ask about similar cars':['询问同类车 ↗','Tanya kereta serupa ↗'],'Explore other cars':['看看其他车辆','Terokai kereta lain'],'Vehicle not found':['找不到这辆车','Kereta tidak ditemui'],'The car may no longer be listed. Browse current stock or contact Danny.':['这辆车可能已下架，请浏览现有车辆或联系 Danny。','Kereta ini mungkin tiada lagi. Lihat stok atau hubungi Danny.']};
let lang='en';try{lang=localStorage.getItem('danny-language')||localStorage.getItem('danny-site-language')||'en';}catch{}if(!['en','zh','ms'].includes(lang))lang='en';
let viewMode='cards';try{viewMode=localStorage.getItem('danny-view-mode')||'cards';}catch{}if(!['cards','compact'].includes(viewMode))viewMode='cards';
const t=input=>{const s=input==='Inventory'?'Stock':input;return lang==='en'?s:words[s]?.[lang==='zh'?0:1]||s;},tr=(en,zh,ms)=>lang==='zh'?zh:lang==='ms'?ms:en;
const money=n=>n==null?t('Enquire'):'RM '+Number(n).toLocaleString('en-MY'),statusName=s=>t(s==='reserved'?'Booked':label(s));
let d=normalizeDocument(window.CMS_DATA||{vehicles:[]}),compare=[],filters={search:'',make:'',status:'',sort:'price-up',featured:false},toastTimer;
let customerInteracted=false;
const rememberInteraction=()=>{customerInteracted=true;};
document.addEventListener('input',rememberInteraction,{capture:true,once:true});
document.addEventListener('change',rememberInteraction,{capture:true,once:true});
document.addEventListener('click',event=>{
 if(event.target instanceof Element&&event.target.closest('#vehicleGallery,#vehicleCalculator,#buyingTools,#viewingForm,#carFinder'))rememberInteraction();
},{capture:true});
const localPreview=new URLSearchParams(location.search).get('local-preview')==='1';
const url=(route='')=>base+route.replace(/^\//,''),canonicalDetailsUrl=v=>localPreview?url('audi/?vehicle='+encodeURIComponent(v.id)+'&local-preview=1'):url('vehicle/'+encodeURIComponent(v.id)+'/'),details=v=>typeof document!=='undefined'&&document.body?.classList?.contains('exhibition-home')?url('?vehicle='+encodeURIComponent(v.id)+(localPreview?'&local-preview=1':'')):canonicalDetailsUrl(v),wa=message=>'https://wa.me/'+(d.profile.phone||'60125686528')+'?text='+encodeURIComponent(message);
const enquiry=v=>wa(`Hi Danny, ${v.status==='reserved'||v.status==='sold'?'please share similar available stock to':'I am interested in'} ${v.year||''} ${v.make} ${v.model} ${v.variant}, Stock #${v.stockId}, ${money(v.priceRm)}. Please share the details.\n${location.origin}${canonicalDetailsUrl(v)}`);
let lazyObserver,revealObserver,preloadedUrls=new Set();
function staticImgSrc(u){
 const p=String(u||'');
 if(!p||p.startsWith('/assets/uploads/'))return '';
 if(base!=='/'&&p.startsWith(base))return p;
 return p.startsWith('/assets/')?base+p.slice(1):p;
}
function preloadShowroomPhotos(){
 try{
  const urls=new Set();
  (d?.vehicles||[]).forEach(v=>{
   if(v?.coverImageUrl)urls.add(staticImgSrc(v.coverImageUrl));
   (v?.gallery||[]).slice(0,6).forEach(g=>{if(g?.url&&!g.video)urls.add(staticImgSrc(g.url));});
  });
  ['/assets/audi-s5/audio_16x9.jpg','/assets/audi-s5/engine_16x9.jpg','/assets/audi-s5/wheel_16x9.jpg','/assets/audi-s5/seats_16x9.jpg','/assets/audi-s5/dashboard_16x9.jpg','/assets/audi-s5/boot_16x9.jpg','/assets/audi-s5/climate_16x9.jpg'].forEach(u=>urls.add(staticImgSrc(u)));
  urls.forEach(src=>{
   if(!src||preloadedUrls.has(src))return;
   preloadedUrls.add(src);
   const img=new Image();
   img.decoding='sync';
   img.src=src;
  });
 }catch{}
}
function markImgReady(img){
 if(!img)return;
 img.classList.add('is-loaded');
 const wrap=img.closest('.stock-photo,.compact-thumb,.other-car-photo,.testimonial-photo-btn,.gallery-stage');
 if(wrap)wrap.classList.add('is-photo-ready');
}
async function resolveImg(img){
 if(!img.dataset.source||img.dataset.hydrated===img.dataset.source)return;
 img.dataset.hydrated=img.dataset.source;
 const fastSrc=staticImgSrc(img.dataset.source);
 if(fastSrc&&img.getAttribute('src')===fastSrc){
  if(img.complete&&img.naturalWidth>0)markImgReady(img);
  else img.addEventListener('load',()=>markImgReady(img),{once:true});
  markImgReady(img);
  return;
 }
 const resolved=await photoUrl(img.dataset.source,base);
 if(resolved&&img.getAttribute('src')!==resolved)img.src=resolved;
 markImgReady(img);
}
async function hydrateImages(){
 preloadShowroomPhotos();
 const imgs=[...document.querySelectorAll('img[data-source]')];
 imgs.forEach(img=>{
  img.setAttribute('loading','eager');
  img.setAttribute('decoding','sync');
  const fastSrc=staticImgSrc(img.dataset.source);
  if(fastSrc&&!img.getAttribute('src'))img.setAttribute('src',fastSrc);
  if(img.complete)markImgReady(img);
  else img.addEventListener('load',()=>markImgReady(img),{once:true});
  markImgReady(img);
 });
 await Promise.all(imgs.map(resolveImg));
}
function observeScrollReveal(){
 const targets=[...document.querySelectorAll('.reveal-on-scroll:not(.is-visible)')];
 if(!targets.length)return;
 if(typeof IntersectionObserver==='undefined'||window.matchMedia('(prefers-reduced-motion: reduce)').matches){
  targets.forEach(el=>el.classList.add('is-visible'));
  return;
 }
 if(!revealObserver){
  revealObserver=new IntersectionObserver(entries=>{
   entries.forEach(entry=>{
    if(entry.isIntersecting){
     entry.target.classList.add('is-visible');
     revealObserver.unobserve(entry.target);
    }
   });
  },{rootMargin:'80px 0px',threshold:0.05});
 }
 targets.forEach(el=>{
  const rect=el.getBoundingClientRect();
  if(rect.top<window.innerHeight+80){
   el.classList.add('is-visible');
  }else{
   revealObserver.observe(el);
  }
 });
}
function translate(){document.documentElement.lang=lang==='zh'?'zh-Hans':lang;document.querySelectorAll('[data-i18n]').forEach(el=>el.textContent=t(el.dataset.i18n));const s=$('#languageSelect');if(s)s.value=lang;document.dispatchEvent(new Event('danny:language-change'));}
function toast(s){$('#publicToast').hidden=false;$('#publicToast').textContent=s;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#publicToast').hidden=true,4500);}
function modal(id){const dialog=$(id);if(!dialog)return;dialog.showModal();dialog.querySelector('[data-close]').onclick=()=>dialog.close();dialog.onclick=e=>{if(e.target===dialog)dialog.close();};}
function openPhoto(source,title,navigation){
 const dialog=$('#photoModal');if(!dialog)return;
 dialog.dataset.gallery=String(Boolean(navigation));
 const stage=$('.lightbox-stage'),vid=$('#lightboxVideo');
 if(stage)stage.hidden=false;
 if(vid){vid.hidden=true;vid.innerHTML='';}
 $('#lightboxPhoto').src=source;$('#lightboxPhoto').alt=title;$('#photoTitle').textContent=title;
 const tr=translator(lang);$('#lightboxPrevious').setAttribute('aria-label',tr('Previous photo','上一张照片','Foto sebelumnya'));$('#lightboxNext').setAttribute('aria-label',tr('Next photo','下一张照片','Foto seterusnya'));dialog.querySelector('[data-close]').setAttribute('aria-label',tr('Close photo','关闭照片','Tutup foto'));$('#lightboxCount').setAttribute('aria-live','polite');
 for(const id of ['lightboxPrevious','lightboxNext','lightboxCount'])$('#'+id).hidden=!navigation;
 if(navigation){$('#lightboxPrevious').onclick=navigation.previous;$('#lightboxNext').onclick=navigation.next;$('#lightboxPrevious').disabled=$('#lightboxNext').disabled=navigation.disabled;$('#lightboxCount').textContent=navigation.count;}
 dialog.onclose=()=>{if(vid)vid.innerHTML='';};
 modal('#photoModal');
}
function specBadgeClass(tag){
 const u=String(tag).toUpperCase();
 if(u==='RS'||u==='TYPE R'||u==='GR'||u==='AMG')return 'spec-badge badge-rs';
 if(u==='RF'||u==='F SPORT'||u==='S-SPORT'||u==='S-LINE'||u==='M SPORT')return 'spec-badge badge-rf';
 if(u==='LOW KM')return 'spec-badge badge-lowkm';
 return 'spec-badge badge-custom';
}
function badgeClusterMarkup(v,{inline=false}={}){
 if(inline){
  const special=deriveSpecialBadges(v,d.homepage).filter(tag=>tag!=='LOW KM');
  const pills=special.map(tag=>`<span class="${specBadgeClass(tag)}">${esc(tag)}</span>`);
  return pills.length?`<div class="detail-badge-cluster">${pills.join('')}</div>`:'';
 }
 const state=v.status==='sold'?'SOLD':v.status==='reserved'?'BOOKED':'AVAILABLE';
 return `<span class="photo-status" data-status="${esc(v.status||'available')}">${esc(t(state))}</span>`;
}
function photoMarkup(v){
 const srcAttr=staticImgSrc(v.coverImageUrl);
 return `<div class="stock-photo${srcAttr?' is-photo-ready':''}"><a href="${details(v)}" data-detail-id="${esc(v.id)}">${v.coverImageUrl?`<img ${srcAttr?`src="${esc(srcAttr)}" `:''}data-source="${esc(v.coverImageUrl)}" class="is-loaded" style="object-position:${Number(v.gallery[0]?.cropX??50)}% ${Number(v.gallery[0]?.cropY??50)}%" alt="${esc(v.make+' '+v.model)}" loading="eager" fetchpriority="high" decoding="sync" width="640" height="400">`:`<div class="photo-placeholder">${icon('photo')}<span>${lang==='zh'?'车辆照片待上传':lang==='ms'?'Foto akan ditambah':'Photos to be added'}</span></div>`}</a>${badgeClusterMarkup(v)}</div>`;
}
function listingFacts(v){
 const c=conditionValues(v),grade=[c.auctionGrade,c.interiorGrade].filter(Boolean).join('/');
 return `<strong>${v.year||'—'}</strong><strong>${v.mileageKm==null?'—':Number(v.mileageKm).toLocaleString()+' km'}</strong>${grade?`<span class="listing-grade" aria-label="${esc(t('Grade')+' '+grade)}"><span class="listing-grade-label">${t('Grade')} </span><strong>${esc(grade)}</strong>${c.example?`<sup title="${esc(t('Example'))}" aria-label="${esc(t('Example'))}">*</sup>`:''}</span>`:`<span class="listing-grade"><strong>${esc(t(v.transmission||'Auto'))}</strong></span>`}`;
}
function listingPrice(v){
 if(v.status==='sold')return esc(t('SOLD'));
 return v.status==='reserved'&&v.priceRm!=null?`<s>${money(v.priceRm)}</s>`:money(v.priceRm);
}
function listingCompare(v){return `<label class="compare-check"><input type="checkbox" data-compare="${esc(v.id)}" ${compare.includes(v.id)?'checked':''}><span>${t('Compare')}</span></label>`;}
function card(v,idx=0){
 const monthly=estimate(v,d.finance);
 const staggerMs=Math.min(Number(idx)||0,11)*45;
 return `<article class="stock-card reveal-on-scroll is-visible" style="--card-stagger:${staggerMs}ms;--reveal-delay:${staggerMs}ms" data-id="${esc(v.id)}" data-status="${esc(v.status)}">${photoMarkup(v,idx<4)}<div class="stock-info"><div class="stock-identifiers"><code>#${esc(v.stockId)}</code>${v.variant?`<span class="stock-variant-tag">${esc(v.variant)}</span>`:''}</div><div class="card-heading-row"><a href="${details(v)}" data-detail-id="${esc(v.id)}"><h3>${esc(v.make)} ${esc(v.model)}</h3></a></div><div class="spec-row">${listingFacts(v)}</div><div class="stock-pricing-block"><div class="stock-price ${v.status==='sold'?'is-sold':''}">${listingPrice(v)}</div><p class="monthly-price">${monthly==null?t('Enquire'):'≈ '+money(monthly)+'/mo'}</p></div><div class="stock-card-footer">${listingCompare(v)}<a class="view-link" href="${details(v)}" data-detail-id="${esc(v.id)}">${t('Details')} →</a></div></div></article>`;
}
function compactRow(v,idx=0){
 const monthly=estimate(v,d.finance),srcAttr=staticImgSrc(v.coverImageUrl);
 const staggerMs=Math.min(Number(idx)||0,11)*35;
 return `<article class="compact-row reveal-on-scroll is-visible" style="--card-stagger:${staggerMs}ms;--reveal-delay:${staggerMs}ms" data-id="${esc(v.id)}" data-status="${esc(v.status)}"><a class="compact-thumb${srcAttr?' is-photo-ready':''}" href="${details(v)}" data-detail-id="${esc(v.id)}">${v.coverImageUrl?`<img ${srcAttr?`src="${esc(srcAttr)}" `:''}data-source="${esc(v.coverImageUrl)}" class="is-loaded" alt="${esc(v.make+' '+v.model)}" loading="eager" fetchpriority="high" decoding="sync">`:`<div class="photo-placeholder">${icon('photo')}</div>`}${badgeClusterMarkup(v)}</a><div class="compact-main"><div class="compact-title-line"><a href="${details(v)}" data-detail-id="${esc(v.id)}"><h3>${esc(v.make)} ${esc(v.model)}</h3></a><div class="stock-identifiers"><code>#${esc(v.stockId)}</code></div></div><div class="compact-meta">${listingFacts(v)}</div><div class="compact-bottom">${listingCompare(v)}</div></div><div class="compact-pricing"><div class="stock-price ${v.status==='sold'?'is-sold':''}">${listingPrice(v)}</div><p class="monthly-price">${monthly==null?t('Enquire'):'≈ '+money(monthly)+'/mo'}</p><a class="view-link" href="${details(v)}" data-detail-id="${esc(v.id)}">${t('Details')} →</a></div></article>`;
}
function selectControl(name,key,options){return `<label class="compact-field" ${key==='sort'?'data-sort-control':''}><span class="sr-only">${t(name)}</span><select data-filter="${key}" aria-label="${t(name)}">${options.map(([v,title])=>`<option value="${esc(v)}" ${filters[key]===v?'selected':''}>${esc(t(title))}</option>`).join('')}</select></label>`;}
function filterSheetConfig(){
 const statuses=[['','All stock'],['available','Available'],['reserved','Booked'],...(d.homepage.showSoldVehicles?[['sold','Sold']]:[])],tr=translator(lang);
 return {filters:{...filters},statuses:statuses.map(([value,title])=>({value,label:t(title)})),makes:visibleBrandFilters(d),sorts:[['price-up','Price: low → high'],['price-down','Price: high → low']].map(([value,title])=>({value,label:t(title)})),labels:{filters:tr('Filters','筛选','Penapis'),status:t('Status'),brand:tr('Brand','品牌','Jenama'),sortBy:tr('Sort by','排序方式','Susun mengikut'),featured:t('Featured only'),reset:t('Reset'),showResults:tr('Show results','查看车辆','Lihat kereta'),close:tr('Close filters','关闭筛选','Tutup penapis'),description:tr('Choose what you want to see.','选择想看的车辆。','Pilih kereta yang anda mahu lihat.')}};
}
window.getInventoryFilterSheetConfig=filterSheetConfig;
function renderViewToggle(){
 const host=$('#viewToggle');if(!host)return;
 host.innerHTML=`<button type="button" data-view="cards" aria-pressed="${viewMode==='cards'}">${icon('grid')}<span>${t('Cards')}</span></button><button type="button" data-view="compact" aria-pressed="${viewMode==='compact'}">${icon('list')}<span>${t('Compact')}</span></button>`;
 host.querySelectorAll('[data-view]').forEach(btn=>btn.onclick=()=>{
  viewMode=btn.dataset.view;
  try{localStorage.setItem('danny-view-mode',viewMode);}catch{}
  renderViewToggle();renderCards();
 });
}
function controls(){
 const tr=translator(lang),makes=visibleBrandFilters(d);
 const statuses=[['','All stock'],['available','Available'],['reserved','Booked'],...(d.homepage.showSoldVehicles?[['sold','Sold']]:[])];
 const currentStatus=statuses.find(([status])=>status===filters.status)?.[1]||'All stock';
 $('#inventoryControls').innerHTML=`<div class="inventory-controls"><div class="controls-top-row"><label class="search-field">${icon('search')}<input id="publicSearch" type="search" value="${esc(filters.search)}" placeholder="${tr('Search model, stock #…','搜索车型、库存编号…','Cari model, nombor stok…')}" aria-label="${t('Search model, stock #, colour...')}"></label>${selectControl('Sort','sort',[['price-up','Price: low → high'],['price-down','Price: high → low']])}</div><div class="filter-pills" role="group" aria-label="${t('Filter')}"><div class="pill-group" role="group" aria-label="${t('Status')}">${statuses.map(([status,title])=>`<button type="button" data-public-status="${status}" aria-pressed="${filters.status===status}">${t(title)} <span>${d.vehicles.filter(v=>(!status||v.status===status)&&matchesInventorySelection(v,{make:filters.make})).length}</span></button>`).join('')}</div>${makes.length?`<span class="pill-divider" aria-hidden="true"></span><div class="pill-group" role="group" aria-label="${t('Make')}">${makes.map(make=>`<button type="button" data-public-make="${esc(make)}" aria-pressed="${filters.make===make}">${esc(make)} <span>${d.vehicles.filter(v=>matchesInventorySelection(v,{make,status:filters.status})).length}</span></button>`).join('')}</div>`:''}<button type="button" id="resetPublic" class="pill-reset">${t('Reset')} ↺</button></div><div class="inventory-filter-note" ${filters.make?'':'hidden'}><span>${tr('Showing','当前筛选','Paparan')}: ${esc(t(currentStatus))} · <strong>${esc(filters.make)}</strong></span><button type="button" id="clearBrandFilter">${tr('Clear brand','清除品牌','Kosongkan jenama')} ×</button></div></div>`;
 window.dispatchEvent(new CustomEvent('danny:inventory-filter-config',{detail:filterSheetConfig()}));
 $('#publicSearch').oninput=e=>{filters.search=e.target.value;renderCards();};
 document.querySelectorAll('[data-filter]').forEach(select=>select.onchange=()=>{filters[select.dataset.filter]=select.value;renderCards();});
 document.querySelectorAll('[data-public-status]').forEach(button=>button.onclick=()=>{filters.status=button.dataset.publicStatus;controls();renderCards();document.querySelector(`[data-public-status="${filters.status}"]`)?.focus({preventScroll:true});});
 document.querySelectorAll('[data-public-make]').forEach(button=>button.onclick=()=>{const make=button.dataset.publicMake;filters.make=filters.make===make?'':make;controls();renderCards();[...document.querySelectorAll('[data-public-make]')].find(b=>b.dataset.publicMake===make)?.focus({preventScroll:true});});
 $('#clearBrandFilter').onclick=()=>{filters.make='';controls();renderCards();};
 $('#resetPublic').onclick=()=>{
  filters={search:'',make:'',status:'',sort:'price-up',featured:false};
  if($('#featuredFilter'))$('#featuredFilter').checked=false;
  controls();
  renderCards();
  const resetBtn=$('#resetPublic');
  if(resetBtn){
   resetBtn.classList.remove('is-reset-flashing');
   void resetBtn.offsetWidth;
   resetBtn.classList.add('is-reset-flashing');
   setTimeout(()=>resetBtn?.classList.remove('is-reset-flashing'),600);
  }
  toast(tr('All filters reset · Showing all stock','已重置全部筛选 · 显示全部现车','Penapis telah diset semula · Memaparkan semua stok'));
 };
 if($('#featuredFilter'))$('#featuredFilter').onchange=e=>{filters.featured=e.target.checked;renderCards();};
 renderViewToggle();
}
window.addEventListener('danny:inventory-filter-apply',event=>{
 const next=event.detail||{},allowedStatuses=['','available','reserved','sold'],allowedMakes=visibleBrandFilters(d);
 filters={search:String(next.search||''),make:allowedMakes.includes(next.make)?next.make:'',status:allowedStatuses.includes(next.status)?next.status:'',sort:next.sort==='price-down'?'price-down':'price-up',featured:Boolean(next.featured)};
 const search=$('#publicSearch'),featured=$('#featuredFilter');if(search)search.value=filters.search;if(featured)featured.checked=filters.featured;
 controls();renderCards();
});
function renderCards(){
 const cars=d.vehicles.filter(vehicle=>matchesInventorySelection(vehicle,filters));
 cars.sort((a,b)=>filters.sort==='price-down'?(b.priceRm??-1)-(a.priceRm??-1):(a.priceRm??Infinity)-(b.priceRm??Infinity));
 const availCount=cars.filter(v=>v.status==='available').length;
 const bookedCount=cars.filter(v=>v.status==='reserved').length;
 const soldCount=cars.filter(v=>v.status==='sold').length;
 const parts=[`${availCount} ${t('AVAILABLE')}`];
 if(bookedCount)parts.push(`${bookedCount} ${t('BOOKED')}`);
 if(soldCount||d.homepage.showSoldVehicles)parts.push(`${soldCount} ${t('SOLD')}`);
 $('#resultCount').textContent=parts.join('  ·  ');const inventoryCounts={available:availCount,sold:soldCount};window.dannyInventoryCounts=inventoryCounts;window.dispatchEvent(new CustomEvent('danny:inventory-counts',{detail:inventoryCounts}));
 const oldShowcase=$('#cardLayoutCompareShowcase');if(oldShowcase)oldShowcase.remove();
 try{localStorage.removeItem('danny-card-layout');}catch{}
 const grid=$('#inventoryGrid');
 grid.classList.toggle('compact-view',viewMode==='compact');
 grid.innerHTML=cars.length?cars.map(viewMode==='compact'?compactRow:card).join(''):`<div class="empty-state"><h3>${t('No matching cars.')}</h3><p>${t('Try another filter or reset to see the collection.')}</p><button class="button quiet" id="emptyReset">${t('Reset')}</button></div>`;
 if($('#emptyReset'))$('#emptyReset').onclick=()=>$('#resetPublic').click();
 bindCompare();hydrateImages();observeScrollReveal();
}
function isMobileViewport(){return window.matchMedia('(max-width: 768px)').matches;}
function bindCompare(){
 document.querySelectorAll('[data-compare]').forEach(el=>{
  const handler=()=>{
   const id=el.dataset.compare;
   if(compare.includes(id))compare=compare.filter(x=>x!==id);
   else{if(compare.length>=3){if(el.type==='checkbox')el.checked=false;return toast(t('Choose up to 3 cars to compare.'));}compare.push(id);}
   renderCards();comparisonBar();
  };
  if(el.type==='checkbox')el.onchange=handler;else el.onclick=handler;
 });
}
function comparisonBar(){
 const bar=$('#compareBar'),cmpModal=$('#compareModal');
 if(!bar)return;
 bar.hidden=!compare.length;
 bar.innerHTML=`<span>${compare.length} / 3 ${t('selected')}</span><button class="text-button" id="clearCompare">${t('Clear')}</button><button class="button" id="showCompare" ${compare.length<2?'disabled':''}>${t('Compare')} ${icon('arrow')}</button>`;
 $('#clearCompare').onclick=()=>{compare=[];renderCards();comparisonBar();};
 $('#showCompare').onclick=()=>{
  const cars=compare.map(id=>d.vehicles.find(v=>v.id===id)).filter(Boolean);
  const prices=cars.map(v=>v.priceRm).filter(n=>n!=null&&n>0),minPrice=prices.length>1?Math.min(...prices):null;
  const years=cars.map(v=>Number(v.year)).filter(n=>n>0),maxYear=years.length>1?Math.max(...years):null;
  const kms=cars.map(v=>v.mileageKm).filter(n=>n!=null&&n>=0),minKm=kms.length>1?Math.min(...kms):null;
  const badge=text=>`<span class="compare-win">${esc(t(text))}</span>`;
  const rows=[
   ['Cash price',v=>`${esc(money(v.priceRm))}${minPrice!=null&&v.priceRm===minPrice?' '+badge('Lowest'):''}`],
   ['Monthly estimate',v=>esc(estimate(v,d.finance)==null?'—':money(estimate(v,d.finance))+'/mo')],
   ['Year',v=>`${esc(v.year||t('Not provided'))}${maxYear!=null&&Number(v.year)===maxYear?' '+badge('Newest'):''}`],
   ['Mileage',v=>`${esc(v.mileageKm==null?t('Not provided'):Number(v.mileageKm).toLocaleString()+' km')}${minKm!=null&&v.mileageKm===minKm?' '+badge('Lowest km'):''}`],
   ['Auction / interior grade',v=>esc((v.conditionExample?t('Example')+' ':'')+[conditionValues(v).auctionGrade,conditionValues(v).interiorGrade].filter(Boolean).join('/')||t('Not provided'))],
   ['Engine',v=>esc((v.engineCc?v.engineCc+' cc':v.engine)||t('Not provided'))],
   ['Transmission',v=>esc(t(v.transmission)||t('Not provided'))],
   ['Colour',v=>esc(v.exteriorColor||t('Not provided'))],
   ['Features',v=>esc(v.features.join(', ')||t('Not provided'))]
  ];
  $('#compareTable').innerHTML=`<div class="compare-table-wrap"><table class="compare-table"><caption class="compare-caption">${tr('Swipe sideways to compare every selected car.','左右滑动查看所选车辆的对比。','Leret ke sisi untuk membandingkan semua kereta.')}</caption><thead><tr><th></th>${cars.map(v=>`<td><img data-source="${esc(v.coverImageUrl)}" alt="${esc(v.make+' '+v.model)}" loading="lazy" decoding="async"><strong>${esc(v.year||'')+' '+esc(v.make+' '+v.model)}</strong><br><div class="stock-identifiers"><code>Stock #${esc(v.stockId)}</code>${v.chassisNumber?`<code class="chassis-number" title="${esc(v.chassisNumber)}">${esc(v.chassisNumber)}</code>`:''}</div><div class="compare-head-actions"><a class="button small" href="${details(v)}" data-detail-id="${esc(v.id)}">${t('Details')}</a><a class="button quiet small" href="${esc(enquiry(v))}" target="_blank" rel="noopener">${whatsappMark()}<span>${t('Chat')}</span></a></div></td>`).join('')}</tr></thead><tbody>${rows.map(([name,renderCell])=>`<tr><th scope="row">${t(name)}</th>${cars.map(v=>`<td>${renderCell(v)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  hydrateImages();styleWhatsAppActions();modal('#compareModal');
 };
}
function syncFooter(){
 const host=$('#siteFooter');if(!host)return;
 const tr=translator(lang),dashboardHref=url('studio/');
 host.dataset.iconBase=url('assets/icons/');for(const key of ['tiktok','rednote','facebook'])host.dataset[key]=d.profile?.[key]||(key==='facebook'?'https://www.facebook.com/reel/1834658307548568':'');host.dataset.language=lang;
 host.classList.add('minimal-footer');host.dataset.homeHref=url();host.dataset.dashboardLabel=tr('Owner Dashboard','店主工作台','Dashboard pemilik');
 if(!host.dataset.footerReady)host.innerHTML='<div class="minimal-footer-content"><a class="footer-title" href="'+esc(url())+'" aria-label="Danny Recon Select"><span class="brand-logo full-brand" aria-hidden="true"><img class="brand-logo-img logo-dark" src="'+esc(url('assets/brand-wordmark-black.png'))+'" alt="" width="32" height="22" decoding="async"><img class="brand-logo-img logo-light" src="'+esc(url('assets/brand-wordmark-white.png'))+'" alt="" width="32" height="22" decoding="async"></span><span class="brand-wordmark-text"><span>DANNY</span><small>RECON SELECT</small></span></a><a class="minimal-dashboard-link" href="'+esc(dashboardHref)+'">'+esc(host.dataset.dashboardLabel)+' ↗</a></div>';
 loadSiteUi().then(ui=>{if(host.isConnected){host.dataset.footerReady='true';ui.renderMinimalFooter(host,dashboardHref);}}).catch(()=>{});
}
function renderShowroomConciergeCard(host){
 if(!host)return;
 const tr=translator(lang);
 const portraitSrc=url('assets/danny-recon-profile.png');
 host.classList.remove('contact-lanyard-host');
 host.classList.add('boutique-concierge-card');
 host.innerHTML=`<div class="concierge-portrait-frame"><img id="profilePhoto" src="${esc(portraitSrc)}" class="is-loaded" alt="${esc(tr('Danny at the Shah Alam showroom','Danny 于 Shah Alam 展厅','Danny di showroom Shah Alam'))}" loading="eager" fetchpriority="high" decoding="sync"><div class="concierge-badge-overlay"><span class="concierge-verified-dot"></span><span>${esc(tr('VERIFIED RECON SPECIALIST','认证日本进口车顾问','PAKAR KERETA RECOND DISAHKAN'))}</span></div></div><div class="concierge-card-meta"><div class="concierge-title-row"><strong>Danny Ong</strong><span class="concierge-brand-tag"><span class="brand-logo full-brand" aria-hidden="true"><img class="brand-logo-img logo-dark" src="${esc(url('assets/brand-wordmark-black.png'))}" alt="" width="18" height="13" decoding="async"><img class="brand-logo-img logo-light" src="${esc(url('assets/brand-wordmark-white.png'))}" alt="" width="18" height="13" decoding="async"></span><span>DANNY RECON SELECT</span></span></div><dl class="concierge-specs"><div><dt>${esc(tr('Viewing hours','看车时间','Waktu lawatan'))}</dt><dd>${esc(tr('Mon – Sun · 10:00 AM – 7:00 PM','周一至周日 · 10:00 AM – 7:00 PM','Isn – Ahd · 10:00 AM – 7:00 PM'))}</dd></div><div><dt>${esc(tr('Assurance','购车保障','Jaminan'))}</dt><dd>${esc(tr('Original Auction Sheet · Pre-Purchase Inspection','原始拍卖报告核对 · 支持第三方验车','Laporan Lelong Asal · Pemeriksaan Bebas'))}</dd></div></dl></div>`;
}
function syncHeroStockBadge(countOverride){
 const host=$('#heroStock');
 if(!host)return;
 const availTotal=typeof countOverride==='number'?countOverride:d.vehicles.filter(v=>v.status==='available').length;
 host.hidden=false;
 host.setAttribute('role','status');
 host.setAttribute('aria-live','polite');
 host.setAttribute('tabindex','0');
 host.innerHTML=`<span class="status-dot" aria-hidden="true"></span><span class="hero-stock-copy"><strong id="heroStockCount" class="hero-stock-count" data-hero-available-count="${availTotal}">${availTotal}</strong> <span class="hero-stock-label">${esc(t('Units available'))}</span> <span class="hero-stock-sep" aria-hidden="true">·</span> <span class="hero-stock-loc">Shah Alam</span></span>`;
 if(!host.dataset.heroStockBound){
  host.dataset.heroStockBound='true';
  const scrollToInventory=()=>{
   const inv=$('#inventory');
   if(inv)inv.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
  };
  host.addEventListener('click',scrollToInventory);
  host.addEventListener('keydown',e=>{
   if(e.key==='Enter'||e.key===' '){
    e.preventDefault();
    scrollToInventory();
   }
  });
 }
}
window.addEventListener('danny:inventory-counts',event=>{
 const totalAvail=d.vehicles.filter(v=>v.status==='available').length;
 const activeAvail=typeof event.detail?.available==='number'&&(filters.search||filters.make||filters.status||filters.featured)?event.detail.available:totalAvail;
 const countEl=$('#heroStockCount');
 if(countEl){
  countEl.textContent=String(activeAvail);
  countEl.dataset.heroAvailableCount=String(activeAvail);
 }else{
  syncHeroStockBadge(activeAvail);
 }
});
const TESTIMONIAL_PRESETS=[
 {
  model:'2023 Porsche 911 Carrera',
  customer:{en:'Marcus Tan · Mont Kiara',zh:'Marcus Tan · 满家乐',ms:'Marcus Tan · Mont Kiara'},
  rating:5,
  quote:{
   en:'Danny walked me through the original Japanese auction sheet line by line. Cabin and paintwork matched the 4.5A grade on arrival.',
   zh:'Danny 逐项带我核对日本原始拍卖报告，实车内饰和漆面状态与 4.5A 评分完全一致，交车非常省心。',
   ms:'Danny menerangkan laporan lelong Jepun asal secara terperinci. Keadaan kabin dan cat tepat seperti gred 4.5A.'
  }
 },
 {
  model:'2024 Honda Civic Type R (FL5)',
  customer:{en:'Jason Lim · Subang Jaya',zh:'Jason Lim · 梳邦再也',ms:'Jason Lim · Subang Jaya'},
  rating:5,
  quote:{
   en:'Transparent pricing, genuine low mileage, and welcome to bring my own workshop inspector before booking. Highly recommended.',
   zh:'价格透明、真实低里程，下订前还支持带第三方师傅上门验车，专业度满分。',
   ms:'Harga telus, perbatuan rendah tulen, dan terbuka untuk pemeriksaan bengkel bebas sebelum tempahan.'
  }
 },
 {
  model:'2024 Toyota Alphard 2.5 Z',
  customer:{en:'Dato’ Azman · Shah Alam',zh:'Dato’ Azman · 莎阿南',ms:'Dato’ Azman · Shah Alam'},
  rating:5,
  quote:{
   en:'Smooth family MPV handover from loan approval to JPJ registration and detailing. The car was spotless on collection day.',
   zh:'从贷款审批、JPJ 注册到交车美容全程安排妥当，提车当天整车状态干净如新。',
   ms:'Proses serahan MPV keluarga sangat lancar dari kelulusan pinjaman hingga pendaftaran JPJ.'
  }
 },
 {
  model:'2024 Lexus RX 500h F Sport',
  customer:{en:'Kelvin Wong · Petaling Jaya',zh:'Kelvin Wong · 八打灵再也',ms:'Kelvin Wong · Petaling Jaya'},
  rating:5,
  quote:{
   en:'No hard selling—just honest advice comparing specs and grades. Found the exact F Sport unit my family wanted.',
   zh:'没有任何硬推销，只有客观诚恳的配置与拍卖等级对比，帮我们选到了最理想的 F Sport 现车。',
   ms:'Tiada paksaan menjual—hanya nasihat jujur membandingkan spesifikasi dan gred sehingga jumpa unit F Sport terbaik.'
  }
 }
];
function renderHome(){
 const tr=translator(lang);
 if($('#findYourCar'))$('#findYourCar').onclick=()=>openCarFinder($('#carFinder'),{vehicles:d.vehicles,lang,details,wa,hydrate:()=>{hydrateImages();styleWhatsAppActions();}});
 syncHeroStockBadge();
 const heroWhatsApp=$('#heroWhatsApp');if(heroWhatsApp)heroWhatsApp.href=wa('Hi Danny, I would like to ask about your current Japanese reconditioned cars.');
 controls();renderCards();comparisonBar();
 $('#stockProvenance').textContent=d.vehicles.some(v=>v.sample)?({en:'Some listings and cover images are examples. Confirm current stock, specifications and price with Danny. Monthly figures use the calculator’s example settings.',zh:'部分车辆与封面图片为示例。实际库存、配置和价格请向 Danny 确认。月供使用计算器的示例设置。',ms:'Sesetengah senarai dan foto ialah contoh. Sahkan stok, spesifikasi dan harga dengan Danny. Anggaran bulanan menggunakan tetapan contoh kalkulator.'}[lang]):({en:'Monthly figures use example calculator settings. Confirm vehicle details and pricing with Danny.',zh:'月供使用示例设置，车辆资料和价格请向 Danny 确认。',ms:'Anggaran bulanan menggunakan tetapan contoh. Sahkan butiran dan harga dengan Danny.'}[lang]);
 const stories=(d.stories||[]).filter(s=>s.published!==false&&(s.consent==='approved'||d.staticSite));
 $('#deliveryRail').innerHTML=stories.filter(s=>s.image).map((s,idx)=>{
  const sSrc=staticImgSrc(s.image);
  const preset=TESTIMONIAL_PRESETS[idx%TESTIMONIAL_PRESETS.length];
  const linkedCar=s.vehicleId?d.vehicles.find(v=>v.id===s.vehicleId):null;
  const carModel=s.vehicleModel||(linkedCar?[linkedCar.year,linkedCar.make,linkedCar.model].filter(Boolean).join(' '):preset.model);
  const starsCount=Math.min(5,Math.max(1,Number(s.rating)||preset.rating||5));
  const stars='★'.repeat(starsCount);
  const quoteText=s.quote||(preset.quote?.[lang]||preset.quote.en);
  const customerLabel=s.customerName||(preset.customer?.[lang]||preset.customer.en);
  return `<article class="delivery-card testimonial-card reveal-on-scroll is-visible"><button type="button" class="testimonial-photo-btn" data-story="${esc(s.id)}" aria-label="${esc(s.title||carModel)}"><img ${sSrc?`src="${esc(sSrc)}" `:''}data-source="${esc(s.image)}" class="is-loaded" alt="${esc(s.title||carModel)}" loading="eager" fetchpriority="high" decoding="sync"><span class="testimonial-model-tag">${esc(carModel)}</span></button><div class="testimonial-body"><div class="testimonial-rating-row"><span class="testimonial-stars" aria-label="${starsCount} out of 5 stars">${stars}</span><span class="testimonial-verified">${esc(tr('Verified Owner','认证车主交车','Pemilik Disahkan'))}</span></div><blockquote class="testimonial-quote">“${esc(quoteText)}”</blockquote><footer class="testimonial-meta"><strong>${esc(customerLabel)}</strong><span>${esc(carModel)}</span></footer></div></article>`;
 }).join('');
 document.querySelectorAll('[data-story]').forEach(b=>b.onclick=async()=>{const s=stories.find(s=>s.id===b.dataset.story);if(s)openPhoto(await photoUrl(s.image,base),s.title);});
 for(const [id,step] of [['deliveryPrev',-1],['deliveryNext',1]]){const btn=$('#'+id);if(btn){btn.hidden=stories.length<=2;btn.onclick=()=>$('#deliveryRail').scrollBy({left:step*$('#deliveryRail').clientWidth*.8,behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth'});}}
 $('#heroTitle').removeAttribute('data-i18n');$('#heroTitle').textContent=d.homepage.heroTitles?.[lang]||tr('Japanese recond cars. Selected by Danny.','日本进口车，Danny 为你精选。','Kereta recond Jepun. Pilihan Danny.');const hero=document.querySelector('.mountain-scene img');if(hero&&d.homepage.heroImage)hero.src=d.homepage.heroImage;for(const [id,key] of [['customer-stories','showDeliveries'],['contact','showContact']]){const section=document.getElementById(id);if(section)section.hidden=d.homepage[key]===false;}if(d.homepage.sectionOrder==='deliveries-first'){const rail=$('#customer-stories');if(rail)$('#inventory').before(rail);}
 const p=d.profile;$('#profileIntro').textContent=p.intro||tr('Personally inspected for auction grade authenticity, cabin condition, and mechanical integrity before handover.','每一辆车均由 Danny 亲自核对原始拍卖报告、车厢成色与机械状态，透明安心交车。','Disemak sendiri oleh Danny untuk ketulenan gred lelong, keadaan kabin dan mekanikal sebelum serahan.');
 renderShowroomConciergeCard($('#contact .about-image'),p);
 renderContactFaq(document.getElementById('contactFaq'),lang,d.homepage.showContact!==false);
 const locationText='Bukit Jelutong, Glenmarie, Shah Alam';
 const fullLocationQuery=encodeURIComponent(p.location||locationText);
 const locationUrl='https://www.google.com/maps/search/?api=1&query='+fullLocationQuery;
 const wazeUrl='https://waze.com/ul?q='+fullLocationQuery+'&navigate=yes';
 const mapEmbedUrl=`https://maps.google.com/maps?q=${encodeURIComponent(locationText)}&t=m&z=14&output=embed&iwloc=near`;
 const formattedPhone=String(p.phone||'60125686528').replace(/^60(\d{2})(\d{3})(\d{4})$/,'+60 $1-$2 $3');
 const socialMarkup=[['TikTok',p.tiktok,'tiktok'],['小红书',p.rednote,'xiaohongshu'],['Facebook',p.facebook||'https://www.facebook.com/reel/1834658307548568','facebook']].filter(([,linkUrl])=>linkUrl).map(([name,link,file])=>`<a href="${esc(link)}" target="_blank" rel="noopener"><img src="${url('assets/icons/'+file+'.svg?v=glass-20261019b')}" alt="" loading="lazy" decoding="async">${name} ↗</a>`).join('');
 $('#contactBlocks').innerHTML=`<div class="contact-block contact-primary reveal-on-scroll" style="--reveal-delay:40ms">
  <div class="contact-primary-main">
   <a class="button whatsapp-action" href="${wa('Hi Danny, I am interested in a Japanese recond car.')}" target="_blank" rel="noopener">${whatsappMark()}${tr('WhatsApp Danny','WhatsApp 联系 Danny','WhatsApp Danny')} ↗</a>
   <div class="contact-secondary">
    <a href="tel:+${esc(p.phone||'60125686528')}">${icon('phone')}<span>${esc(formattedPhone)}</span></a>
    ${p.email?`<a href="mailto:${esc(p.email)}">${icon('mail')}<span>${tr('Email','发邮件','E-mel')}</span></a>`:''}
   </div>
  </div>
  <div class="social-row" id="socialLinks">${socialMarkup}</div>
 </div>
 <div class="contact-block location-block contact-map-card reveal-on-scroll" style="--reveal-delay:70ms">
  <div class="contact-map-header">
   <div class="contact-map-title-group">
    <span class="contact-section-label">${icon('pin')}<span>${tr('SHOWROOM LOCATION','展厅位置','LOKASI SHOWROOM')}</span></span>
    <a class="contact-location" href="${locationUrl}" target="_blank" rel="noopener"><span>${esc(locationText)}</span></a>
   </div>
   <div class="location-actions">
    <a class="location-directions" href="${locationUrl}" target="_blank" rel="noopener">${tr('Google Maps','Google 地图','Google Maps')} ↗</a>
    <a class="location-waze" href="${wazeUrl}" target="_blank" rel="noopener">${tr('Waze','Waze 导航','Waze')} ↗</a>
    <button type="button" id="copyLocation">${t('Copy location')}</button>
   </div>
  </div>
  <div class="contact-map-viewport" id="contactMapContainer">
   <iframe id="contactMapFrame" class="contact-map-iframe" src="${esc(mapEmbedUrl)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen title="${esc(tr('Danny Recond Select Dealership Location Map','Danny Recond Select 展厅位置地图','Peta Lokasi Showroom Danny Recond Select'))}"></iframe>
   <div class="contact-map-pin-overlay" aria-hidden="true">
    <span class="contact-map-pin-pulse"></span>
    <span class="contact-map-pin-ring"></span>
    <span class="contact-map-pin-marker">
     <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-6-5.2-6-10a6 6 0 1 1 12 0c0 4.8-6 10-6 10Z"/><circle cx="12" cy="11" r="2.2"/></svg>
    </span>
    <span class="contact-map-pin-badge">${esc(tr('Glenmarie Showroom','Glenmarie 展厅','Showroom Glenmarie'))}</span>
   </div>
  </div>
 </div>`;
 $('#copyLocation').onclick=async()=>{try{await navigator.clipboard.writeText(p.location||locationText);toast(t('Copied'));}catch{toast(locationText);}};
 hydrateImages();observeScrollReveal();translate();
 const urlVehicleId=new URLSearchParams(location.search).get('vehicle');
 if(urlVehicleId||activeModalVehicleId){
  void openVehicleDetailModal(urlVehicleId||activeModalVehicleId,{pushHistory:false});
 }
}
let detailObserver,activeModalVehicleId=null,lastDetailTrigger=null,defaultHomeTitle='',savedScrollY=0;
function findVehicleInStore(vehicleId){
 if(!vehicleId)return null;
 const key=String(vehicleId).trim();
 return d.vehicles.find(car=>car.id===key||car.stockId===key||((key==='audi'||key==='audi.html')&&car.id==='audi-s5'))||null;
}
async function fetchVehicleDetail(vehicleId){
 const existing=findVehicleInStore(vehicleId);
 try{
  const published=await Promise.race([
   publishedContentPromise,
   new Promise(resolve=>setTimeout(()=>resolve(null),existing?120:1800)),
  ]);
  if(published){
   const normalized=normalizeDocument(published);
   normalized.vehicles=normalized.vehicles.filter(v=>['available','reserved','sold'].includes(v.status)&&(v.status!=='sold'||normalized.homepage.showSoldVehicles));
   if(normalized.vehicles.length){
    d=normalized;
    const fresh=findVehicleInStore(vehicleId);
    if(fresh)return fresh;
   }
  }
 }catch{}
 if(existing)return existing;
 for(const fallbackUrl of [url('published-baseline.json'),url('inventory-workbench.json')]){
  try{
   const response=await fetch(fallbackUrl,{cache:'no-store',signal:AbortSignal.timeout(2500)});
   if(!response.ok)continue;
   const payload=await response.json();
   const doc=normalizeDocument(payload?.document||payload||{vehicles:[]});
   doc.vehicles=doc.vehicles.filter(v=>['available','reserved','sold'].includes(v.status)&&(v.status!=='sold'||doc.homepage.showSoldVehicles));
   if(doc.vehicles.length)d=doc;
   const resolved=findVehicleInStore(vehicleId);
   if(resolved)return resolved;
  }catch{}
 }
 return findVehicleInStore(vehicleId);
}
function ensureVehicleDetailModal(){
 let dialog=$('#vehicleDetailModal');
 if(!dialog){
  dialog=document.createElement('dialog');
  dialog.id='vehicleDetailModal';
  dialog.className='vehicle-detail-modal';
  dialog.setAttribute('aria-label',tr('Vehicle details','车辆详情','Butiran kereta'));
  dialog.innerHTML='<div id="vehicleModalContent" class="vehicle-modal-content section-wrap"></div>';
  const photoModal=$('#photoModal');
  if(photoModal?.parentNode)photoModal.parentNode.insertBefore(dialog,photoModal);
  else document.body.appendChild(dialog);
 }
 if(!dialog.dataset.bound){
  dialog.dataset.bound='true';
  dialog.addEventListener('cancel',event=>{
   event.preventDefault();
   closeVehicleDetailModal();
  });
  dialog.addEventListener('click',event=>{
   if(event.target===dialog)closeVehicleDetailModal();
  });
 }
 return dialog;
}
function closeVehicleDetailModal({fromPopState=false}={}){
 const dialog=$('#vehicleDetailModal');
 if(!dialog||!dialog.open){
  activeModalVehicleId=null;
  document.body.classList.remove('vehicle-modal-open');
  return;
 }
 activeModalVehicleId=null;
 detailObserver?.disconnect();
 const finishClose=()=>{
  dialog.classList.remove('is-closing','is-opening','is-open');
  if(dialog.open)dialog.close();
  const content=$('#vehicleModalContent');
  if(content){
   content.classList.remove('is-transitioning','is-loading');
   content.innerHTML='';
  }
  document.body.classList.remove('vehicle-modal-open');
  if(defaultHomeTitle)document.title=defaultHomeTitle;
  if(!fromPopState&&new URLSearchParams(location.search).has('vehicle')){
   const nextUrl=new URL(location.href);
   nextUrl.searchParams.delete('vehicle');
   history.pushState({scrollY:savedScrollY},'',nextUrl.pathname+(nextUrl.search||'')+(nextUrl.hash||''));
  }
  if(savedScrollY>0)window.scrollTo({top:savedScrollY,behavior:'auto'});
  if(lastDetailTrigger&&lastDetailTrigger.isConnected){
   lastDetailTrigger.focus({preventScroll:true});
  }
 };
 if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){
  finishClose();
  return;
 }
 dialog.classList.remove('is-opening','is-open');
 dialog.classList.add('is-closing');
 setTimeout(finishClose,220);
}
async function openVehicleDetailModal(vehicleId,{pushHistory=true,sectionId=''}={}){
 if(!vehicleId)return false;
 const dialog=ensureVehicleDetailModal(),content=$('#vehicleModalContent');
 if(!defaultHomeTitle)defaultHomeTitle=document.title;
 for(const otherId of ['#compareModal','#carFinder']){
  const other=$(otherId);
  if(other?.open)other.close();
 }
 const wasOpen=dialog.open;
 const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 if(!wasOpen)savedScrollY=window.scrollY;
 document.body.classList.add('vehicle-modal-open');
 dialog.classList.remove('is-closing');
 if(!wasOpen){
  dialog.classList.remove('is-open');
  dialog.classList.add('is-opening');
  dialog.showModal();
  requestAnimationFrame(()=>{
   dialog.scrollTop=0;
   requestAnimationFrame(()=>{
    dialog.classList.remove('is-opening');
    dialog.classList.add('is-open');
   });
  });
 }else if(content&&!reducedMotion){
  content.classList.add('is-transitioning');
 }
 let v=findVehicleInStore(vehicleId);
 if(!v){
  if(content){
   content.classList.add('is-loading');
   content.innerHTML=`<div class="loading-skeleton">${tr('Loading vehicle details…','正在加载车辆详情…','Memuatkan butiran kereta…')}</div>`;
  }
  v=await fetchVehicleDetail(vehicleId);
 }else{
  void fetchVehicleDetail(vehicleId);
 }
 if(!v){
  if(content){
   content.classList.remove('is-loading','is-transitioning');
   await renderDetail(content,null,{inModal:true});
  }
  return false;
 }
 activeModalVehicleId=v.id;
 if(pushHistory){
  const nextUrl=new URL(location.href);
  if(nextUrl.searchParams.get('vehicle')!==v.id){
   nextUrl.searchParams.set('vehicle',v.id);
   history.pushState({vehicleModalId:v.id,scrollY:savedScrollY},'',nextUrl.pathname+nextUrl.search);
  }
 }
 await renderDetail(content,v,{inModal:true});
 styleWhatsAppActions();
 if(content){
  requestAnimationFrame(()=>{
   content.classList.remove('is-loading','is-transitioning');
  });
 }
 if(sectionId){
  const targetSection=content?.querySelector('#'+sectionId);
  if(targetSection){
   requestAnimationFrame(()=>{
    targetSection.scrollIntoView({behavior:reducedMotion?'auto':'smooth',block:'start'});
   });
  }
 }else if(wasOpen){
  dialog.scrollTo({top:0,behavior:reducedMotion?'auto':'smooth'});
 }
 return true;
}
window.openVehicleDetailModal=openVehicleDetailModal;
window.closeVehicleDetailModal=closeVehicleDetailModal;
function fullSpecificationRows(v){
 const c=conditionValues(v),grade=[c.auctionGrade,c.interiorGrade].filter(Boolean).join('/');
 const rows=[['Model',[v.make,v.model,v.variant].filter(Boolean).join(' ')],['Body',t(v.body)],['Transmission',t(v.transmission)],['Year',v.year],['Mileage',v.mileage],['Auction grade',grade?grade+(c.example?' · '+t('Example'):''):null],['Colour',v.exteriorColor],['Chassis',v.chassisNumber],['Location',v.location]];
 const keys=new Set(rows.map(([key])=>key.toLowerCase()));
 for(const [group,values] of Object.entries(v.specs||{})){
  if(group==='Vehicle status')continue;
  for(const [key,value] of Array.isArray(values)?values:[]){
   const normalized=String(key).toLowerCase();
   if(keys.has(normalized)||['chassis','chassis code','platform code','auction grade','interior grade'].includes(normalized))continue;
   rows.push([key,value]);keys.add(normalized);
  }
 }
 return rows.filter(([,value])=>value!=null&&String(value).trim()!=='');
}
async function renderDetail(targetNode=$('#vehicleContent'),vehicleOverride=null,{inModal=false}={}){
 detailObserver?.disconnect();
 if(!targetNode)return;
 const parts=location.pathname.split('/').filter(Boolean),id=vehicleOverride?.id||new URLSearchParams(location.search).get('vehicle')||decodeURIComponent(parts.at(-1)||''),v=vehicleOverride||d.vehicles.find(v=>v.id===id||v.stockId===id||((id==='audi'||id==='audi.html')&&v.id==='audi-s5')),tr=translator(lang);
 if(!v){targetNode.innerHTML=`<div class="empty-state"><h1>${t('Vehicle not found')}</h1><p>${t('The car may no longer be listed. Browse current stock or contact Danny.')}</p><a class="button" href="${url('#inventory')}">${t('Back to stock')}</a></div>`;translate();return;}
 const title=[v.year,v.make,v.model,v.variant].filter(Boolean).join(' '),photos=v.gallery.filter(m=>m.visible!==false&&!m.video),anchor=location.pathname+location.search,showroomAddress=d.profile?.location||v.location||'Shah Alam';
 const monthly=estimate(v,d.finance);
 const videoId=v.presenter?.url?.match(/tiktok\.com\/@[\w.-]+\/video\/(\d+)/)?.[1];
 const ask=topic=>wa(`Hi Danny, I have a question about ${title}.\nStock #${v.stockId} · ${money(v.priceRm)}\nQuestion: ${topic}\n${location.origin+canonicalDetailsUrl(v)}`);
 document.title=title+' · Danny Recond Select';
 const sections=[['vehicleGallery',tr('Photos','照片','Foto')],['vehicleSpecifications',tr('Equipment & specs','设备与配置','Peralatan & spesifikasi')],['vehicleCalculator',tr('Loan calculator','月供计算器','Kalkulator pinjaman')],['vehicleContact',tr('Enquire & visit','询问与看车','Pertanyaan & lawatan')],...(videoId?[['presenterSlot',tr('Danny’s walkthrough','Danny 讲解','Penerangan Danny')]]:[])];
 const otherCars=d.vehicles.filter(x=>x.id!==v.id&&x.status==='available').sort((a,b)=>{
  if(v.priceRm!=null&&a.priceRm!=null&&b.priceRm!=null)return Math.abs(a.priceRm-v.priceRm)-Math.abs(b.priceRm-v.priceRm);
  return 0;
 }).slice(0,3);
 const condEyebrow=v.conditionType==='Recond'?'JAPAN RECOND':String(v.conditionType||'JAPAN RECOND').toUpperCase();
 const statusText=t(v.status==='available'?'Available':v.status==='reserved'?'Booked':v.status==='sold'?'Sold':label(v.status));
 const shareLabel=tr('Share car','分享车辆','Kongsi kereta');
 const shareBtnMarkup=`<button type="button" class="share-car-btn" id="shareCarButton" aria-label="${esc(shareLabel)}">${icon('share')}<span>${esc(shareLabel)}</span></button>`;
 const priceRowMarkup=v.status==='sold'
  ? `<div class="purchase-price-row is-sold-row"><div class="purchase-price-head"><p class="stock-price is-sold">${t('SOLD')}</p><div class="purchase-stock-actions">${shareBtnMarkup}</div></div><a class="sold-similar-banner" href="${esc(enquiry(v))}" target="_blank" rel="noopener"><span aria-hidden="true">✅</span><span>${tr('Sold — looking for something similar? Ask me.','已售 — 想找同款或类似车型？直接问 Danny。','Terjual — mencari kereta serupa? Tanya Danny.')}</span></a></div>`
  : `<div class="purchase-price-row"><div class="purchase-price-main"><p class="stock-price">${money(v.priceRm)}</p>${monthly!=null?`<p class="detail-monthly-est">≈ ${money(monthly)}${tr('/month est.','/月供估算','/bln anggaran')}</p>`:''}</div><div class="purchase-stock-actions">${shareBtnMarkup}</div></div>`;
 const modalCloseBtn=inModal?`<button type="button" class="vehicle-modal-close" data-modal-close aria-label="${tr('Close vehicle details','关闭车辆详情','Tutup butiran kereta')}"><span class="modal-close-esc">ESC</span><span aria-hidden="true">×</span></button>`:'';
 targetNode.innerHTML=`
 <div class="detail-topline"><a class="detail-back-btn" href="${url('#inventory')}" id="detailBackBtn"><span class="back-arrow" aria-hidden="true">←</span><span>${tr('Back to Stock','返回展厅车库','Kembali ke Showroom')}</span></a><a class="mobile-detail-wordmark" href="${url()}" aria-label="Danny Recon Select"><span class="brand-logo full-brand" aria-hidden="true"><img class="brand-logo-img logo-dark" src="${url('assets/brand-wordmark-black.png')}" alt="" width="28" height="20" decoding="async"><img class="brand-logo-img logo-light" src="${url('assets/brand-wordmark-white.png')}" alt="" width="28" height="20" decoding="async"></span><span class="brand-wordmark-text"><span>DANNY</span><small>RECON SELECT</small></span></a><div class="breadcrumbs"><a href="${url()}">${tr('Home','首页','Utama')}</a><span>/</span><a href="${url('#inventory')}">${t('Inventory')}</a><span>/</span><span>${esc(v.stockId)}</span></div>${modalCloseBtn}</div>
 <nav class="detail-section-nav" aria-label="${tr('Vehicle sections','车辆详情导航','Bahagian kereta')}">${sections.map(([target,name],i)=>`<a href="${anchor}#${target}" data-detail-section="${target}" ${i===0?'aria-current="location"':''}>${name}</a>`).join('')}</nav>
 <div class="detail-grid">
 <div class="vehicle-reading-column">
 ${galleryMarkup(photos,title,lang)}

 <section class="detail-info vehicle-specifications" id="vehicleSpecifications" aria-labelledby="vehicleSpecsTitle">${v.features.length?`<h3 class="spec-list-heading">${tr('Equipment','配备','Kelengkapan')}</h3><div class="feature-tags">${v.features.map(f=>`<span>${esc(f)}</span>`).join('')}</div>`:''}<h2 class="spec-list-heading" id="vehicleSpecsTitle">${tr('Full specification','完整车辆规格','Spesifikasi penuh')}</h2><dl class="full-spec-list">${fullSpecificationRows(v).map(([name,value])=>`<div><dt>${esc(t(name))}</dt><dd>${esc(value)}</dd></div>`).join('')}</dl><a class="spec-report-link" href="${esc(conditionValues(v).report?.url||ask('Please share the original auction report and explain the vehicle grade.'))}" target="_blank" rel="noopener">${tr('Request original auction report','索取原始拍卖报告','Minta laporan lelong asal')}</a>${v.warrantyInfo?`<h3 class="spec-list-heading">${tr('Warranty','保修资料','Waranti')}</h3><p>${esc(v.warrantyInfo)}</p>`:''}${v.conditionNotes?`<p>${esc(v.conditionNotes)}</p>`:''}</section>
 </div>
 <aside class="detail-purchase" aria-label="${tr('Vehicle summary and enquiries','车辆概要与询问','Ringkasan dan pertanyaan kereta')}">
 <section class="purchase-heading" aria-labelledby="vehicleTitle"><div class="detail-status"><span class="detail-eyebrow-meta">${esc(v.year)} · ${esc(condEyebrow)}</span><span class="vehicle-availability" data-status="${esc(v.status)}">${esc(statusText)}</span></div><h1 id="vehicleTitle">${esc(v.make+' '+v.model)}</h1>${v.variant?`<p class="vehicle-variant">${esc(v.variant)}</p>`:''}${priceRowMarkup}<p class="vehicle-stock-ref">${tr('Stock reference','库存编号','Rujukan stok')} <code>${esc(v.stockId)}</code></p></section>
 <section class="purchase-summary" aria-labelledby="quickFactsTitle"><h2 class="detail-card-title" id="quickFactsTitle">${tr('At a glance','车辆概览','Sekilas pandang')}</h2><div class="purchase-facts">${[['calendar','Year',String(v.year||'—')],['mileage','Mileage',v.mileage],['gear','Transmission',t(v.transmission)],['grid','Body',t(v.body)],['photo','Colour',v.exteriorColor]].map(([ico,name,value])=>`<div>${icon(ico)}<span><small>${t(name)}</small><strong>${esc(value||t('Not provided'))}</strong></span></div>`).join('')}</div></section>
 <section class="vehicle-contact" id="vehicleContact" aria-labelledby="vehicleContactTitle"><div class="contact-card-heading"><h2 class="detail-card-title" id="vehicleContactTitle">${tr('Talk to Danny','联系 Danny','Hubungi Danny')}</h2>${whatsappMark()}</div><p class="contact-card-copy">${tr('Ask a question or arrange to see this car.','询问车辆详情，或安排到店看车。','Tanya tentang kereta ini atau atur lawatan.')}</p>
 <a class="button vehicle-primary-enquiry" href="${esc(enquiry(v))}" target="_blank" rel="noopener">${whatsappMark()}<span>${['sold','reserved'].includes(v.status)?t('Enquire about similar stock'):t('Enquire')}</span>${icon('arrow')}</a>
 <div class="context-enquiries" aria-label="${tr('Ask about this car','询问这辆车','Tanya tentang kereta ini')}"><a href="${esc(ask('Please explain the vehicle condition and inspection report.'))}" target="_blank" rel="noopener">${icon('check')}${tr('Ask about condition','询问车况','Tanya keadaan')}</a><a href="${esc(ask('What warranty options are available for this car?'))}" target="_blank" rel="noopener">${icon('gear')}${tr('Ask about warranty','询问保修','Tanya waranti')}</a></div><a class="finance-documents-link" id="financeDocumentsLink" href="${esc(anchor)}#financingDocuments">${tr('Planning to finance? View documents to prepare','准备申请贷款？查看所需文件','Merancang pembiayaan? Lihat dokumen yang perlu disediakan')} ↓</a>
 <div class="vehicle-showroom"><span>${icon('pin')}<span><small>${tr('Showroom','看车地点','Showroom')}</small><strong>${esc(showroomAddress)}</strong></span></span><a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(showroomAddress)}" target="_blank" rel="noopener">${tr('Directions','导航','Arah')} ↗</a></div>
 ${v.status==='available'?`<details class="viewing-disclosure"><summary>${icon('calendar')}${t('Book a showroom viewing')}<span aria-hidden="true">+</span></summary><form id="viewingForm" class="viewing-fields"><label class="field">${t('Your name')}<input name="name" required maxlength="100" autocomplete="name"></label><label class="field">${t('Phone / WhatsApp')}<input name="phone" type="tel" required pattern="[+0-9 ()-]{8,30}" autocomplete="tel"></label><label class="field">${t('Preferred date')}<input name="date" type="date" required min="${new Date().toLocaleDateString('en-CA')}"></label><label class="field">${t('Your question (optional)')}<textarea name="note" maxlength="2000"></textarea></label><button class="button">${t('Continue in WhatsApp')} ${icon('arrow')}</button></form></details>`:''}</section>
 ${calculatorMarkup(v,d.finance,lang)}
</aside>
 </div>
 <div id="presenterSlot"></div>
 <section class="detail-info other-stock" id="otherStockSection"><p class="eyebrow">${tr('OTHER CARS IN STOCK','其他在售现车','KERETA LAIN DALAM STOK')}</p><h2>${t('Explore other cars')}</h2><div class="other-stock-grid">${otherCars.map(x=>{const xTitle=[x.year,x.make,x.model,x.variant].filter(Boolean).join(' '),xSrc=staticImgSrc(x.coverImageUrl);return `<a class="other-car-card" href="${details(x)}" data-detail-id="${esc(x.id)}"><div class="other-car-photo">${x.coverImageUrl?`<img ${xSrc?`src="${esc(xSrc)}" `:''}data-source="${esc(x.coverImageUrl)}" class="is-loaded" alt="${esc(xTitle)}" loading="eager" fetchpriority="high" decoding="sync" width="480" height="300">`:`<div class="photo-placeholder">${icon('photo')}</div>`}</div><div class="other-car-body"><h3>${esc(xTitle)}</h3><p class="other-car-price">${x.status==='sold'?t('SOLD'):money(x.priceRm)}</p></div></a>`;}).join('')}</div></section>
 <div class="mobile-detail-sticky" id="mobileDetailSticky" role="region" aria-label="${tr('Quick vehicle enquiry','快捷询价栏','Bar pertanyaan pantas')}"><div class="mobile-sticky-meta"><div class="mobile-sticky-price">${v.status==='sold'?t('SOLD'):money(v.priceRm)}</div><div class="mobile-sticky-sub">Stock #${esc(v.stockId)}</div></div><a class="button mobile-sticky-enquire" href="${esc(enquiry(v))}" target="_blank" rel="noopener">${whatsappMark()}<span>${t('Enquire')}</span></a></div>`;
 bindGallery(photos,title,lang,base,openPhoto);
 $('#financeDocumentsLink')?.addEventListener('click',event=>{
  const details=$('#financingDocuments');
  if(details){
   details.open=true;
   if(inModal){event.preventDefault();details.scrollIntoView({behavior:'smooth',block:'center'});}
  }
 });
 targetNode.querySelectorAll('[data-modal-close]').forEach(btn=>{btn.onclick=()=>closeVehicleDetailModal();});
 if(inModal){
  targetNode.querySelectorAll('.breadcrumbs a, .mobile-detail-wordmark').forEach(link=>{
   link.addEventListener('click',e=>{
    e.preventDefault();
    closeVehicleDetailModal();
   });
  });
 }
 const backBtn=targetNode.querySelector('#detailBackBtn');
 if(backBtn){
  backBtn.onclick=(e)=>{
   if(inModal){
    e.preventDefault();
    closeVehicleDetailModal();
   }else if(window.history.length>1&&document.referrer&&document.referrer.includes(location.host)){
    e.preventDefault();
    history.back();
   }
  };
 }
 if($('#shareCarButton'))$('#shareCarButton').onclick=async()=>{
  const shareUrl=location.origin+canonicalDetailsUrl(v),shareText=`${title} · ${v.status==='sold'?t('SOLD'):money(v.priceRm)} (Stock #${v.stockId}) — Danny Recond Select`;
  if(navigator.share){try{await navigator.share({title:`${title} · Danny Recond Select`,text:shareText,url:shareUrl});return;}catch(err){if(err?.name==='AbortError')return;}}
  try{await navigator.clipboard.writeText(shareUrl);}catch{const ta=document.createElement('textarea');ta.value=shareUrl;ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.select();document.execCommand('copy');ta.remove();}
  const btn=$('#shareCarButton'),copiedText=tr('Link copied!','链接已复制！','Pautan disalin!');
  if(btn){btn.classList.add('is-copied');btn.innerHTML=`${icon('check')}<span>${esc(copiedText)}</span>`;setTimeout(()=>{if(btn.isConnected){btn.classList.remove('is-copied');btn.innerHTML=`${icon('share')}<span>${esc(shareLabel)}</span>`;}},2200);}
  toast(copiedText);
 };
 if($('#viewingForm'))$('#viewingForm').onsubmit=event=>{event.preventDefault();const f=Object.fromEntries(new FormData(event.target));location.href=wa(`Hi Danny, I would like a showroom viewing.\nCar: ${title} · Stock #${v.stockId}\nName: ${f.name}\nPhone: ${f.phone}\nPreferred date: ${f.date}\n${f.note||''}\n${location.origin+canonicalDetailsUrl(v)}`);};
 if(videoId){
  const previewImg=v.coverImageUrl||photos[0]?.url||'/assets/audi-s5/main-car-16x9.jpg',pSrc=staticImgSrc(previewImg);
  $('#presenterSlot').innerHTML=`<section class="detail-info presenter-panel"><div><p class="eyebrow">${t('CAR EXPLAINED BY DANNY')}</p><h2>${t('See the car. Hear the story.')}</h2><p>${esc(v.presenter.title||title)}</p><div class="actions"><a class="button" href="${esc(v.presenter.url)}" target="_blank" rel="noopener">${t('Watch on TikTok')}</a>${v.presenter.facebook?`<a class="button quiet" href="${esc(v.presenter.facebook)}" target="_blank" rel="noopener">${t('Facebook version')}</a>`:''}</div></div><div class="presenter-stage" id="presenterStage"><button type="button" class="presenter-card-preview" id="loadPresenterVideo" aria-label="${t('Play walkthrough')}"><img ${pSrc?`src="${esc(pSrc)}" `:''}data-source="${esc(previewImg)}" alt="${esc(title)}" loading="lazy" decoding="async"><span class="presenter-play-badge">${icon('play')}<span>${t('Play walkthrough')}</span></span></button></div></section>`;
  $('#loadPresenterVideo').onclick=()=>{
   $('#presenterStage').innerHTML=`<iframe title="${esc(title)} with Danny" src="https://www.tiktok.com/player/v1/${videoId}?autoplay=1&description=1" allow="encrypted-media; fullscreen; picture-in-picture" loading="lazy" allowfullscreen></iframe>`;
  };
 }
 bindVehicleCalculator(v,d.finance,lang,wa,car=>location.origin+canonicalDetailsUrl(car));hydrateImages();translate();
 const navLinks=[...targetNode.querySelectorAll('[data-detail-section]')];const selectNav=id=>navLinks.forEach(a=>a.dataset.detailSection===id?a.setAttribute('aria-current','location'):a.removeAttribute('aria-current'));
 navLinks.forEach(a=>a.onclick=event=>{
  selectNav(a.dataset.detailSection);
  if(inModal){
   event.preventDefault();
   const targetEl=targetNode.querySelector('#'+a.dataset.detailSection);
   if(targetEl)targetEl.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
  }
 });
 detailObserver=new IntersectionObserver(entries=>{const visible=entries.filter(entry=>entry.isIntersecting).sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top);if(visible.length)selectNav(visible[0].target.id);},{root:inModal?$('#vehicleDetailModal'):null,rootMargin:'-60px 0px -55% 0px',threshold:0});
 sections.forEach(([id])=>{const node=targetNode.querySelector('#'+id);if(node)detailObserver.observe(node);});
}
function extractSameWindowVehicleTarget(element){
 if(!(element instanceof Element))return null;
 const directTrigger=element.closest('[data-detail-id]');
 if(directTrigger){
  const detailId=directTrigger.getAttribute('data-detail-id');
  const href=directTrigger.getAttribute('href')||'';
  const hashIdx=href.indexOf('#');
  const sectionId=hashIdx>=0?href.slice(hashIdx+1):'';
  if(detailId)return {trigger:directTrigger,detailId,sectionId};
 }
 const link=element.closest('a[href]');
 if(!link||link.target==='_blank'||link.hasAttribute('download'))return null;
 try{
  const parsed=new URL(link.href,location.origin);
  if(parsed.origin!==location.origin)return null;
  const sectionId=parsed.hash?parsed.hash.slice(1):'';
  const queryVehicle=parsed.searchParams.get('vehicle')||parsed.searchParams.get('car');
  if(queryVehicle)return {trigger:link,detailId:queryVehicle,sectionId};
  const routeMatch=parsed.pathname.match(/\/(?:vehicle|stock)\/([^/?#]+)\/?$/i);
  if(routeMatch?.[1])return {trigger:link,detailId:decodeURIComponent(routeMatch[1]),sectionId};
 }catch{}
 return null;
}
document.addEventListener('click',event=>{
 if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
 if(!document.body.classList.contains('exhibition-home'))return;
 const match=extractSameWindowVehicleTarget(event.target);
 if(!match)return;
 event.preventDefault();
 rememberInteraction();
 if(!match.trigger.closest('#vehicleDetailModal'))lastDetailTrigger=match.trigger;
 void openVehicleDetailModal(match.detailId,{pushHistory:true,sectionId:match.sectionId});
});
window.addEventListener('popstate',()=>{
 if(!document.body.classList.contains('exhibition-home'))return;
 const urlVehicleId=new URLSearchParams(location.search).get('vehicle');
 if(urlVehicleId){
  void openVehicleDetailModal(urlVehicleId,{pushHistory:false});
 }else if(activeModalVehicleId){
  closeVehicleDetailModal({fromPopState:true});
 }
});
function whatsappMark(){return `<img class="wa-brand" src="${url('assets/icons/whatsapp-official.svg')}" width="24" height="24" alt="" decoding="async">`;}
function styleWhatsAppActions(){
 document.querySelectorAll('a.button[href*="wa.me/"],a.nav-contact,#paymentEnquiry').forEach(a=>{
  a.classList.add('whatsapp-action');
  if(!a.querySelector('.wa-brand'))a.insertAdjacentHTML('afterbegin',whatsappMark());
 });
}
function syncMobileWaFab(){
 let fab=$('#mobileWaFab');
 if(!fab){
  fab=document.createElement('a');
  fab.id='mobileWaFab';
  fab.className='mobile-wa-fab';
  fab.target='_blank';
  fab.rel='noopener';
  document.body.appendChild(fab);
 }
 fab.href=wa('Hi Danny, I would like to enquire about your recond cars.');
 fab.setAttribute('aria-label',tr('Message Danny on WhatsApp','通过 WhatsApp 联系 Danny','Mesej Danny di WhatsApp'));
 fab.setAttribute('title',tr('Message Danny on WhatsApp','通过 WhatsApp 联系 Danny','Mesej Danny di WhatsApp'));
 fab.innerHTML=`<img src="${url('assets/icons/whatsapp-official.svg')}" width="44" height="44" alt="" decoding="async">`;
}
function initSmartHeader(){
 const header=$('header#top')||$('.showroom-header');
 const hero=$('.showroom-hero');
 const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 let lastY=window.scrollY,ticking=false;
 const update=()=>{
  const y=window.scrollY,delta=y-lastY;
  if(header){
   header.classList.toggle('is-scrolled',y>24);
   if(y<=24)header.classList.remove('is-hidden');
   else if(delta>6&&y>88)header.classList.add('is-hidden');
   else if(delta<-5)header.classList.remove('is-hidden');
  }
  if(hero&&!reducedMotion&&y<720){
   hero.style.setProperty('--hero-bg-y',`${Math.round(y*0.14)}px`);
   hero.style.setProperty('--hero-danny-y',`${Math.round(y*0.07)}px`);
  }
  lastY=y;ticking=false;
 };
 window.addEventListener('scroll',()=>{if(!ticking){requestAnimationFrame(update);ticking=true;}},{passive:true});
 update();
}
// Public pages render their embedded snapshot immediately; live refresh never blocks it.
let publishedContentPromise=Promise.resolve(null);
// Public pages never silently adopt browser edits. An explicit preview URL is required.
if(new URLSearchParams(location.search).get('local-preview')==='1'){
 try{const saved=await readLocal('preview');if(saved){d=normalizeDocument(saved);const banner=document.createElement('div');banner.className='local-preview-banner';banner.innerHTML=`<span>${lang==='zh'?'此浏览器预览，尚未更新线上网站。':lang==='ms'?'Pratonton pelayar ini. Belum diterbitkan ke laman web.':'Local browser preview. Export from Workbench to publish live.'}</span><a id="exitPreview" href="${url()}">${lang==='zh'?'退出预览':'Exit preview'}</a>`;document.body.prepend(banner);$('#exitPreview').onclick=()=>deleteLocal('preview');}}catch{}
 }else if(!window.CMS_CONTENT_CURRENT){
 publishedContentPromise=(async()=>{
  const publicHost=location.hostname.endsWith('.github.io')||location.hostname.endsWith('.workers.dev')||['localhost','127.0.0.1'].includes(location.hostname);
  const endpoint=publicHost?(location.hostname.endsWith('.github.io')?'https://car-recond-japan.danielong2005.workers.dev':'')+'/api/content/published':window.CMS_API_BASE?window.CMS_API_BASE.replace(/\/$/,'')+'/api/cms/public':null;
  if(!endpoint)return null;
  const response=await fetch(endpoint,{cache:'no-store',signal:AbortSignal.timeout(4000)});
  return response.ok?(await response.json()).document:null;
 })().catch(()=>null);
}

d.vehicles=d.vehicles.filter(v=>['available','reserved','sold'].includes(v.status)&&(v.status!=='sold'||d.homepage.showSoldVehicles));
// Preserve the preview across detail and calculator links without affecting ordinary visitors.
const render=()=>{applyTheme();document.body.dataset.homeLayout=d.homepage.layout||'showroom';const defaultCar=d.vehicles.find(v=>v.status==='available'&&v.priceRm!=null)||d.vehicles[0];document.querySelectorAll('[data-payment-link]').forEach(a=>a.href=(document.body.classList.contains('exhibition-home')||document.body.classList.contains('exhibition-services'))?(defaultCar?details(defaultCar)+'#vehicleCalculator':url('#inventory')):location.pathname+location.search+'#vehicleCalculator');renderShell(lang);syncFooter();if(document.body.classList.contains('exhibition-home'))renderHome();else if(document.body.classList.contains('exhibition-services')){renderServiceCare($('#service-care'),d.vehicles,lang,wa,d.tintPackages);observeScrollReveal();}else if(document.body.classList.contains('exhibition-tools'))renderBuyingTools($('#buyingTools'),d,lang);else renderDetail();translate();syncMobileWaFab();styleWhatsAppActions();if(new URLSearchParams(location.search).get('local-preview')==='1')document.querySelectorAll('a[href]').forEach(a=>{const parsed=new URL(a.href,location.origin);if(parsed.origin===location.origin&&(parsed.pathname===base||parsed.pathname===base.replace(/\/$/,'')||parsed.pathname.includes('/vehicle/')||parsed.pathname.endsWith('/calculator/')||parsed.pathname.endsWith('/services/')||parsed.pathname.endsWith('/tools/'))){parsed.searchParams.set('local-preview','1');a.href=parsed.href;}});};
document.querySelectorAll('a[href^="#"]').forEach(a=>a.href=location.pathname+location.search+a.getAttribute('href'));
$('#languageSelect').onchange=e=>{lang=e.target.value;try{localStorage.setItem('danny-language',lang);localStorage.setItem('danny-site-language',lang);}catch{}render();};initSmartHeader();render();

publishedContentPromise.then(snapshot=>{
 if(!snapshot)return;
 const next=normalizeDocument(snapshot);
 next.vehicles=next.vehicles.filter(v=>['available','reserved','sold'].includes(v.status)&&(v.status!=='sold'||next.homepage.showSoldVehicles));
 const contentKey=doc=>JSON.stringify([doc.vehicles,doc.stories,doc.homepage,doc.profile,doc.finance,doc.tintPackages,doc.articles]);
 // Export metadata must not reset the gallery, filters or a form in progress.
 const interacting=customerInteracted||document.activeElement?.matches('input,textarea,select')||document.activeElement?.closest('.vehicle-gallery')||document.querySelector('dialog[open]');
 if(contentKey(next)!==contentKey(d)&&!interacting){d=next;render();}
});

void recordVisit();
