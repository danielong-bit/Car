import {normalizeVehicle,vehicleIssues} from '../../public/inventory-domain.mjs';
export const authorize = (user, email) => Boolean(user?.email && email && user.email.trim().toLowerCase() === email.trim().toLowerCase());
export function safeMediaUrl(value) {
  return typeof value === 'string' && ((/^\/(assets|api\/cms\/media)\/[a-zA-Z0-9_./%-]+$/.test(value) && !value.includes('..')) || /^https:\/\/[a-zA-Z0-9.-]+\/[a-zA-Z0-9_./%?=&+-]+$/.test(value));
}
const vehicleKeys = ['id','stockId','brand','model','body','year','price','mileage','engine','power','torque','color','sub','status','sample','gallery','specs','features','tour','featured','presenter','make','variant','chassisCode','manufactureYear','registrationYear','conditionType','priceRm','monthlyEstimateRm','mileageKm','engineCc','transmission','fuelType','exteriorColor','interiorColor','auctionGrade','interiorGrade','auctionHouse','auctionReport','conditionExample','gradeVerified','conditionNotes','isFeatured','badgeLabel','location','warrantyInfo','description','coverImageUrl','galleryUrls'];
export function publicDocument(d) {
  const vehicles=(d.vehicles||[]).map(normalizeVehicle).filter(v=>['available','reserved','sold'].includes(v.status)&&(v.status!=='sold'||d.homepage?.showSoldVehicles!==false)).map(v=>{
    const gallery=v.gallery.filter(m=>m.visible!==false),visible={...v,gallery,galleryUrls:gallery.filter(m=>!m.video).map(m=>m.url),coverImageUrl:gallery.find(m=>!m.video)?.url||'',tour:{page:v.tour?.page,hotspots:[]}};
    return Object.fromEntries(vehicleKeys.filter(k=>k in visible).map(k=>[k,visible[k]]));
  });
  return {vehicles,stories:(d.stories||[]).filter(s=>s.published&&s.consent==='approved').map(({id,title,caption,image,vehicleId,date,hiddenFaces})=>({id,title,caption,image,vehicleId,date,hiddenFaces})),homepage:d.homepage||{},profile:d.profile||{},finance:d.finance||{},articles:(d.articles||[]).filter(a=>a.published).map(({id,title,body})=>({id,title,body}))};
}
export function validateDocument(d, publishing=false) {
  const e=[];
  if(!d||!Array.isArray(d.vehicles)||d.vehicles.length>500) return ['Vehicles must be a list of at most 500 records.'];
  const ids=new Set(),stocks=new Set();
  for(const raw of d.vehicles){
    const v=normalizeVehicle(raw);e.push(...vehicleIssues(v));
    const p=v.presenter;
    if(p?.url&&!(/^https:\/\/(www\.)?tiktok\.com\/@[a-zA-Z0-9_.-]+\/video\/\d+(\?[a-zA-Z0-9_=&%-]+)?$/.test(p.url)||/^\/api\/cms\/media\/[a-z0-9-]+\.mp4$/.test(p.url)))e.push('Presenter video needs a TikTok video link or an uploaded MP4 URL.');
    if(p?.facebook&&!/^https:\/\/(www\.)?facebook\.com\/reel\/\d+\/?$/.test(p.facebook))e.push('Presenter Facebook fallback needs a Facebook Reel link.');
    if(!/^[a-zA-Z0-9_-]{1,80}$/.test(v.id||'')||ids.has(v.id)) e.push('Vehicle ID is invalid or duplicated.'); ids.add(v.id);
    if(!v.stockId||stocks.has(v.stockId.toLowerCase()))e.push('Stock ID is missing or duplicated.');stocks.add(v.stockId.toLowerCase());
    if(!v.brand?.trim()||!v.model?.trim())e.push('Brand and model are required.');
    if(!['draft','available','reserved','sold','unavailable','archived'].includes(v.status))e.push('Invalid vehicle status.');
    if(v.year && (!Number.isInteger(Number(v.year))||v.year<1900||v.year>2100))e.push('Invalid year.');
    if(!Number.isFinite(Number(v.price))||Number(v.price)<0)e.push('Price must be a positive number in RM.');
    if(!Array.isArray(v.gallery)||v.gallery.length>60)e.push('Gallery must contain at most 60 items.');
    else for(const m of v.gallery){if(!safeMediaUrl(m.url))e.push('Media must use a stable HTTP URL.');for(const k of ['x','y','mobileX','mobileY'])if(m[k]!=null&&(!Number.isFinite(Number(m[k]))||m[k]<0||m[k]>100))e.push('Focal point must be 0–100.');if(m.zoom!=null&&(m.zoom<1||m.zoom>3))e.push('Photo zoom must be 1–3.');}
    if(publishing&&['available','reserved'].includes(v.status)&&!v.gallery?.some(m=>m.visible!==false&&!m.video))e.push(`${v.stockId}: add a cover photo before publishing.`);

  }
  for(const s of d.stories||[]){if(s.image&&!safeMediaUrl(s.image))e.push('Delivery photo URL is invalid.');if(publishing&&s.published&&s.consent!=='approved')e.push('Delivery story needs recorded customer permission before publication.');}
  if(d.profile?.phone&&!/^\d{8,15}$/.test(d.profile.phone))e.push('WhatsApp number must contain country code and digits only.');
  if(d.profile?.portrait&&!safeMediaUrl(d.profile.portrait))e.push('Profile photo URL is invalid.');
  for(const k of ['tiktok','rednote','facebook'])if(d.profile?.[k]&&!/^https:\/\/[a-zA-Z0-9.-]+\/[a-zA-Z0-9_./@%?=&+-]+$/.test(d.profile[k]))e.push('Social links must use HTTPS.');
  for(const m of d.vehicles.flatMap(v=>v.gallery||[]))if(m.ratio&&!['16/9','4/3','4/5','1/1'].includes(m.ratio))e.push('Invalid photo aspect ratio.');
  const scan=(x)=>{if(typeof x==='string'&&(x.length>18000||/[<>\u0000-\u0008]/.test(x)))e.push('Use plain text without HTML, double quotes or script markup.');else if(Array.isArray(x))x.forEach(scan);else if(x&&typeof x==='object')Object.values(x).forEach(scan);};scan(d);
  return [...new Set(e)];
}
