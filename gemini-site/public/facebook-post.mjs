import {buyerSpecificationGroups} from './buyer-specifications.mjs';
import {estimate} from './inventory-domain.mjs';

const clean=value=>String(value??'').replace(/[\r\n]+/g,' ').trim();
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const usable=value=>clean(value)&&!/\b(demo|not provided|to verify)\b/i.test(clean(value));
const DEFAULT_ORIGIN='https://danny.stocklist.workers.dev';

export const FB_AD_PRESETS=[
 {id:'fb_feed_ad',label:'Facebook Feed Ad',medium:'paid_social',hint:'Tracked Paid Ad link (?utm_source=facebook&utm_campaign=fb_feed_ad)'},
 {id:'fb_reels_ad',label:'Facebook / IG Reels Ad',medium:'paid_social',hint:'Short-form video & Reels ad attribution'},
 {id:'fb_whatsapp_ctwa',label:'Click-to-WhatsApp Ad (CTWA)',medium:'paid_social',hint:'High-intent WhatsApp lead ad with pre-filled stock code'},
 {id:'fb_marketplace',label:'Facebook Marketplace',medium:'marketplace',hint:'Marketplace listing link synced to live stock'},
 {id:'fb_carousel_catalog',label:'Dynamic Catalog Carousel',medium:'catalog',hint:'Meta Automotive Inventory Ad (AIA) destination'},
 {id:'fb_page_post',label:'Organic Page Post',medium:'social',hint:'Standard Danny Recon Select page post'},
];

export const FB_COPY_LANGUAGES=[
 {id:'en',label:'EN'},
 {id:'zh',label:'中文'},
 {id:'ms',label:'BM'},
 {id:'bi',label:'EN + 中文'},
];

export const FB_COPY_TONES=[
 {id:'standard',label:'Showroom Full'},
 {id:'concierge',label:'VIP Concierge'},
 {id:'urgent',label:'Hot Arrival'},
 {id:'marketplace',label:'Marketplace Clean'},
];

export function resolveLiveOrigin(doc=typeof document!=='undefined'?document:null,fallback=DEFAULT_ORIGIN){
 const winOrigin=doc?.defaultView?.location?.origin;
 if(winOrigin&&/^https?:\/\//i.test(winOrigin))return winOrigin;
 return fallback;
}

export function buildFacebookShareSharerUrl(targetUrl,quote=''){
 if(!targetUrl)return '';
 const share=new URL('https://www.facebook.com/sharer/sharer.php');
 share.searchParams.set('u',targetUrl);
 if(clean(quote))share.searchParams.set('quote',clean(quote));
 return share.href;
}

export function buildFacebookAdUrl(vehicle,origin=DEFAULT_ORIGIN,campaign='fb_feed_ad',{includeUtm=true}={}){
 const v=vehicle||{};
 if(!v.id)return '';
 const target=new URL('/?vehicle='+encodeURIComponent(v.id),origin||DEFAULT_ORIGIN);
 if(includeUtm&&campaign){
  const preset=FB_AD_PRESETS.find(p=>p.id===campaign);
  target.searchParams.set('utm_source','facebook');
  target.searchParams.set('utm_medium',preset?.medium||'paid_social');
  target.searchParams.set('utm_campaign',campaign);
  if(v.stockId)target.searchParams.set('utm_content',clean(v.stockId));
 }
 return target.href;
}

function buildLocalizedPost(vehicle,profile,origin,options,lang,tone){
 const v=vehicle||{},phone=clean(profile.phone||'60125686528').replace(/\D/g,''),name=[v.make||v.brand,v.model,v.variant].map(clean).filter(Boolean).join(' ');
 const year=v.manufactureYear??v.year,km=v.mileageKm,price=v.priceRm??v.price;
 const hasNumericPrice=price!=null&&price!==''&&Number.isFinite(Number(price))&&Number(price)>0;
 const monthly=options.includeMonthly&&hasNumericPrice&&v.status!=='sold'?estimate({priceRm:Number(price)},options.finance||{}):null;
 const promo=clean(options.promoHeadline||'');
 const specs=buyerSpecificationGroups(v);
 const performance=specs.core.filter(([key,value])=>['Engine','Transmission','Drive','Fuel'].includes(key)&&usable(value));
 const extras=[...specs.additional.map(([key,value])=>`${clean(key)}: ${clean(value)}`),...specs.features].filter(usable);
 const grade=[v.auctionGrade,v.interiorGrade].filter(Boolean).join('/');
 const kmText=km!=null&&Number.isFinite(Number(km))?Number(km).toLocaleString('en-MY')+' km':null;
 const priceText=hasNumericPrice?'RM'+Number(price).toLocaleString('en-MY'):null;
 const link=(v.id&&(['available','reserved','sold'].includes(v.status)||options.includeDraftLink))
  ?buildFacebookAdUrl(v,origin,options.campaign,{includeUtm:Boolean(options.campaign||options.includeUtm)})
  :'';
 const hashtag=value=>clean(value).toLowerCase().replace(/[^a-z0-9]/g,'');
 const tags=[hashtag(v.make||v.brand),hashtag((v.make||v.brand||'')+' '+(v.model||'')),'recondcarmalaysia','KeretaRecondSelangor','DannyReconSelect'];
 const tagLine=[...new Set(tags.filter(Boolean))].map(value=>'#'+value).join(' ');

 if(lang==='zh'){
  const zhStatus={sold:'已售 SOLD',reserved:'已预订 BOOKED'}[v.status]||'现车在售 FOR SALE';
  const hook=tone==='urgent'?'⚡ 热门现车刚到港 · 手快有手慢无':tone==='concierge'?'🎩 Danny 甄选日本/英国进口现车 · 一对一私人鉴赏':'';
  const lines=[`${promo?promo+' — ':''}🔥 ${zhStatus} | ${name.toUpperCase()}`];
  if(hook)lines.push(hook);
  if(phone)lines.push(`💬 WhatsApp 专线: https://wa.me/${phone}`);
  const summary=[year?`${year}年`:null,v.exteriorColor||v.color,kmText,priceText,monthly?`月供约 RM${monthly.toLocaleString('en-MY')}/月`:null].filter(Boolean);
  if(summary.length)lines.push('🚘 '+summary.map(clean).join(' | '));
  if(grade)lines.push(`⭐ 原厂拍卖评级 Grade ${grade}${v.conditionExample?' (示例)':' · 附原装报告核对'}`);
  if(tone!=='marketplace'&&performance.length)lines.push('','✨ 动力与核心规格:',...performance.map(([key,value])=>`✅ ${key}: ${clean(value)}`));
  if(extras.length)lines.push('','✨ 精选配置亮点:',...extras.slice(0,tone==='marketplace'?6:12).map(value=>'✅ '+clean(value)));
  if(usable(v.warrantyInfo))lines.push('','🛡️ 保修保障:',clean(v.warrantyInfo));
  if(usable(v.location||profile.location))lines.push('','📍 看车展厅: '+clean(v.location||profile.location));
  if(phone)lines.push(`📞 预约看车 ${clean(profile.name||'Danny')}: +${phone}`);
  if(link)lines.push('','👇 点击下方专属链接查看高清实拍图库、实时车价与银行月供计算器：',link);
  lines.push(tagLine);
  return lines.join('\n');
 }

 if(lang==='ms'){
  const msStatus={sold:'TERJUAL | SOLD',reserved:'DITEMPAH | BOOKED'}[v.status]||'UNTUK DIJUAL | READY STOCK';
  const hook=tone==='urgent'?'⚡ Unit Terhangat Baru Tiba · Sedia Untuk Viewing!':tone==='concierge'?'🎩 Koleksi Terpilih Danny Recon Select · Pemeriksaan Laporan Lelong Asal':'';
  const lines=[`${promo?promo+' — ':''}🔥 ${msStatus} | ${name.toUpperCase()}`];
  if(hook)lines.push(hook);
  if(phone)lines.push(`💬 WhatsApp Terus: https://wa.me/${phone}`);
  const summary=[year,v.exteriorColor||v.color,kmText,priceText,monthly?`Anggaran RM${monthly.toLocaleString('en-MY')}/bln`:null].filter(Boolean);
  if(summary.length)lines.push('🚘 '+summary.map(clean).join(' | '));
  if(grade)lines.push(`⭐ Gred Lelong ${grade}${v.conditionExample?' (contoh)':' · Laporan Asal Disediakan'}`);
  if(tone!=='marketplace'&&performance.length)lines.push('','✨ Spesifikasi Utama:',...performance.map(([key,value])=>`✅ ${key}: ${clean(value)}`));
  if(extras.length)lines.push('','✨ Kelengkapan Pilihan:',...extras.slice(0,tone==='marketplace'?6:12).map(value=>'✅ '+clean(value)));
  if(usable(v.warrantyInfo))lines.push('','🛡️ Waranti:',clean(v.warrantyInfo));
  if(usable(v.location||profile.location))lines.push('','📍 Lokasi Showroom: '+clean(v.location||profile.location));
  if(phone)lines.push(`📞 Hubungi ${clean(profile.name||'Danny')}: +${phone}`);
  if(link)lines.push('','👇 Tekan pautan di bawah untuk galeri penuh, status terkini & kiraan pinjaman bulanan:',link);
  lines.push(tagLine);
  return lines.join('\n');
 }

 if(lang==='bi'){
  const biStatus={sold:'SOLD 已售',reserved:'BOOKED 已预订'}[v.status]||'FOR SALE 现车在售';
  const lines=[`${promo?promo+' — ':''}🔥 ${biStatus} | ${name.toUpperCase()}`];
  lines.push('🇯🇵 Curated Unregistered Recond · 日本原装甄选进口现车');
  if(phone)lines.push(`💬 Direct WhatsApp: https://wa.me/${phone}`);
  const summary=[year,v.exteriorColor||v.color,kmText,priceText,monthly?`Est. RM${monthly.toLocaleString('en-MY')}/mo`:null].filter(Boolean);
  if(summary.length)lines.push('🚘 '+summary.map(clean).join(' | '));
  if(grade)lines.push(`⭐ Verified Auction Grade ${grade} · 附原装拍卖报告`);
  if(extras.length||performance.length){
   const merged=[...performance.map(([k,val])=>`${clean(k)}: ${clean(val)}`),...extras].slice(0,8);
   lines.push('','✨ Highlights / 核心亮点:',...merged.map(item=>'✅ '+clean(item)));
  }
  if(usable(v.location||profile.location))lines.push('','📍 Showroom / 展厅: '+clean(v.location||profile.location)+' (Shah Alam)');
  if(phone)lines.push(`📞 ${clean(profile.name||'Danny')}: +${phone}`);
  if(link)lines.push('','Tap below for HD gallery, live stock status & monthly loan calculator / 点击查看实拍与月供计算：',link);
  lines.push(tagLine);
  return lines.join('\n');
 }

 // Default English ('en') — preserves exact test contract when tone === 'standard'
 const status={sold:'SOLD',reserved:'BOOKED'}[v.status]||'FOR SALE';
 const lines=[`${promo?promo+' — ':''}🔥 ${status} | ${name.toUpperCase()}`];
 if(tone==='concierge')lines.push('🎩 Private Showroom Viewing · Original Auction Sheet Verification');
 else if(tone==='urgent')lines.push('⚡ High-Demand Spec Just Landed · Arrange Immediate Inspection');
 if(phone)lines.push(`💬 https://wa.me/${phone}`);
 const summary=[year,v.exteriorColor||v.color,kmText,priceText,monthly?`Est. RM${monthly.toLocaleString('en-MY')}/mo`:null].filter(value=>value!==null&&value!==false&&clean(value));
 if(summary.length)lines.push('🚘 '+summary.map(clean).join(' | '));
 if(grade)lines.push(`⭐ Grade ${grade}${v.conditionExample?' (example)':''}`);
 if(tone!=='marketplace'&&performance.length)lines.push('','✨ Performance:',...performance.map(([key,value])=>`✅ ${key}: ${clean(value)}`));
 if(extras.length)lines.push('','✨ Features:',...extras.slice(0,tone==='marketplace'?6:14).map(value=>'✅ '+clean(value)));
 if(usable(v.warrantyInfo))lines.push('','🛡️ Warranty:',clean(v.warrantyInfo));
 if(usable(v.location||profile.location))lines.push('','📍 '+clean(v.location||profile.location));
 if(phone)lines.push(`📞 ${clean(profile.name||'Danny')}: +${phone}`);
 lines.push('','Tap link below for live pricing, full photo gallery & loan calculator:');
 if(link)lines.push(link);
 lines.push([...new Set([hashtag(v.make||v.brand),hashtag((v.make||v.brand||'')+' '+(v.model||'')),'recondcarmalaysia','KeretaRecondSelangor'].filter(Boolean))].map(value=>'#'+value).join(' '));
 return lines.join('\n');
}

export function generateFacebookPost(vehicle,profile={},origin=DEFAULT_ORIGIN,options={}){
 const lang=FB_COPY_LANGUAGES.some(l=>l.id===options.lang)?options.lang:'en';
 const tone=FB_COPY_TONES.some(t=>t.id===options.tone)?options.tone:'standard';
 return buildLocalizedPost(vehicle,profile,origin,options,lang,tone);
}

export function buildMarketplaceListingFields(vehicle,profile={},origin=DEFAULT_ORIGIN,finance={}){
 const v=vehicle||{};
 const year=v.manufactureYear??v.year??'';
 const make=clean(v.make||v.brand||'');
 const model=clean(v.model||'');
 const variant=clean(v.variant||'');
 const title=[year,make,model,variant].filter(Boolean).join(' ').slice(0,99);
 const rawPrice=v.priceRm??v.price;
 const price=rawPrice!=null&&Number.isFinite(Number(rawPrice))&&Number(rawPrice)>0?Math.round(Number(rawPrice)):0;
 const km=v.mileageKm!=null&&Number.isFinite(Number(v.mileageKm))?Math.round(Number(v.mileageKm)):0;
 const description=generateFacebookPost(v,profile,origin,{
  campaign:'fb_marketplace',
  tone:'marketplace',
  includeMonthly:true,
  finance,
  includeDraftLink:true,
 });
 return {
  title,
  price:price>0?String(price):'',
  priceFormatted:price>0?`RM ${price.toLocaleString('en-MY')}`:'Enquire',
  year:String(year||''),
  make,
  model,
  mileageKm:km>0?String(km):'',
  transmission:/manual/i.test(v.transmission||'')?'Manual':'Automatic',
  bodyStyle:clean(v.body||'Sedan'),
  exteriorColor:clean(v.exteriorColor||v.color||''),
  location:clean(v.location||'Bukit Jelutong, Shah Alam'),
  condition:'Used – Like New (Unregistered Recond)',
  description,
 };
}

export function buildFacebookAdCampaignData(vehicle,profile={},origin=DEFAULT_ORIGIN,options={}){
 const v=vehicle||{};
 const campaign=options.campaign||'fb_feed_ad';
 const adUrl=buildFacebookAdUrl(v,origin,campaign,{includeUtm:options.includeUtm!==false});
 const price=v.priceRm??v.price;
 const hasPrice=price!=null&&price!==''&&Number.isFinite(Number(price))&&Number(price)>0;
 const priceStr=v.status==='sold'?'SOLD':hasPrice?`RM ${Number(price).toLocaleString('en-MY')}`:'Enquire for Price';
 const monthly=hasPrice&&v.status!=='sold'?estimate({priceRm:Number(price)},options.finance||{}):null;
 const carTitle=[v.manufactureYear??v.year,v.make||v.brand,v.model,v.variant].map(clean).filter(Boolean).join(' ');
 const phone=clean(profile.phone||'60125686528').replace(/\D/g,'');
 const postText=generateFacebookPost(v,profile,origin,{...options,campaign,includeUtm:options.includeUtm!==false});
 const isLive=['available','reserved','sold'].includes(v.status);
 const ctaLabel=v.status==='sold'
  ?'View Similar Stock'
  :campaign==='fb_whatsapp_ctwa'
   ?'WhatsApp Danny'
   :campaign==='fb_marketplace'
    ?'Message Seller'
    :'Learn More';
 return {
  vehicleId:v.id||'',
  stockId:v.stockId||'',
  campaign,
  adUrl,
  shareUrl:buildFacebookShareSharerUrl(adUrl,`${carTitle} · ${priceStr}`),
  postText,
  headline:`${carTitle} · ${priceStr}`,
  linkDescription:monthly?`Est. RM ${monthly.toLocaleString('en-MY')}/mo · Stock #${clean(v.stockId)} · Shah Alam`:`Verified Recond · Stock #${clean(v.stockId)} · Shah Alam`,
  primaryText:postText,
  ctaLabel,
  monthlyRm:monthly,
  whatsappUrl:phone?`https://wa.me/${phone}?text=${encodeURIComponent(`Hi Danny, saw your Facebook post for ${carTitle} (#${v.stockId}). Is it still available?\n${adUrl}`)}`:'',
  isLive,
  status:v.status||'draft',
 };
}

export function renderFacebookAdPreviewMarkup(campaignData,vehicle,profile={},format='feed',base='/'){
 const v=vehicle||{};
 const rawCover=v.coverImageUrl||v.gallery?.find(m=>m?.visible!==false&&!m?.video)?.url||'/assets/audi-s5/main-car-16x9.jpg';
 const cover=rawCover.startsWith('/assets/')&&base!=='/'?base+rawCover.slice(1):rawCover;
 const hostLabel=(()=>{try{return new URL(campaignData.adUrl||'https://danny.stocklist.workers.dev').hostname.toUpperCase();}catch{return 'DANNYRECOND.MY';}})();
 const firstLines=String(campaignData.postText||'').split('\n').filter(Boolean).slice(0,4).join('\n');
 const statusPill=v.status==='sold'?'SOLD':v.status==='reserved'?'BOOKED':'AVAILABLE';
 const grade=[v.auctionGrade,v.interiorGrade].filter(Boolean).join('/');

 if(format==='reels'){
  return `<div class="fb-mock-card is-reels" aria-label="Facebook Reels 9:16 Ad Preview">
   <div class="fb-reels-stage">
    <img src="${esc(cover)}" alt="${esc(campaignData.headline)}" loading="lazy">
    <div class="fb-reels-top">
     <span class="fb-reels-pill">Reels · Sponsored</span>
     <span class="fb-reels-status is-${esc(v.status||'available')}">${esc(statusPill)}</span>
    </div>
    <div class="fb-reels-overlay">
     <div class="fb-reels-author">
      <span class="fb-mock-avatar">DR</span>
      <div>
       <strong>Danny Recon Select</strong>
       <small>Sponsored · Glenmarie Showroom</small>
      </div>
     </div>
     <p class="fb-reels-caption">${esc(firstLines)}</p>
     <a class="fb-reels-cta" href="${esc(campaignData.campaign==='fb_whatsapp_ctwa'?campaignData.whatsappUrl:campaignData.adUrl)}" target="_blank" rel="noopener">
      <span>${esc(campaignData.headline)}</span>
      <strong>${esc(campaignData.ctaLabel)} ›</strong>
     </a>
    </div>
   </div>
  </div>`;
 }

 if(format==='marketplace'){
  const mp=buildMarketplaceListingFields(v,profile);
  return `<div class="fb-mock-card is-marketplace" aria-label="Facebook Marketplace Listing Preview">
   <div class="fb-mp-photo">
    <img src="${esc(cover)}" alt="${esc(mp.title)}" loading="lazy">
    <span class="fb-mp-badge">Marketplace · Shah Alam</span>
   </div>
   <div class="fb-mp-body">
    <p class="fb-mp-price">${esc(mp.priceFormatted)}</p>
    <h4>${esc(mp.title||'Vehicle Listing')}</h4>
    <p class="fb-mp-sub">${esc([mp.year,mp.mileageKm?Number(mp.mileageKm).toLocaleString('en-MY')+' km':'',mp.transmission,grade?`Grade ${grade}`:''].filter(Boolean).join(' · '))}</p>
    <div class="fb-mp-seller">
     <span class="fb-mock-avatar">DR</span>
     <div>
      <strong>${esc(profile.name||'Danny Ong')} · Very Responsive</strong>
      <small>${esc(mp.location)}</small>
     </div>
    </div>
   </div>
  </div>`;
 }

 return `<div class="fb-mock-card is-feed" aria-label="Facebook Feed Ad Preview">
  <div class="fb-mock-head">
   <span class="fb-mock-avatar">DR</span>
   <div class="fb-mock-page">
    <strong>Danny Recon Select <span class="fb-verified-dot" title="Verified Dealer">✓</span></strong>
    <small>Sponsored · 🌍</small>
   </div>
   <span class="fb-mock-more" aria-hidden="true">•••</span>
  </div>
  <p class="fb-mock-copy">${esc(firstLines)}</p>
  <div class="fb-mock-media">
   <img src="${esc(cover)}" alt="${esc(campaignData.headline)}" loading="lazy">
   ${grade&&!v.conditionExample?`<span class="fb-mock-grade">Grade ${esc(grade)}</span>`:''}
  </div>
  <div class="fb-mock-cta-bar">
   <div class="fb-mock-meta">
    <small>${esc(hostLabel)}</small>
    <strong>${esc(campaignData.headline)}</strong>
    <span>${esc(campaignData.linkDescription)}</span>
   </div>
   <a class="fb-mock-btn" href="${esc(campaignData.campaign==='fb_whatsapp_ctwa'?campaignData.whatsappUrl:campaignData.adUrl)}" target="_blank" rel="noopener">${esc(campaignData.ctaLabel)}</a>
  </div>
 </div>`;
}

export function openFacebookPost(vehicle,profile={},doc=document,options={}){
 const origin=options.origin||resolveLiveOrigin(doc);
 let activeCampaign=options.campaign||'fb_feed_ad';
 let activeLang=options.lang||'en';
 let activeTone=options.tone||'standard';
 let activePreview='feed';
 let includeMonthly=options.includeMonthly!==false;
 let promoHeadline=options.promoHeadline||'';
 const dialog=doc.createElement('dialog');
 dialog.className='facebook-post-dialog is-wide';
 dialog.setAttribute('aria-labelledby','facebookPostTitle');
 const isLive=['available','reserved','sold'].includes(vehicle?.status);
 const statusLabel={available:'Available (Live)',reserved:'Booked (Live Notice)',sold:'Sold (Live Notice)'}[vehicle?.status]||'Draft (Not Public Yet)';
 const carName=[vehicle?.manufactureYear||vehicle?.year,vehicle?.make||vehicle?.brand,vehicle?.model].filter(Boolean).join(' ');
 dialog.innerHTML=`
  <header>
   <div>
    <p class="fb-dialog-eyebrow">FACEBOOK ADS · MARKETPLACE · LIVE WEBSITE SYNC</p>
    <h2 id="facebookPostTitle">${carName?esc(carName):'Facebook Ad & Post Builder'}</h2>
   </div>
   <button type="button" data-close-post aria-label="Close Facebook post">×</button>
  </header>
  <div class="fb-sync-banner ${isLive?'is-live':'is-draft'}">
   <strong>Stock Sync: ${statusLabel}</strong>
   <span>${isLive?'Dynamic OpenGraph tags + live price/availability sync automatically when buyers tap or share this URL on Facebook.':'Publish or set this unit to Available/Booked so Facebook visitors see it immediately when they tap your ad link.'}</span>
  </div>
  <div class="fb-modal-columns">
   <div class="fb-modal-left">
    <div class="fb-builder-grid">
     <label class="field">
      <span>Ad Placement / Objective</span>
      <select id="fbCampaignSelect">
       ${FB_AD_PRESETS.map(p=>`<option value="${p.id}" ${p.id===activeCampaign?'selected':''}>${p.label}</option>`).join('')}
      </select>
     </label>
     <label class="field">
      <span>Copy Tone</span>
      <select id="fbToneSelect">
       ${FB_COPY_TONES.map(t=>`<option value="${t.id}" ${t.id===activeTone?'selected':''}>${t.label}</option>`).join('')}
      </select>
     </label>
    </div>
    <div class="fb-lang-toolbar">
     <div class="fb-seg-group" role="group" aria-label="Ad copy language">
      ${FB_COPY_LANGUAGES.map(l=>`<button type="button" class="fb-seg-btn ${l.id===activeLang?'is-active':''}" data-fb-lang="${l.id}">${l.label}</button>`).join('')}
     </div>
     <label class="fb-inline-toggle">
      <input type="checkbox" id="fbIncludeMonthly" ${includeMonthly?'checked':''}>
      <span>Include monthly RM</span>
     </label>
    </div>
    <label class="field" style="margin-top:10px">
     <span>Promo Hook (Optional)</span>
     <input id="fbPromoInput" type="text" value="${esc(promoHeadline)}" placeholder="e.g. Fresh Arrival · Verified Grade 4.5A" maxlength="80">
    </label>
    <div class="fb-promo-chips">
     ${['Fresh Arrival','Verified Grade','Zero Deposit Option','Price Reduced','Ready Stock'].map(tag=>`<button type="button" class="fb-promo-chip" data-fb-promo="${tag}">+ ${tag}</button>`).join('')}
    </div>
    <div class="fb-link-box">
     <label for="facebookAdLink">Tracked Destination URL (Paste in Ads Manager)</label>
     <div class="fb-link-row">
      <input id="facebookAdLink" type="text" readonly>
      <button type="button" class="button quiet small" data-copy-link>Copy URL</button>
      <a class="button quiet small" id="facebookShareDirect" target="_blank" rel="noopener">Share to FB ↗</a>
      <a class="button quiet small" id="facebookAdPreviewLink" target="_blank" rel="noopener">Landing ↗</a>
     </div>
    </div>
    <label for="facebookPostText" style="margin-top:12px;display:block;font-size:12px;font-weight:700">Facebook Primary Text / Post Copy (Editable)</label>
    <textarea id="facebookPostText" rows="10" spellcheck="true"></textarea>
   </div>
   <div class="fb-modal-right">
    <div class="fb-preview-toolbar">
     <span class="fb-dialog-eyebrow" style="margin:0">LIVE AD MOCKUP</span>
     <div class="fb-seg-group" role="group" aria-label="Mockup format">
      <button type="button" class="fb-seg-btn is-active" data-fb-format="feed">Feed</button>
      <button type="button" class="fb-seg-btn" data-fb-format="reels">Reels 9:16</button>
      <button type="button" class="fb-seg-btn" data-fb-format="marketplace">Marketplace</button>
     </div>
    </div>
    <div id="fbLiveMockupMount" class="fb-mockup-mount"></div>
   </div>
  </div>
  <footer>
   <span role="status" aria-live="polite"></span>
   <div class="fb-footer-actions">
    <button type="button" class="button quiet" data-copy-mp>Copy Marketplace Title + Price</button>
    <button type="button" class="button" data-copy-post>Copy full ad copy</button>
   </div>
  </footer>`;

 const text=dialog.querySelector('#facebookPostText');
 const linkInput=dialog.querySelector('#facebookAdLink');
 const previewAnchor=dialog.querySelector('#facebookAdPreviewLink');
 const shareAnchor=dialog.querySelector('#facebookShareDirect');
 const campaignSel=dialog.querySelector('#fbCampaignSelect');
 const toneSel=dialog.querySelector('#fbToneSelect');
 const monthlyChk=dialog.querySelector('#fbIncludeMonthly');
 const promoInput=dialog.querySelector('#fbPromoInput');
 const mockupMount=dialog.querySelector('#fbLiveMockupMount');
 const statusEl=dialog.querySelector('[role=status]');

 const syncBuilder=(preserveEditedText=false)=>{
  const campaignData=buildFacebookAdCampaignData(vehicle,profile,origin,{
   campaign:activeCampaign,
   lang:activeLang,
   tone:activeTone,
   includeMonthly,
   finance:options.finance,
   promoHeadline,
   includeDraftLink:true,
  });
  linkInput.value=campaignData.adUrl;
  previewAnchor.href=campaignData.adUrl||'#/';
  shareAnchor.href=campaignData.shareUrl||campaignData.adUrl||'#/';
  if(!preserveEditedText)text.value=campaignData.postText;
  else campaignData.postText=text.value;
  if(mockupMount)mockupMount.innerHTML=renderFacebookAdPreviewMarkup(campaignData,vehicle,profile,activePreview,doc.defaultView?.SITE_BASE||'/');
 };
 syncBuilder();

 campaignSel.onchange=()=>{
  activeCampaign=campaignSel.value;
  if(activeCampaign==='fb_reels_ad')activePreview='reels';
  else if(activeCampaign==='fb_marketplace')activePreview='marketplace';
  dialog.querySelectorAll('[data-fb-format]').forEach(b=>b.classList.toggle('is-active',b.dataset.fbFormat===activePreview));
  syncBuilder();
 };
 toneSel.onchange=()=>{activeTone=toneSel.value;syncBuilder();};
 monthlyChk.onchange=()=>{includeMonthly=monthlyChk.checked;syncBuilder();};
 promoInput.oninput=()=>{promoHeadline=promoInput.value;syncBuilder();};
 text.oninput=()=>syncBuilder(true);

 dialog.querySelectorAll('[data-fb-lang]').forEach(btn=>btn.onclick=()=>{
  activeLang=btn.dataset.fbLang;
  dialog.querySelectorAll('[data-fb-lang]').forEach(b=>b.classList.toggle('is-active',b===btn));
  syncBuilder();
 });
 dialog.querySelectorAll('[data-fb-format]').forEach(btn=>btn.onclick=()=>{
  activePreview=btn.dataset.fbFormat;
  dialog.querySelectorAll('[data-fb-format]').forEach(b=>b.classList.toggle('is-active',b===btn));
  syncBuilder(true);
 });
 dialog.querySelectorAll('[data-fb-promo]').forEach(btn=>btn.onclick=()=>{
  promoHeadline=btn.dataset.fbPromo;
  promoInput.value=promoHeadline;
  syncBuilder();
 });

 const copyText=async(value,msg)=>{
  try{
   await doc.defaultView.navigator.clipboard.writeText(value);
   statusEl.textContent=msg;
   options.onAdGenerated?.({vehicle,campaign:activeCampaign,adUrl:linkInput.value,postText:text.value});
  }catch{
   text.focus();
   text.select();
   statusEl.textContent='Text selected. Copy it using your device’s Copy command.';
  }
 };

 dialog.querySelector('[data-copy-link]').onclick=()=>copyText(linkInput.value,'Ad link copied! Paste into Facebook Ads Manager Destination URL.');
 dialog.querySelector('[data-copy-post]').onclick=()=>copyText(text.value,'Ad post copied! Logged to recent Facebook ad activity.');
 dialog.querySelector('[data-copy-mp]').onclick=()=>{
  const mp=buildMarketplaceListingFields(vehicle,profile,origin,options.finance||{});
  void copyText(`${mp.title}\nPrice: ${mp.priceFormatted}\nMileage: ${mp.mileageKm?Number(mp.mileageKm).toLocaleString('en-MY')+' km':'TBA'}\nLocation: ${mp.location}\n\n${mp.description}`,'Marketplace listing fields & description copied!');
 };
 previewAnchor.onclick=()=>{options.onAdGenerated?.({vehicle,campaign:activeCampaign,adUrl:linkInput.value,postText:text.value});};

 const overflow=doc.body.style.overflow;
 doc.body.append(dialog);
 doc.body.style.overflow='hidden';
 dialog.querySelector('[data-close-post]').onclick=()=>dialog.close();
 dialog.addEventListener('close',()=>{doc.body.style.overflow=overflow;dialog.remove();});
 dialog.showModal();
 return dialog;
}
