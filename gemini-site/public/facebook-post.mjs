import {buyerSpecificationGroups} from './buyer-specifications.mjs';
import {estimate} from './inventory-domain.mjs';

const clean=value=>String(value??'').replace(/[\r\n]+/g,' ').trim();
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

export function openFacebookPost(vehicle,profile,doc=document){
 const dialog=doc.createElement('dialog');dialog.className='facebook-post-dialog';dialog.setAttribute('aria-labelledby','facebookPostTitle');
 dialog.innerHTML='<header><h2 id="facebookPostTitle">Facebook post</h2><button type="button" data-close-post aria-label="Close Facebook post">×</button></header><label for="facebookPostText">Edit your post before copying</label><textarea id="facebookPostText" rows="18" spellcheck="true"></textarea><p class="facebook-post-note">Attach your vehicle photos in Facebook. This copies text only.</p><footer><span role="status" aria-live="polite"></span><button type="button" class="button" data-copy-post>Copy post</button></footer>';
 const text=dialog.querySelector('textarea');text.value=generateFacebookPost(vehicle,profile,resolveLiveOrigin(doc));
 const overflow=doc.body.style.overflow;doc.body.append(dialog);doc.body.style.overflow='hidden';
 dialog.querySelector('[data-close-post]').onclick=()=>dialog.close();
 dialog.addEventListener('close',()=>{doc.body.style.overflow=overflow;dialog.remove();});
 dialog.querySelector('[data-copy-post]').onclick=async()=>{
  const status=dialog.querySelector('[role=status]');
  try{await doc.defaultView.navigator.clipboard.writeText(text.value);status.textContent='Copied. Paste into Facebook.';}
  catch{text.focus();text.select();status.textContent='Text selected. Copy it using your device’s Copy command.';}
 };
 dialog.showModal();return dialog;
}
