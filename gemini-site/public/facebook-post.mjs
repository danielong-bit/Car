import {buyerSpecificationGroups} from './buyer-specifications.mjs';

const clean=value=>String(value??'').replace(/[\r\n]+/g,' ').trim();
const usable=value=>clean(value)&&! /\b(demo|not provided|to verify)\b/i.test(clean(value));
export function generateFacebookPost(vehicle,profile={},origin='https://danny.stocklist.workers.dev'){
 const v=vehicle,phone=clean(profile.phone||'60125686528').replace(/\D/g,''),name=[v.make||v.brand,v.model,v.variant].map(clean).filter(Boolean).join(' ');
 const status={sold:'SOLD',reserved:'BOOKED'}[v.status]||'FOR SALE';
 const lines=[`🔥 ${status} | ${name.toUpperCase()}`];
 if(phone)lines.push(`💬 https://wa.me/${phone}`);
 const year=v.manufactureYear??v.year,km=v.mileageKm,price=v.priceRm??v.price;
 const summary=[year, v.exteriorColor||v.color, km!=null&&Number.isFinite(Number(km))?Number(km).toLocaleString('en-MY')+' km':null,price!=null&&Number.isFinite(Number(price))?'RM'+Number(price).toLocaleString('en-MY'):null].filter(value=>value!==null&&value!==false&&clean(value));
 if(summary.length)lines.push('🚘 '+summary.map(clean).join(' | '));
 const grade=[v.auctionGrade,v.interiorGrade].filter(Boolean).join('/');
 if(grade)lines.push(`⭐ Grade ${grade}${v.conditionExample?' (example)':''}`);
 const specs=buyerSpecificationGroups(v),performance=specs.core.filter(([key,value])=>['Engine','Transmission','Drive','Fuel'].includes(key)&&usable(value));
 if(performance.length)lines.push('','✨ Performance:',...performance.map(([key,value])=>`✅ ${key}: ${clean(value)}`));
 const extras=[...specs.additional.map(([key,value])=>`${clean(key)}: ${clean(value)}`),...specs.features].filter(usable);
 if(extras.length)lines.push('','✨ Features:',...extras.map(value=>'✅ '+clean(value)));
 if(usable(v.warrantyInfo))lines.push('','🛡️ Warranty:',clean(v.warrantyInfo));
 if(usable(v.location||profile.location))lines.push('','📍 '+clean(v.location||profile.location));
 if(phone)lines.push(`📞 ${clean(profile.name||'Danny')}: +${phone}`);
 lines.push('','PM for more details or a viewing.');
 if(v.id&&['available','reserved','sold'].includes(v.status))lines.push(new URL('/?vehicle='+encodeURIComponent(v.id),origin).href);
 const hashtag=value=>clean(value).toLowerCase().replace(/[^a-z0-9]/g,'');
 const tags=[hashtag(v.make||v.brand),hashtag((v.make||v.brand||'')+' '+(v.model||'')),'recondcarmalaysia','KeretaRecondSelangor'];
 lines.push([...new Set(tags.filter(Boolean))].map(value=>'#'+value).join(' '));
 return lines.join('\n');
}

export function openFacebookPost(vehicle,profile,doc=document){
 const dialog=doc.createElement('dialog');dialog.className='facebook-post-dialog';dialog.setAttribute('aria-labelledby','facebookPostTitle');
 dialog.innerHTML='<header><h2 id="facebookPostTitle">Facebook post</h2><button type="button" data-close-post aria-label="Close Facebook post">×</button></header><label for="facebookPostText">Edit your post before copying</label><textarea id="facebookPostText" rows="18" spellcheck="true"></textarea><p class="facebook-post-note">Attach your vehicle photos in Facebook. This copies text only.</p><footer><span role="status" aria-live="polite"></span><button type="button" class="button" data-copy-post>Copy post</button></footer>';
 const text=dialog.querySelector('textarea');text.value=generateFacebookPost(vehicle,profile);
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
