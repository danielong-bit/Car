export const SHOWROOMS=Object.freeze([
 {id:'mai-auto',name:'Mai Auto',label:'Mai Auto (Bukit Jelutong)',address:'U8, Metropolitan Business Park, 4, Jalan Para U8/103, Bukit Jelutong, 40150 Shah Alam, Selangor',aliases:['Mai Auto Edar Sdn Bhd']},
 {id:'zaman-motors',name:'Zaman Motors',label:'Zaman Motors (Glenmarie)',address:'24, Jalan Pemberita U1/49, Temasya Industrial Park, Glenmarie, 40150 Shah Alam, Selangor',aliases:['Zaman Motor (Glenmarie)','Zaman Motors Sdn Bhd - Glenmarie']},
 {id:'v-ventures',name:'V Ventures',label:'V Ventures (Glenmarie)',address:'18, Jalan Pengetua U1/32, Hicom-glenmarie Industrial Park, 40150 Shah Alam, Selangor',aliases:['V Ventures Auto Trading Sdn Bhd']}
]);

const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function findShowroom(value){
 const key=String(value||'').trim().toLowerCase();
 return SHOWROOMS.find(s=>[s.id,s.name,s.label,...s.aliases].some(x=>x.toLowerCase()===key));
}
export function showroomLocationOptions(value=''){
 const selected=findShowroom(value),legacy=String(value||'').trim();
 return `<option value="">No location</option>${SHOWROOMS.map(s=>`<option value="${esc(s.label)}" ${selected?.id===s.id?'selected':''}>${esc(s.label)}</option>`).join('')}${legacy&&!selected?`<option value="${esc(legacy)}" selected>${esc(legacy)}</option>`:''}`;
}
export function showroomLinks(showroom){
 const query=encodeURIComponent(showroom.name+' '+showroom.address);
 return {maps:'https://www.google.com/maps/search/?api=1&query='+query,waze:'https://waze.com/ul?q='+query+'&navigate=yes',embed:'https://maps.google.com/maps?q='+query+'&t=m&z=15&output=embed&iwloc=near'};
}

export function showroomLocationsMarkup(lang='en'){
 const words=lang==='zh'?['展厅位置','选择展厅','Google 地图','Waze 导航','复制地址']:lang==='ms'?['Lokasi showroom','Pilih showroom','Google Maps','Waze','Salin alamat']:['Showroom locations','Choose a showroom','Google Maps','Waze','Copy address'];
 const first=SHOWROOMS[0],links=showroomLinks(first);
 return `<div class="contact-section-label showroom-locations-label">${words[0]}</div><div class="showroom-location-tabs" role="group" aria-label="${words[1]}">${SHOWROOMS.map((s,i)=>`<button type="button" data-showroom="${s.id}" aria-pressed="${i===0}">${esc(s.name)}</button>`).join('')}</div><div class="showroom-location-details"><h3 data-showroom-name>${esc(first.label)}</h3><p data-showroom-address>${esc(first.address)}</p><div class="location-actions"><a data-showroom-maps href="${links.maps}" target="_blank" rel="noopener">${words[2]} ↗</a><a data-showroom-waze href="${links.waze}" target="_blank" rel="noopener">${words[3]} ↗</a><button type="button" data-copy-showroom>${words[4]}</button></div></div><div class="contact-map-viewport"><iframe class="contact-map-iframe" data-showroom-map src="${links.embed}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen title="${esc(first.label)} map"></iframe></div>`;
}
export function bindShowroomLocations(host,{copy=text=>navigator.clipboard.writeText(text),onCopied=()=>{}}={}){
 let current=SHOWROOMS[0];
 host.querySelectorAll('[data-showroom]').forEach(button=>button.onclick=()=>{
  current=SHOWROOMS.find(s=>s.id===button.dataset.showroom)||SHOWROOMS[0];
  host.querySelectorAll('[data-showroom]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
  const links=showroomLinks(current);
  host.querySelector('[data-showroom-name]').textContent=current.label;
  host.querySelector('[data-showroom-address]').textContent=current.address;
  host.querySelector('[data-showroom-maps]').href=links.maps;
  host.querySelector('[data-showroom-waze]').href=links.waze;
  const frame=host.querySelector('[data-showroom-map]');frame.src=links.embed;frame.title=current.label+' map';
 });
 host.querySelector('[data-copy-showroom]').onclick=async()=>{try{await copy(current.address);onCopied(current.address);}catch{onCopied(current.address,false);}};
}
