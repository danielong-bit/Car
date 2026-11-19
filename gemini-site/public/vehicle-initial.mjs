import {galleryMarkup} from './vehicle-gallery.mjs';
import {escapeHtml as esc,calculatorMarkup,conditionValues} from './vehicle-tools.mjs';
import {normalizeVehicle,estimate} from './inventory-domain.mjs';
import {buyerSpecificationGroups} from './buyer-specifications.mjs';
import {vehicleSummaryMarkup,modelName} from './vehicle-summary.mjs';

// Server/build rendered first view. The interactive detail renderer takes over
// without waiting for a second network request.
export function initialVehicleMarkup(input,document,{base='/',pathname=''}={}){
 const v=normalizeVehicle(input),title=[v.year,modelName(v),v.variant].filter(Boolean).join(' ');
 const money=n=>n==null?'Enquire':'RM '+Number(n).toLocaleString('en-MY');
 const monthly=estimate(v,document.finance),stock=base+'#inventory';
 const phone=document.profile?.phone||'60125686528';
 const enquiry='https://wa.me/'+phone+'?text='+encodeURIComponent(`Hi Danny, I am interested in ${title}, Stock #${v.stockId}. Please share the details.`);
 const photos=v.gallery.filter(m=>m.visible!==false&&!m.video);
 const sections=[['vehicleGallery','Photos'],['vehicleSpecifications','Specs'],['vehicleContact','Visit']];
 const specs=buyerSpecificationGroups(v,conditionValues(v)).core;
 const gallery=galleryMarkup(photos,title,'en');
 return `<div class="buyer-detail-toolbar"><div class="detail-topline buyer-detail-topline"><a class="detail-back-btn" href="${esc(stock)}" id="detailBackBtn"><span class="back-arrow" aria-hidden="true">←</span><span>Back to Stock</span></a></div>
 <nav class="detail-section-nav" aria-label="Vehicle sections">${sections.map(([id,name],i)=>`<a href="${esc(pathname)}#${id}" data-detail-section="${id}" ${i===0?'aria-current="location"':''}>${name}</a>`).join('')}</nav></div>
 <div class="detail-grid vehicle-overview" data-initial-vehicle="${esc(v.id)}">
 ${vehicleSummaryMarkup(v,{monthly,price:money(v.priceRm),anchor:pathname,enquiry})}
 ${gallery}
 <div class="vehicle-reading-column"><section class="detail-info vehicle-specifications" id="vehicleSpecifications"><h2 class="spec-list-heading">Key specifications</h2><dl class="full-spec-list">${specs.filter(([,value])=>value).map(([name,value])=>`<div><dt>${name}</dt><dd>${esc(value)}</dd></div>`).join('')}</dl></section></div>
 <aside class="detail-purchase vehicle-next-steps" aria-label="Viewing and financing">
 <section class="vehicle-contact" id="vehicleContact"><h2 class="detail-card-title">Visit the showroom</h2>${document.profile?.location?`<p>${esc(document.profile.location)}</p>`:''}</section>${calculatorMarkup(v,document.finance,'en')}</aside></div>`;
}
