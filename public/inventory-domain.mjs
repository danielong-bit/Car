export const STATUSES=['draft','available','reserved','sold','unavailable','archived'];
export const GRADES=['','S','6','5','4.5','4','3.5','R','RA'];
export const INTERIORS=['','A','B','C','D'];
export const label=value=>String(value||'').replace(/^./,s=>s.toUpperCase());
export function number(value){if(value==null||String(value).trim()==='')return null;return Number(String(value).replace(/,/g,'').replace(/^RM\s*/i,''));}
export function splitGrade(value=''){
 const s=String(value).trim().toUpperCase(),m=s.match(/^(S|6|5|4\.5|4|3\.5|RA|R)(?:\s*[/ -]?\s*([ABCD]))?$/);
 return {auctionGrade:m?m[1]:String(value).trim(),interiorGrade:m?.[2]||''};
}
export function normalizeVehicle(input={}){
 const v=structuredClone(input),grade=splitGrade(v.auctionGrade),source=v.gallery||v.galleryUrls?.map(url=>({url}))||[];
 const gallery=source.map((m,i)=>typeof m==='string'?{id:'photo-'+i,url:m,visible:true}:({...m}));
 // Old feature photographs become ordinary gallery photos before pins are retired.
 for(const h of v.tour?.hotspots||[])if(h.imageSrc&&!gallery.some(m=>m.url===h.imageSrc))gallery.push({id:'legacy-'+gallery.length,url:h.imageSrc,category:h.label||'Detail',visible:true});
 const has=k=>Object.hasOwn(v,k),price=number(has('priceRm')?v.priceRm:v.price),mileage=has('mileageKm')?number(v.mileageKm):number(String(v.mileage||'').match(/[\d,]+/)?.[0]);
 const make=String(v.make??v.brand??'').trim(),year=number(v.manufactureYear??v.year),color=v.exteriorColor??v.color??'';
 const status=String(v.status||'draft').toLowerCase()==='published'?'available':String(v.status||'draft').toLowerCase();
 if(v.coverImageUrl&&gallery.some(m=>m.url===v.coverImageUrl)){const i=gallery.findIndex(m=>m.url===v.coverImageUrl);gallery.unshift(...gallery.splice(i,1));}
 return {...v,id:v.id||'',stockId:String(v.stockId||'').trim(),make,brand:make,model:String(v.model||'').trim(),variant:v.variant||'',chassisCode:v.chassisCode||'',manufactureYear:year,year,registrationYear:number(v.registrationYear),conditionType:v.conditionType||'Recon',priceRm:price,price,mileageKm:mileage,mileage:mileage==null?'':mileage.toLocaleString('en-MY')+' km',engineCc:number(v.engineCc),transmission:v.transmission||'Auto',fuelType:v.fuelType||'',exteriorColor:color,color,interiorColor:v.interiorColor||'',auctionGrade:grade.auctionGrade,interiorGrade:v.interiorGrade||grade.interiorGrade,auctionReport:v.auctionReport?{url:String(v.auctionReport.url||''),name:String(v.auctionReport.name||'Auction report')}:null,auctionHouse:v.auctionHouse||'',gradeVerified:Boolean(v.gradeVerified),conditionNotes:v.conditionNotes||'',status,isFeatured:Boolean(v.isFeatured??v.featured),featured:Boolean(v.isFeatured??v.featured),badgeLabel:v.badgeLabel||'',location:v.location||'',warrantyInfo:v.warrantyInfo||'',features:Array.isArray(v.features)?v.features:[],legacyFeatures:!Array.isArray(v.features)?v.features:v.legacyFeatures,description:v.description||'',gallery,galleryUrls:gallery.filter(m=>!m.video&&m.visible!==false).map(m=>m.url),coverImageUrl:gallery.find(m=>!m.video&&m.visible!==false)?.url||'',tour:{...(v.tour||{}),hotspots:[]}};
}
export function normalizeDocument(d){return {...d,vehicles:(d.vehicles||[]).map(normalizeVehicle),homepage:{...d.homepage,showSoldVehicles:d.homepage?.showSoldVehicles??true},profile:{...d.profile},finance:{rate:6,tenure:7,downPayment:10,...d.finance}};}
export function vehicleIssues(v){
 const e=[];
 if(!/^[A-Za-z0-9_-]{1,80}$/.test(v.stockId||''))e.push('Stock ID: use letters, numbers, - or _.');
 if(!v.make?.trim())e.push('Make is required.');if(!v.model?.trim())e.push('Model is required.');
 if(!STATUSES.includes(v.status))e.push('Choose a valid status.');
 for(const k of ['priceRm','mileageKm','engineCc','monthlyEstimateRm'])if(v[k]!=null&&(!Number.isFinite(v[k])||v[k]<0))e.push(`${k}: enter a valid non-negative number.`);
 for(const k of ['manufactureYear','registrationYear'])if(v[k]!=null&&(!Number.isInteger(v[k])||v[k]<1900||v[k]>new Date().getFullYear()+2))e.push(`${k}: enter a valid year.`);
 if(!GRADES.includes(v.auctionGrade))e.push('Choose a supported auction grade.');if(!INTERIORS.includes(v.interiorGrade))e.push('Choose interior grade A, B, C or D.');
 if(!['Recon','Pre-owned','Consignment'].includes(v.conditionType))e.push('Choose a valid condition.');
 if(v.auctionReport?.url&&!validReportUrl(v.auctionReport.url))e.push('Auction report: use a JPG, PNG, WebP or PDF file URL.');
 if(v.gallery?.length>60)e.push('Gallery: maximum 60 photos.');
 return e;
}
export function estimate(v,finance={}){
 if(v.monthlyEstimateRm!=null)return v.monthlyEstimateRm;
 if(v.priceRm==null)return null;
 const years=Number(finance.tenure)||7,months=years*12,principal=v.priceRm*(1-(finance.downPayment??10)/100),annualRate=finance.rate??6,rate=Math.pow(1+annualRate/100,1/12)-1;
 return Math.round(finance.method==='flat'?(principal+principal*annualRate/100*years)/months:rate?principal*rate/(1-Math.pow(1+rate,-months)):principal/months);
}

export function validReportUrl(url){return typeof url==='string'&&!url.includes('..')&&/^(?:\/(?:[a-zA-Z0-9_-]+\/)*assets\/[a-zA-Z0-9_./%-]+|https:\/\/[a-zA-Z0-9.-]+\/[a-zA-Z0-9_./%-]+)\.(?:pdf|webp|png|jpe?g)(?:\?[a-zA-Z0-9_=&%+.-]*)?$/i.test(url);}
