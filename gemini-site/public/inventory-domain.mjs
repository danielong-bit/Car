import {normalizeBrandFilters} from './inventory-brand-filters.mjs?v=stock-20261019d';
import {tintPackages as defaultTintPackages} from './tint-packages.mjs';
export const STATUSES=['draft','available','reserved','sold','unavailable','archived'];
export const GRADES=['','S','6','5','4.5','4','3.5','R','RA'];
export const INTERIORS=['','A','B','C','D'];
export const SPECIAL_TAGS=['RS','RF','TYPE R','F SPORT','S-LINE','GR','AMG','M SPORT','EXECUTIVE','LOW KM','GRADE 5A','1 OWNER'];
export const label=value=>String(value||'').replace(/^./,s=>s.toUpperCase());
export function number(value){if(value==null||String(value).trim()==='')return null;return Number(String(value).replace(/,/g,'').replace(/^RM\s*/i,''));}
export function splitGrade(value=''){
 const s=String(value).trim().toUpperCase(),m=s.match(/^(S|6|5|4\.5|4|3\.5|RA|R)(?:\s*[/ -]?\s*([ABCD]))?$/);
 return {auctionGrade:m?m[1]:String(value).trim(),interiorGrade:m?.[2]||''};
}
export function deriveSpecialBadges(v,homepage={}){
 const tags=new Set(Array.isArray(v.specialBadges)?v.specialBadges.map(s=>String(s).trim().toUpperCase()).filter(Boolean):[]);
 if(v.badgeLabel){
  String(v.badgeLabel).split(/[,·/]+/).map(s=>s.trim().toUpperCase()).filter(Boolean).forEach(t=>{if(!['AVAILABLE','BOOKED','SOLD','RESERVED'].includes(t))tags.add(t);});
 }
 const fullName=`${v.make||v.brand||''} ${v.model||''} ${v.variant||''}`;
 if(/\bRS\b/i.test(fullName))tags.add('RS');
 if(/\bRF\b/i.test(fullName))tags.add('RF');
 if(/\bTYPE[\s-]*R\b/i.test(fullName))tags.add('TYPE R');
 if(/\bF[\s-]*SPORT\b/i.test(fullName))tags.add('F SPORT');
 if(/\bS[\s-]*LINE\b|\bS5\b|\bRS\d/i.test(fullName)&&!/\bRS\b/i.test(fullName)&&/\bS5\b/i.test(fullName))tags.add('S-SPORT');
 if(/\bGR\b/i.test(fullName))tags.add('GR');
 if(/\bAMG\b/i.test(fullName))tags.add('AMG');
 const autoLowKm=homepage?.autoLowKmBadge!==false;
 const km=v.mileageKm;
 if(v.lowKm===true||(autoLowKm&&v.lowKm!==false&&km!=null&&km>0&&km<=25000))tags.add('LOW KM');
 return [...tags];
}
export const vehicleSpecialBadges=deriveSpecialBadges;
export function normalizeVehicle(input={}){
 const v=structuredClone(input),grade=splitGrade(v.auctionGrade),source=v.gallery||v.galleryUrls?.map(url=>({url}))||[];
 const gallery=source.map((m,i)=>typeof m==='string'?{id:'photo-'+i,url:m,visible:true}:({...m}));
 // Old feature photographs become ordinary gallery photos before pins are retired.
 for(const h of v.tour?.hotspots||[])if(h.imageSrc&&!gallery.some(m=>m.url===h.imageSrc))gallery.push({id:'legacy-'+gallery.length,url:h.imageSrc,category:h.label||'Detail',visible:true});
 const has=k=>Object.hasOwn(v,k),price=number(has('priceRm')?v.priceRm:v.price),mileage=has('mileageKm')?number(v.mileageKm):number(String(v.mileage||'').match(/[\d,]+/)?.[0]);
 const make=String(v.make??v.brand??'').trim(),year=number(v.manufactureYear??v.year),color=v.exteriorColor??v.color??'';
 const status=String(v.status||'draft').toLowerCase()==='published'?'available':String(v.status||'draft').toLowerCase();
 const rawCond=String(v.conditionType||'Recond').trim();
 const conditionType=(rawCond===''||rawCond.toLowerCase()==='recon')?'Recond':rawCond;
 if(v.coverImageUrl&&gallery.some(m=>m.url===v.coverImageUrl)){const i=gallery.findIndex(m=>m.url===v.coverImageUrl);gallery.unshift(...gallery.splice(i,1));}
 const normalized={...v,id:v.id||'',stockId:String(v.stockId||'').trim(),make,brand:make,model:String(v.model||'').trim(),variant:v.variant||'',chassisCode:v.chassisCode||'',chassisNumber:String(v.chassisNumber||v.frameNumber||v.vin||'').trim(),manufactureYear:year,year,registrationYear:number(v.registrationYear),conditionType,priceRm:price,price,mileageKm:mileage,mileage:mileage==null?'':mileage.toLocaleString('en-MY')+' km',engineCc:number(v.engineCc),transmission:v.transmission||'Auto',fuelType:v.fuelType||'',exteriorColor:color,color,interiorColor:v.interiorColor||'',auctionGrade:grade.auctionGrade,interiorGrade:v.interiorGrade||grade.interiorGrade,conditionExample:v.conditionExample===true,auctionReport:v.auctionReport?{url:String(v.auctionReport.url||''),name:String(v.auctionReport.name||'Auction report')}:null,auctionHouse:v.auctionHouse||'',gradeVerified:Boolean(v.gradeVerified),conditionNotes:v.conditionNotes||'',status,isFeatured:Boolean(v.isFeatured??v.featured),featured:Boolean(v.isFeatured??v.featured),badgeLabel:v.badgeLabel||'',specialBadges:Array.isArray(v.specialBadges)?v.specialBadges:[],lowKm:v.lowKm,location:v.location||'',warrantyInfo:v.warrantyInfo||'',features:Array.isArray(v.features)?v.features:[],legacyFeatures:!Array.isArray(v.features)?v.features:v.legacyFeatures,description:v.description||'',gallery,galleryUrls:gallery.filter(m=>!m.video&&m.visible!==false).map(m=>m.url),coverImageUrl:gallery.find(m=>!m.video&&m.visible!==false)?.url||'',tour:{...(v.tour||{}),hotspots:[]}};
 normalized.specialBadges=deriveSpecialBadges(normalized);
 return normalized;
}
export function normalizeStory(s={},index=0){
 const videoUrl=String(s.videoUrl||s.video||'').trim();
 return {
  id:String(s.id||'delivery-'+(index+1)),
  title:String(s.title||'Showroom delivery').trim(),
  caption:String(s.caption||'A delivery moment with Danny.').trim(),
  image:String(s.image||'/assets/customer-stories/1.jpeg').trim(),
  videoUrl,
  mediaType:videoUrl?'video':(s.mediaType==='video'?'video':'photo'),
  consent:s.consent||'approved',
  published:s.published!==false,
  date:String(s.date||'').trim(),
  vehicleId:String(s.vehicleId||'')
 };
}
export function normalizeTintPackage(p={},index=0){
 const brand=String(p.brand||'XPEL').toUpperCase()==='3M'?'3M':'XPEL';
 const rawPrices=p.prices&&typeof p.prices==='object'?p.prices:{};
 const prices={
  Standard:number(rawPrices.Standard)??(brand==='3M'?3000:2000),
  ...(brand==='XPEL'?{Large:number(rawPrices.Large)??2200}:{}),
  SUV:number(rawPrices.SUV)??(brand==='3M'?3200:2400),
  MPV:number(rawPrices.MPV)??(brand==='3M'?3400:2600)
 };
 return {
  id:String(p.id||`${brand.toLowerCase()}-${String(p.name||'pkg-'+(index+1)).toLowerCase().replace(/[^a-z0-9]+/g,'-')}`),
  brand,
  name:String(p.name||'Window Tint Package').trim(),
  code:String(p.code||'').trim(),
  vlt:String(p.vlt||'').trim(),
  irr:String(p.irr||'').trim(),
  tser:String(p.tser||'').trim(),
  uvr:String(p.uvr||'').trim(),
  thickness:String(p.thickness||'').trim(),
  warranty:String(p.warranty||'').trim(),
  image:String(p.image||(brand==='3M'?'assets/tint/3m-tint-packages.jpg':'assets/tint/xpel-titan.jpeg')).trim(),
  published:p.published!==false,
  prices
 };
}
export function normalizeDocument(d={}){
 const homepage={
  ...d.homepage,
  theme:d.homepage?.theme==='dark'?'dark':'light',
  ...normalizeBrandFilters(d.homepage),
  title:d.homepage?.title==='JAPAN RECON'?'JAPAN RECOND':(d.homepage?.title||'JAPAN RECOND'),
  showSoldVehicles:d.homepage?.showSoldVehicles??true,
  hideAvailableBadge:d.homepage?.hideAvailableBadge??true,
  autoLowKmBadge:d.homepage?.autoLowKmBadge??true
 };
 const sourceTint=Array.isArray(d.tintPackages)&&d.tintPackages.length?d.tintPackages:defaultTintPackages;
 return {
  ...d,
  vehicles:(d.vehicles||[]).map(v=>{const nv=normalizeVehicle(v);nv.specialBadges=deriveSpecialBadges(nv,homepage);return nv;}),
  stories:(d.stories||[]).map(normalizeStory),
  tintPackages:sourceTint.map(normalizeTintPackage),
  homepage,
  profile:{...d.profile,intro:String(d.profile?.intro||'').replace(/\brecon\b/gi,'recond')},
  finance:financeSettings(d.finance)
 };
}
export function vehicleIssues(v){
 const e=[];
 if(!/^[A-Za-z0-9_-]{1,80}$/.test(v.stockId||''))e.push('Stock ID: use letters, numbers, - or _.');
 if(!v.make?.trim())e.push('Make is required.');if(!v.model?.trim())e.push('Model is required.');
 if(!STATUSES.includes(v.status))e.push('Choose a valid status.');
 for(const k of ['priceRm','mileageKm','engineCc','monthlyEstimateRm'])if(v[k]!=null&&(!Number.isFinite(v[k])||v[k]<0))e.push(`${k}: enter a valid non-negative number.`);
 for(const k of ['manufactureYear','registrationYear'])if(v[k]!=null&&(!Number.isInteger(v[k])||v[k]<1900||v[k]>new Date().getFullYear()+2))e.push(`${k}: enter a valid year.`);
 if(!GRADES.includes(v.auctionGrade))e.push('Choose a supported auction grade.');if(!INTERIORS.includes(v.interiorGrade))e.push('Choose interior grade A, B, C or D.');
 if(!['Recond','Recon','Pre-owned','Consignment'].includes(v.conditionType))e.push('Choose a valid condition.');
 if(v.auctionReport?.url&&!validReportUrl(v.auctionReport.url))e.push('Auction report: use a JPG, PNG, WebP or PDF file URL.');
 if(v.gallery?.length>60)e.push('Gallery: maximum 60 photos.');
 return e;
}
export function estimate(v,finance={}){
 finance=financeSettings(finance);
 if(v.monthlyEstimateRm!=null)return v.monthlyEstimateRm;
 if(v.priceRm==null)return null;
 const years=Number(finance.tenure)||7,months=years*12,principal=v.priceRm*(1-(finance.downPayment??10)/100),annualRate=finance.rate??6,rate=Math.pow(1+annualRate/100,1/12)-1;
 return Math.round(finance.method==='flat'?(principal+principal*annualRate/100*years)/months:rate?principal*rate/(1-Math.pow(1+rate,-months)):principal/months);
}

export function validReportUrl(url){return typeof url==='string'&&!url.includes('..')&&/^(?:\/(?:[a-zA-Z0-9_-]+\/)*assets\/[a-zA-Z0-9_./%-]+|https:\/\/[a-zA-Z0-9.-]+\/[a-zA-Z0-9_./%-]+)\.(?:pdf|webp|png|jpe?g)(?:\?[a-zA-Z0-9_=&%+.-]*)?$/i.test(url);}

export function financeSettings(finance={}){
 const rate=Number(finance.rate??6),down=Number(finance.downPayment??10),tenure=Number(finance.tenure??7);
 return {...finance,rate:Number.isFinite(rate)&&rate>=0&&rate<=30?rate:6,downPayment:Number.isFinite(down)?Math.round(Math.min(100,Math.max(0,down))/5)*5:10,tenure:[5,7,9].includes(tenure)?tenure:7,method:finance.method==='flat'?'flat':'reducing'};
}
