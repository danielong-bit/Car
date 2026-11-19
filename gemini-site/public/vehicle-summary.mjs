import {escapeHtml as esc,conditionValues,translator} from './vehicle-tools.mjs';
import {icon} from './stock-icons.mjs';

export const modelName=v=>[v.make?.replace(/^bmw$/i,'BMW'),v.model].filter(Boolean).join(' ');

export function vehicleSummaryMarkup(v,{lang='en',monthly,price,anchor='',enquiry,whatsappIcon=icon('wa')}){
 const tr=translator(lang);
 const sold=v.status==='sold',booked=v.status==='reserved';
 const status=sold?tr('Sold','已售','Terjual'):booked?tr('Booked','已预订','Ditempah'):tr('Available','可售','Tersedia');
 const share=tr('Share car','分享车辆','Kongsi kereta');
 const {auctionGrade,interiorGrade,example}=conditionValues(v);
 const grade=[auctionGrade,interiorGrade].filter(Boolean).join('/');
 const mileage=v.mileageKm==null?v.mileage:`${Number(v.mileageKm).toLocaleString('en-MY')} km`;
 const facts=[
  [tr('Year','年份','Tahun'),v.year],
  [tr('Mileage','里程','Perbatuan'),mileage],
  [tr('Colour','颜色','Warna'),v.exteriorColor],
  [tr('Grade','等级','Gred'),grade+(grade&&example?' · '+tr('Example','示例','Contoh'):'')],
 ].filter(([,value])=>value);
 const condition=v.conditionType==='Recond'?tr('Japan recond','日本进口车','Recond Jepun'):v.conditionType;
 const trim=/^base$/i.test(v.variant)?'':v.variant;
 const finance=monthly!=null&&!sold?`<a class="detail-monthly-est" href="${esc(anchor)}#vehicleCalculator" data-detail-section="vehicleCalculator">${esc(tr(`Est. RM ${Number(monthly).toLocaleString('en-MY')}/month`,`月供约 RM ${Number(monthly).toLocaleString('en-MY')}`,`Angg. RM ${Number(monthly).toLocaleString('en-MY')}/bulan`))} <span aria-hidden="true">↗</span></a>`:'';
 return `<section class="purchase-heading" aria-labelledby="vehicleTitle">
  <div class="detail-status"><span class="detail-eyebrow-meta">${esc(condition)}</span><span class="vehicle-availability" data-status="${esc(v.status)}">${esc(status)}</span></div>
  <h1 id="vehicleTitle">${esc(modelName(v))}</h1>
  ${trim?`<p class="vehicle-variant">${esc(trim)}</p>`:''}
  <div class="purchase-price-row">
   <div class="purchase-price-main"><p class="stock-price${sold?' is-sold':''}">${esc(sold?tr('SOLD','已售','TERJUAL'):price)}</p>${finance}</div>
   <div class="purchase-stock-actions"><button type="button" class="share-car-btn" id="shareCarButton" aria-label="${esc(share)}" title="${esc(share)}">${icon('share')}<span>${esc(share)}</span></button></div>
  </div>
  ${facts.length?`<dl class="vehicle-summary-facts">${facts.map(([label,value])=>`<div><dt>${esc(label)}</dt><dd>${esc(value)}</dd></div>`).join('')}</dl>`:''}
  <a class="button vehicle-primary-enquiry" href="${esc(enquiry)}" target="_blank" rel="noopener">${whatsappIcon}<span>${esc(sold||booked?tr('Ask about similar cars','询问同类车辆','Tanya kereta serupa'):tr('Enquire on WhatsApp','WhatsApp 询问','Tanya di WhatsApp'))}</span></a>
  <p class="vehicle-stock-ref"><span>${esc(tr('Stock reference','库存编号','Rujukan stok'))}</span> <code>${esc(v.stockId)}</code></p>
 </section>`;
}
