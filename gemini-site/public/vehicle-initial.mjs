import {galleryMarkup} from './vehicle-gallery.mjs';
import {escapeHtml as esc,calculatorMarkup} from './vehicle-tools.mjs';
import {normalizeVehicle,estimate} from './inventory-domain.mjs';
import {icon} from './stock-icons.mjs';

// Server/build rendered first view. The interactive detail renderer takes over
// without waiting for a second network request.
export function initialVehicleMarkup(input,document,{base='/',pathname=''}={}){
 const v=normalizeVehicle(input),title=[v.year,v.make,v.model,v.variant].filter(Boolean).join(' ');
 const money=n=>n==null?'Enquire':'RM '+Number(n).toLocaleString('en-MY');
 const monthly=estimate(v,document.finance),stock=base+'#inventory';
 const phone=document.profile?.phone||'60125686528';
 const enquiry='https://wa.me/'+phone+'?text='+encodeURIComponent(`Hi Danny, I am interested in ${title}, Stock #${v.stockId}. Please share the details.`);
 const photos=v.gallery.filter(m=>m.visible!==false&&!m.video);
 const sections=[['vehicleGallery','Photos'],['vehicleSpecifications','Equipment & specs'],['vehicleCalculator','Loan calculator'],['vehicleContact','Enquire & visit']];
 const facts=[['calendar','Year',v.year],['mileage','Mileage',v.mileage],['gear','Transmission',v.transmission],['grid','Body',v.body],['photo','Colour',v.exteriorColor]];
 const specs=[['Model',v.make+' '+v.model],['Body',v.body],['Transmission',v.transmission],['Year',v.year],['Mileage',v.mileage],['Colour',v.exteriorColor],['Fuel',v.fuelType]];
 let gallery=galleryMarkup(photos,title,'en');
 if(photos[0]?.url.startsWith('/assets/uploads/'))gallery=gallery.replace('<img id="activePhoto"','<img src="'+esc(photos[0].url)+'" id="activePhoto"');
 return `<div class="detail-topline"><a class="detail-back-btn" href="${esc(stock)}" id="detailBackBtn"><span class="back-arrow" aria-hidden="true">←</span><span>Back to Stock</span></a><a class="mobile-detail-wordmark" href="${esc(base)}"><span class="brand-logo" aria-hidden="true"><img class="brand-logo-img logo-dark" src="${esc(base)}assets/logo-danny-dark.png" alt="" width="28" height="20" decoding="async"><img class="brand-logo-img logo-light" src="${esc(base)}assets/logo-danny-light.png" alt="" width="28" height="20" decoding="async"></span><span>DANNY<small>RECON SELECT</small></span></a><div class="breadcrumbs"><a href="${esc(base)}">Home</a><span>/</span><a href="${esc(stock)}">Stock</a><span>/</span><span>${esc(v.stockId)}</span></div></div>
 <nav class="detail-section-nav" aria-label="Vehicle sections">${sections.map(([id,name],i)=>`<a href="${esc(pathname)}#${id}" data-detail-section="${id}" ${i===0?'aria-current="location"':''}>${name}</a>`).join('')}</nav>
 <div class="detail-grid" data-initial-vehicle="${esc(v.id)}"><div class="vehicle-reading-column">${gallery}<section class="detail-info vehicle-specifications" id="vehicleSpecifications"><h2 class="spec-list-heading">Full specification</h2><dl class="full-spec-list">${specs.filter(([,value])=>value).map(([name,value])=>`<div><dt>${name}</dt><dd>${esc(value)}</dd></div>`).join('')}</dl></section></div>
 <aside class="detail-purchase" aria-label="Vehicle summary and enquiries"><section class="purchase-heading" aria-labelledby="vehicleTitle"><div class="detail-status"><span class="detail-eyebrow-meta">${esc(v.year)} · ${esc(v.conditionType==='Recond'?'JAPAN RECOND':v.conditionType)}</span><span class="vehicle-availability" data-status="${esc(v.status)}">${v.status==='reserved'?'Booked':v.status==='sold'?'Sold':'Available'}</span></div><h1 id="vehicleTitle">${esc(v.make+' '+v.model)}</h1>${v.variant?`<p class="vehicle-variant">${esc(v.variant)}</p>`:''}<div class="purchase-price-row"><div class="purchase-price-main"><p class="stock-price${v.status==='sold'?' is-sold':''}">${v.status==='sold'?'SOLD':money(v.priceRm)}</p>${monthly!=null?`<p class="detail-monthly-est">≈ ${money(monthly)}/month est.</p>`:''}</div><div class="purchase-stock-actions"><button type="button" class="share-car-btn" id="shareCarButton">${icon('share')}<span>Share car</span></button></div></div><p class="vehicle-stock-ref">Stock reference <code>${esc(v.stockId)}</code></p></section>
 <section class="purchase-summary"><h2 class="detail-card-title">At a glance</h2><div class="purchase-facts">${facts.map(([ico,name,value])=>`<div>${icon(ico)}<span><small>${name}</small><strong>${esc(value||'Not provided')}</strong></span></div>`).join('')}</div></section>
 <section class="vehicle-contact" id="vehicleContact"><h2 class="detail-card-title">Talk to Danny</h2><p class="contact-card-copy">Ask a question or arrange to see this car.</p><a class="button vehicle-primary-enquiry" href="${esc(enquiry)}" target="_blank" rel="noopener">${icon('wa')}<span>Enquire</span>${icon('arrow')}</a></section>${calculatorMarkup(v,document.finance,'en')}</aside></div>`;
}
