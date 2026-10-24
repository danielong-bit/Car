import {loadVisitorStats} from './visitor-stats.mjs';
import {ownerSidebarMarkup,bindSidebarToggle} from './workbench-navigation.mjs';
import {themeButtonMarkup,bindThemeControls} from './site-theme.mjs';
import {enhanceLanguageControls} from './site-shell.mjs';
import {uploadCloudMedia} from './browser-stock.mjs';
import {applyTheme,workbenchTheme,saveWorkbenchTheme} from './site-theme.mjs';
import {inventoryBrands,visibleBrandFilters} from './inventory-brand-filters.mjs?v=stock-20261019d';
import {photoCategory} from './vehicle-gallery.mjs';
import {normalizeDocument,normalizeVehicle,normalizeTintPackage,vehicleIssues,STATUSES,GRADES,INTERIORS,SPECIAL_TAGS,vehicleSpecialBadges,label,estimate,number} from './inventory-domain.mjs?v=stock-themes-20261019';
import {tintPackages as defaultTintPackages} from './tint-packages.mjs';
import {readLocal,writeLocal,deleteLocal,photoUrl,compressPhoto,prepareReportFile} from './browser-stock.mjs';
import {icon} from './stock-icons.mjs';
import {zipSync,strToU8} from './vendor/zip.mjs';
const $=s=>document.querySelector(s),base=window.SITE_BASE||'/',esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=n=>n==null?'Enquire':'RM '+Number(n).toLocaleString('en-MY');
const statusName=s=>s==='reserved'?'Booked':label(s);
const PRIMARY_KPIS=['available','reserved','sold','draft'];
let saveQueue=Promise.resolve();
let serverRevision=0,cloudReady=false,publishedRevision=0,cloudStatus='',lastPublishedAt=null,pendingDraftChanges=true;
let doc,editing,view='overview',filter='all',issueFilter='',query='',make='',year='',sort='newest',cards=false,moreFilters=false,selection=new Set(),busy=false,toastTimer,editorDirty=false;
let draftMeta={updatedAt:null,exportFingerprint:null,exportGeneratedAt:null};
const content=$('#workspaceContent');
function staticWbSrc(u){
 const p=String(u||'');
 if(!p)return '';if(p.startsWith('/assets/uploads/'))return p;
 if(base!=='/'&&p.startsWith(base))return p;
 return p.startsWith('/assets/')?base+p.slice(1):p;
}
function computeFingerprint(d){
 try{
  const s=JSON.stringify({vehicles:d.vehicles,stories:d.stories,tintPackages:d.tintPackages,profile:d.profile,finance:d.finance,homepage:d.homepage});
  let h=2166136261;
  for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}
  return 'fp-'+(h>>>0).toString(16)+'-'+s.length;
 }catch{return '';}
}
function syncStatusBanner(){
 const saveEl=$('#saveState'),bannerEl=$('#wbLocalBanner'),textEl=$('#wbLocalStatusText');
 if(!doc||!saveEl)return;
 if(cloudReady){saveEl.textContent=cloudStatus||'Cloud draft saved';if(textEl)textEl.textContent=!pendingDraftChanges&&serverRevision===publishedRevision?'Website is up to date. Changes appear for every visitor.':'Draft saved to your account. Preview, then publish when ready.';if(bannerEl)bannerEl.dataset.state=!pendingDraftChanges&&serverRevision===publishedRevision?'clean':'dirty';return;}
 const fp=computeFingerprint(doc);
 const exported=Boolean(draftMeta.exportFingerprint&&draftMeta.exportFingerprint===fp);
 const timeStr=draftMeta.updatedAt?new Date(draftMeta.updatedAt).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}):'';
 if(exported){
  const expTime=draftMeta.exportGeneratedAt?new Date(draftMeta.exportGeneratedAt).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}):timeStr;
  saveEl.textContent=`Saved locally · Export ZIP ready (${expTime})`;
  if(bannerEl)bannerEl.dataset.state='exported';
  if(textEl)textEl.textContent=`Saved Locally · Export ZIP Generated (${expTime}) · Commit or upload to Cloudflare Pages / GitHub Pages to publish live.`;
 }else if(draftMeta.updatedAt){
  saveEl.textContent=`Saved locally (${timeStr}) · Export needed`;
  if(bannerEl)bannerEl.dataset.state='dirty';
  if(textEl)textEl.textContent='Saved Locally (This Browser) · Click “Preview showroom” to test or “Export site update” to publish to Cloudflare / GitHub.';
 }else{
  saveEl.textContent='Website stock loaded · Ready to edit';
  if(bannerEl)bannerEl.dataset.state='clean';
  if(textEl)textEl.textContent='Interactive Workbench Ready · Edit vehicles, XPEL/3M tint prices, deliveries, or settings below.';
 }
}
function showToast(options){if(typeof window.dannyWorkbenchShowToast==='function'){window.dannyWorkbenchShowToast(options);return true;}return false;}
function toast(message,error=false){if(showToast({title:message,variant:error?'error':'default'}))return;const t=$('#workbenchToast');if(!t)return;t.textContent=message;t.hidden=false;t.classList.toggle('error',error);clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.hidden=true,6500);}
function confirmAction(title,message){
 const destructive=/delete|remove|restore|reset/i.test(title);
 if(typeof window.dannyConfirmAction==='function')return window.dannyConfirmAction({title,description:message,confirmLabel:destructive?'Continue':'Confirm',destructive});
 const dialog=$('#confirmDialog');if(!dialog||typeof dialog.showModal!=='function')return Promise.resolve(false);
 $('#confirmTitle').textContent=title;$('#confirmCopy').textContent=message;
 return new Promise(resolve=>{let done=false;const end=value=>{if(done)return;done=true;try{dialog.close();}catch{}resolve(value);};$('#confirmYes').onclick=()=>end(true);$('#confirmCancel').onclick=()=>end(false);dialog.querySelector('[data-close]').onclick=()=>end(false);dialog.oncancel=e=>{e.preventDefault();end(false);};try{dialog.showModal();}catch{resolve(false);}});
}document.querySelectorAll('dialog [data-close]').forEach(b=>b.onclick=()=>b.closest('dialog').close());
let wbLazyObserver;
async function resolveWbImg(img){if(!img.dataset.source||img.dataset.hydrated===img.dataset.source)return;img.dataset.hydrated=img.dataset.source;try{img.src=await photoUrl(img.dataset.source,base);}catch{img.alt='Photo unavailable. Add a replacement.';}}
async function hydrateImages(){
 const imgs=[...document.querySelectorAll('img[data-source]')];
 imgs.forEach(img=>{if(!img.hasAttribute('loading'))img.setAttribute('loading','lazy');if(!img.hasAttribute('decoding'))img.setAttribute('decoding','async');});
 if(!('IntersectionObserver' in window)){await Promise.all(imgs.map(resolveWbImg));return;}
 if(!wbLazyObserver)wbLazyObserver=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){wbLazyObserver.unobserve(entry.target);resolveWbImg(entry.target);}});},{rootMargin:'350px 0px'});
 imgs.forEach(img=>{const rect=img.getBoundingClientRect();if(rect.top<window.innerHeight+350)resolveWbImg(img);else wbLazyObserver.observe(img);});
}
async function persist(){
 const at=new Date().toISOString();draftMeta.updatedAt=at;
 await writeLocal('inventory',{document:doc,updatedAt:at,exportFingerprint:draftMeta.exportFingerprint,exportGeneratedAt:draftMeta.exportGeneratedAt});await writeLocal('preview',publicSnapshot(doc));
 if(cloudReady){const snapshot=structuredClone(doc);const operation=saveQueue.then(async()=>{const response=await fetch('/api/owner/content',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({document:snapshot,baseRevision:serverRevision})});const result=await response.json();if(!response.ok){cloudStatus='Local copy saved — cloud save needs attention';syncStatusBanner();throw Error(result.error||'Cloud save failed');}serverRevision=result.revision;pendingDraftChanges=true;cloudStatus='Cloud draft saved';});const checked=operation.catch(error=>{cloudStatus='Cloud save unavailable — local backup kept';syncStatusBanner();throw error;});saveQueue=checked.catch(()=>{});await checked;}
 syncStatusBanner();
}

function activate(next){
 if(busy){toast('Please wait until the current file operation finishes.');return;}
 view=next;editorDirty=false;selection.clear();
 $('#pageHeading').textContent={overview:'Overview',media:'Media Library',homepage:'Homepage Editor',tools:'Calculator & JPJ',advanced:'Advanced Studio',inventory:'Vehicles',edit:doc.vehicles.some(v=>v.id===editing?.id)?'Edit vehicle':'Add a vehicle',services:'Services & Tinted (XPEL / 3M)',deliveries:'Deliveries & Handovers',settings:'Website Settings'}[view]||'Inventory';
 const activeNav=view==='edit'?'inventory':view;
 document.querySelectorAll('.wb-sidebar [data-nav]').forEach(b=>{if(b.dataset.nav===activeNav)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});
 render();
}
function newVehicle(){if(busy)return toast('Wait for the photos to finish.');editing=normalizeVehicle({id:crypto.randomUUID(),status:'draft',conditionType:'Recond',conditionExample:false,location:doc.profile.locations?.[0]||'Glenmarie',gallery:[]});activate('edit');}
const statusUndoTokens=new Map();
function openVehicleEditor(id,photos=false){if(busy)return;const vehicle=doc?.vehicles.find(v=>v.id===id);if(!vehicle)return;editing=structuredClone(vehicle);activate('edit');if(photos)$('#photosSection')?.scrollIntoView({block:'start'});}
async function saveStatusRollback(vehicleId,status){const vehicle=doc?.vehicles.find(item=>item.id===vehicleId);if(!vehicle)return;vehicle.status=status;try{await persist();}catch{}}
async function undoVehicleStatus(vehicleId,previous,next,token){if(statusUndoTokens.get(vehicleId)!==token)return;const vehicle=doc?.vehicles.find(item=>item.id===vehicleId);if(!vehicle||vehicle.status!==next)return;const undoToken=Symbol('status-undo');statusUndoTokens.set(vehicleId,undoToken);vehicle.status=previous;try{await persist();render();toast('Status restored to '+statusName(previous)+'.');}catch(error){if(statusUndoTokens.get(vehicleId)===undoToken&&vehicle.status===previous)await saveStatusRollback(vehicleId,next);render();toast(error.message,true);}}
async function changeVehicleStatus(select){const vehicle=doc?.vehicles.find(item=>item.id===select.dataset.status);if(!vehicle)return;const previous=vehicle.status,next=select.value;if(previous===next)return;if(['archived','unavailable'].includes(next)&&!await confirmAction('Change stock visibility?','This car will be hidden from the showroom preview.')){select.value=previous;return;}const token=Symbol('status-change');statusUndoTokens.set(vehicle.id,token);vehicle.status=next;select.disabled=true;try{await persist();render();if(!showToast({title:'Status changed to '+statusName(next)+'.',description:'Undo is available for a few seconds.',actionLabel:'Undo',duration:8000,onAction:()=>{void undoVehicleStatus(vehicle.id,previous,next,token);}}))toast('Status changed to '+statusName(next)+'.');}catch(error){if(statusUndoTokens.get(vehicle.id)===token){statusUndoTokens.delete(vehicle.id);await saveStatusRollback(vehicle.id,previous);}render();toast(error.message,true);}}
async function archiveVehicle(vehicleId){if(busy)return toast('Please wait until the current file operation finishes.');const vehicle=doc?.vehicles.find(item=>item.id===vehicleId);if(!vehicle||vehicle.status==='archived')return;const previous=vehicle.status;vehicle.status='archived';try{await persist();render();toast(vehicle.stockId+' archived.');}catch(error){await saveStatusRollback(vehicleId,previous);render();toast(error.message,true);}}
document.addEventListener('danny:workbench-row-action',event=>{const {id,action}=event.detail||{};if(id&&(action==='edit'||action==='photos'))openVehicleEditor(id,action==='photos');});
document.addEventListener('danny:workbench-archive-request',event=>{const id=event.detail?.id;if(id)void archiveVehicle(id);});
document.querySelectorAll('[data-nav]').forEach(b=>b.onclick=async()=>{if(busy)return;if(editorDirty&&!await confirmAction('Leave unsaved changes?','Save this vehicle first to keep your edits. Leave the editor anyway?'))return;if(b.dataset.nav==='edit')newVehicle();else activate(b.dataset.nav);});
const FIELD_GUIDES={
 stockId:{placeholder:'e.g. H89451 or DRS-2026-09',hint:'Unique stock code (letters, numbers, - or _). Click “⚡ Auto ID” to generate automatically.'},
 make:{placeholder:'e.g. Honda, Toyota, Mercedes-Benz, BMW, Porsche',hint:'Brand name — used for homepage brand buttons. Manage visible brands in Settings.'},
 model:{placeholder:'e.g. Civic Type R, Alphard, Vellfire, Stepwgn, A45s',hint:'Main model name shown on the card title.'},
 variant:{placeholder:'e.g. FL5, 2.5 SC Package, Z Premier, Spada RP8, RF',hint:'Trim or chassis generation — helps auto-detect RS / RF / TYPE R badges.'},
 manufactureYear:{placeholder:'e.g. 2022',hint:'Unregistered / manufacture year (4 digits, e.g. 2020–2026).'},
 priceRm:{placeholder:'e.g. 248000 (leave blank for “Enquire”)',hint:'Selling price in RM (numbers only). Leave empty to show “Enquire”.'},
 mileageKm:{placeholder:'e.g. 18500',hint:'Mileage in km (numbers only). Under 25,000 km automatically qualifies for LOW KM badge.'},
 status:{hint:'Available = public on site · Booked = reserved badge · Sold = sold badge · Draft = hidden while editing.'},
 location:{placeholder:'e.g. Glenmarie, Shah Alam',hint:'Showroom location shown on the card & detail page.'},
 transmission:{hint:'Auto (including CVT / DCT / PDK) or Manual (6MT).'},
 body:{hint:'Body style shown on the top-left gold chip of each car card.'},
 conditionType:{hint:'Recond = Japan/UK unregistered import · Pre-owned = local used · Consignment = owner consignment.'},
 badgeLabel:{placeholder:'e.g. MUGEN / EDITION 1 / MODELLISTA',hint:'Optional custom highlight badge shown on the car card.'},
 auctionGrade:{hint:'Overall Japanese auction grade (e.g. 5, 4.5, 4, S, RA).'},
 interiorGrade:{hint:'Cabin condition grade (A = near-new, B = clean minor wear, C = noticeable wear).'},
 auctionHouse:{placeholder:'e.g. USS Tokyo, TAA Kinki, HAA Kobe, CAA Chubu',hint:'Optional auction hall name shown under the grade.'},
 registrationYear:{placeholder:'e.g. Unregistered or 2024',hint:'Leave blank for unregistered recond units.'},
 engineCc:{placeholder:'e.g. 1996 or 2493',hint:'Engine displacement in cc (numbers only).'},
 engine:{placeholder:'e.g. 2.0L VTEC Turbo / 2.5L Dual VVT-i',hint:'Short engine description shown in specifications.'},
 fuelType:{hint:'Petrol, Hybrid, Diesel, or Electric.'},
 exteriorColor:{placeholder:'e.g. Championship White / Pearl White / Obsidian Black',hint:'Exterior paint name shown on detail page & search.'},
 interiorColor:{placeholder:'e.g. Red/Black Suede / Black Leather',hint:'Cabin trim & seat colour.'},
 chassisCode:{placeholder:'e.g. FL5 / FK8 / AGH30 / RP8 / ZG16',hint:'Chassis prefix from auction sheet or AP.'},
 warrantyInfo:{placeholder:'e.g. Up to 5-Year Warranty (Engine, Gearbox, ECU & Steering Rack)',hint:'Click a quick-fill button below or type your warranty coverage.'},
 conditionNotes:{placeholder:'e.g. Verified Grade 4.5B unit. Original paintwork, clean undercarriage, non-smoker cabin.',hint:'Summary of physical condition — click “✨ Auto-Write Copy” to generate automatically.'},
 description:{placeholder:'e.g. Hand-picked Japan recond unit inspected in Glenmarie, Shah Alam...',hint:'Main showroom story — click “✨ Auto-Write Copy” to generate from your vehicle specs.'}
};
const MODEL_PRESETS=[
 {id:'civic-fl5',label:'Honda Civic Type R FL5',make:'Honda',model:'Civic Type R',variant:'2.0 VTEC Turbo (FL5)',manufactureYear:2023,transmission:'Manual',body:'Hatchback',engineCc:1996,engine:'2.0L K20C1 VTEC Turbo',fuelType:'Petrol',exteriorColor:'Championship White',interiorColor:'Red / Black Alcantara Bucket Seats',chassisCode:'FL5',auctionGrade:'5',interiorGrade:'A',specialBadges:['TYPE R','LOW KM'],features:['Honda LogR 2.0 Performance Datalogger','Brembo 4-Pot Front Brake Calipers','19-inch Matte Black Forged Alloy Wheels',' Type R Suede Sport Bucket Seats','Adaptive Damper System (ADS)','Apple CarPlay & Android Auto','Honda SENSING Safety Suite','3-Mode Drive System (+R / Individual / Comfort)']},
 {id:'civic-fk8',label:'Honda Civic Type R FK8',make:'Honda',model:'Civic Type R',variant:'2.0 VTEC Turbo GT (FK8)',manufactureYear:2021,transmission:'Manual',body:'Hatchback',engineCc:1996,engine:'2.0L K20C1 VTEC Turbo',fuelType:'Petrol',exteriorColor:'Championship White',interiorColor:'Red / Black Suede Bucket Seats',chassisCode:'FK8',auctionGrade:'4.5',interiorGrade:'B',specialBadges:['TYPE R'],features:['20-inch Piano Black Alloy Wheels','Brembo Front Braking System','Triple Center Exhaust System','Red Type R Bucket Seats','Adaptive Damper System','Honda SENSING','Apple CarPlay & Reverse Camera']},
 {id:'alphard-sc',label:'Toyota Alphard 2.5 SC',make:'Toyota',model:'Alphard',variant:'2.5 SC Package',manufactureYear:2022,transmission:'Auto',body:'MPV',engineCc:2493,engine:'2.5L 2AR-FE Dual VVT-i',fuelType:'Petrol',exteriorColor:'Pearl White',interiorColor:'Black Perforated Leather',chassisCode:'AGH30W',auctionGrade:'4.5',interiorGrade:'A',specialBadges:['SC PACKAGE'],features:['Twin Moonroof / Sunroof','Pilot Executive Power Ottoman Seats','3-Eye LED Sequential Headlamps','Digital Inner Mirror (DIM)','Power Sliding Doors & Power Boot','JBL / Display Audio with Apple CarPlay','Ventilated & Heated Front + Rear Seats','360° Surround View Camera','Toyota Safety Sense (TSS)']},
 {id:'vellfire-z',label:'Toyota Vellfire 2.5 Z Premier',make:'Toyota',model:'Vellfire',variant:'2.4 Turbo Z Premier (40-Series)',manufactureYear:2023,transmission:'Auto',body:'MPV',engineCc:2393,engine:'2.4L T24A-FTS Turbo',fuelType:'Petrol',exteriorColor:'Precious Metal / Black',interiorColor:'Sunset Brown / Black Nappa Leather',chassisCode:'TAHA40W',auctionGrade:'5',interiorGrade:'A',specialBadges:['Z PREMIER','LOW KM'],features:['Left & Right Independent Moonroof','Executive Power Ottoman Captain Seats','14-inch HD Infotainment + Rear Entertainment','Head-Up Display (HUD)','360° Panoramic View Monitor','Digital Inner Mirror','Power Side Sunshades & Ambient Lighting','Toyota Safety Sense 3.0']},
 {id:'stepwgn-rp8',label:'Honda Stepwgn Spada RP8',make:'Honda',model:'Stepwgn',variant:'1.5 VTEC Turbo Spada Premium Line',manufactureYear:2022,transmission:'Auto',body:'MPV',engineCc:1496,engine:'1.5L VTEC Turbo',fuelType:'Petrol',exteriorColor:'Platinum White Pearl',interiorColor:'Black Prime Smooth Leather & Suede',chassisCode:'RP8',auctionGrade:'4.5',interiorGrade:'A',specialBadges:['RS'],features:['2nd Row Captain Seats with Ottoman','3rd Row Magic Fold-Flat Seats','Dual Power Sliding Doors + Power Tailgate','11.4-inch Honda CONNECT Display','Multi-View 360° Camera System','Honda SENSING Full Suite','Tri-Zone Climate Control']},
 {id:'mx5-rf',label:'Mazda MX-5 RF 2.0',make:'Mazda',model:'MX-5',variant:'2.0 RF Retractable Fastback RS',manufactureYear:2021,transmission:'Auto',body:'Convertible',engineCc:1998,engine:'2.0L SkyActiv-G',fuelType:'Petrol',exteriorColor:'Soul Red Crystal',interiorColor:'Black / Auburn Nappa Leather',chassisCode:'NDERC',auctionGrade:'4.5',interiorGrade:'A',specialBadges:['RF','RS'],features:['Power Retractable Hardtop Roof','Bose 9-Speaker Headrest Audio System','Recaro / Heated Leather Sport Seats','17-inch BBS / Dark Gunmetal Wheels','Apple CarPlay & Blind Spot Monitoring','Smart Keyless Entry & Push Start']},
 {id:'gr-yaris',label:'Toyota GR Yaris RZ High Perf',make:'Toyota',model:'GR Yaris',variant:'1.6 Turbo RZ High Performance 4WD',manufactureYear:2022,transmission:'Manual',body:'Hatchback',engineCc:1618,engine:'1.6L G16E-GTS Turbo GR-FOUR',fuelType:'Petrol',exteriorColor:'Platinum White Pearl',interiorColor:'Black GR Ultrasuede Sport Seats',chassisCode:'GXPA16',auctionGrade:'4.5',interiorGrade:'A',specialBadges:['RZ','LOW KM'],features:['GR-FOUR Configurable AWD System','Torsen Limited-Slip Differentials (Front & Rear)','18-inch BBS Forged Alloy Wheels','Carbon Fibre Roof Panel','JBL 8-Speaker Sound System','Head-Up Display (HUD)']},
 {id:'a45s-amg',label:'Mercedes-AMG A45 S 4MATIC+',make:'Mercedes-Benz',model:'A45 S AMG',variant:'2.0 4MATIC+ Plus',manufactureYear:2021,transmission:'Auto',body:'Hatchback',engineCc:1991,engine:'2.0L M139 Handcrafted Turbo (421 HP)',fuelType:'Petrol',exteriorColor:'Mountain Grey Magno',interiorColor:'Black Artico / Dinamica Microfibre with Yellow Stitching',chassisCode:'W177',auctionGrade:'4.5',interiorGrade:'A',specialBadges:['AMG'],features:['AMG Performance Bucket Seats','AMG Aerodynamics Package','Burmester Surround Sound System','Panoramic Sliding Sunroof','Head-Up Display (HUD) & MBUX Dual Widescreen','360° Surround Camera','AMG Ride Control Adaptive Damping']},
 {id:'audi-s5',label:'Audi S5 Sportback 3.0 TFSI',make:'Audi',model:'S5',variant:'3.0 TFSI Quattro Sportback',manufactureYear:2022,transmission:'Auto',body:'Coupe',engineCc:2995,engine:'3.0L V6 TFSI Turbo Quattro',fuelType:'Petrol',exteriorColor:'Daytona Grey Pearl',interiorColor:'Magma Red / Black Fine Nappa Leather',chassisCode:'F5',auctionGrade:'4.5',interiorGrade:'A',specialBadges:['S LINE'],features:['Bang & Olufsen 3D Premium Sound System','Quattro Permanent All-Wheel Drive','S Super Sport Diamond-Quilted Seats with Massage','Matrix LED Headlights with Dynamic Indicators','Audi Virtual Cockpit Plus','360° Area View Camera','Carbon Atlas Interior Inlays']},
 {id:'lexus-rx350',label:'Lexus RX350 F Sport',make:'Lexus',model:'RX350',variant:'2.4 Turbo F Sport AWD',manufactureYear:2023,transmission:'Auto',body:'SUV',engineCc:2393,engine:'2.4L T24A-FTS Turbo',fuelType:'Petrol',exteriorColor:'White Nova Glass Flake',interiorColor:'Dark Rose / Black F Sport Leather',chassisCode:'TALA15',auctionGrade:'5',interiorGrade:'A',specialBadges:['F SPORT','LOW KM'],features:['Panoramic Glass Roof','Mark Levinson / Premium Surround Sound','14-inch Tazuna Touchscreen Display','Head-Up Display (HUD) & Digital Inner Mirror','F Sport Adaptive Variable Suspension (AVS)','360° Panoramic View Monitor','Lexus Safety System+ 3.0']}
];
const QUICK_FEATURES=[
 'Sunroof / Panoramic Roof',
 '360° Surround Camera',
 'Apple CarPlay & Android Auto',
 'Head-Up Display (HUD)',
 'Pilot / Ottoman Captain Seats',
 'Power Boot / Hands-Free Tailgate',
 'Blind Spot Monitor (BSM)',
 'Adaptive Cruise Control (ACC)',
 'Digital Inner Mirror (DIM)',
 'Bose / JBL / Burmester Premium Audio',
 'Electric Memory Leather Seats',
 'LED Matrix Sequential Headlamps',
 'Keyless Entry & Push Start',
 'Ventilated & Heated Seats'
];
function generateUniqueStockId(makeStr=''){
 const prefix=(makeStr||'DRS').replace(/[^A-Za-z]/g,'').slice(0,3).toUpperCase()||'DRS';
 const existing=new Set((doc?.vehicles||[]).map(v=>String(v.stockId||'').toUpperCase()));
 for(let n=101;n<999;n++){
  const candidate=`${prefix}-${n}`;
  if(!existing.has(candidate))return candidate;
 }
 return `${prefix}-${Math.floor(1000+Math.random()*9000)}`;
}
function generateAutoCopy(v){const title=[v.manufactureYear||v.year||'',v.make,v.model,v.variant].filter(Boolean).join(' ');const mileage=v.mileageKm==null?'':Number(v.mileageKm).toLocaleString('en-MY')+' km';return {conditionNotes:'Ask Danny to review the original report and vehicle condition before purchase.',description:[title,mileage,v.exteriorColor||'',v.transmission||''].filter(Boolean).join(' · ')+'. Contact Danny to confirm availability, specifications and a viewing.'};}

function field(name,key,type='text',options,required=false,extraAction=''){
 const value=editing[key];
 const guide=FIELD_GUIDES[key]||{};
 const ph=guide.placeholder?`placeholder="${esc(guide.placeholder)}"`:'';
 return `<label class="field"><span class="field-label-row"><span>${name}${required?' <span aria-hidden="true">*</span>':''}</span>${extraAction}</span>${type==='select'?`<select name="${key}" ${required?'required':''}>${options.map(o=>`<option value="${esc(o)}" ${String(value)===String(o)?'selected':''}>${esc(key==='status'?statusName(o):o||'Not specified')}</option>`).join('')}</select>`:type==='textarea'?`<textarea name="${key}" rows="3" ${ph}>${esc(value)}</textarea>`:`<input name="${key}" type="${type}" value="${esc(value)}" ${ph} ${type==='number'?'min="0" step="1"':''} ${required?'required':''} ${key==='stockId'?'pattern="[A-Za-z0-9_-]+" maxlength="80"':''}>`}${guide.hint?`<small class="field-hint">${esc(guide.hint)}</small>`:''}<small class="field-error" data-error="${key}"></small></label>`;
}
function buildHookMarkup(){
 const total=doc.vehicles.length;
 if(!total){
  return `<div class="wb-hook-bar is-cold"><div class="wb-hook-copy"><span class="wb-hook-eyebrow">DAY 1 · COLD START</span><strong>Currently 0 vehicles in stock → Click “+ Add vehicle” to create your first listing or restore a JSON backup</strong></div><div class="wb-hook-actions"><button type="button" class="button small" data-action="new">${icon('plus')} Add first vehicle</button><button type="button" class="button small quiet" data-action="go-backup">Restore backup</button></div></div>`;
 }
 const avail=doc.vehicles.filter(v=>v.status==='available').length;
 const booked=doc.vehicles.filter(v=>v.status==='reserved').length;
 const missingPhoto=doc.vehicles.filter(v=>v.status==='available'&&!v.gallery.length).length;
 const drafts=doc.vehicles.filter(v=>v.status==='draft').length;
 const exampleGrades=doc.vehicles.filter(v=>v.status==='available'&&v.conditionExample).length;
 let headline,ctaLabel='',ctaAction='';
 if(missingPhoto>0){
  headline=`Available ${avail} · Booked ${booked} · ${missingPhoto} available car${missingPhoto>1?'s':''} missing cover photo → Add photos first`;
  ctaLabel='Show missing photos';ctaAction='filter-missing-photo';
 }else if(drafts>0){
  headline=`Available ${avail} · Booked ${booked} · ${drafts} draft vehicle${drafts>1?'s':''} pending → Complete & set Available when ready`;
  ctaLabel='Review drafts';ctaAction='filter-draft';
 }else if(exampleGrades>0){
  headline=`Available ${avail} · Booked ${booked} · ${exampleGrades} car${exampleGrades>1?'s':''} using example report/grade → Replace with verified sheet when ready`;
  ctaLabel='Review example grades';ctaAction='filter-example-grade';
 }else{
  headline=`Available ${avail} · Booked ${booked} · All available stock have cover photos → Ready to preview or export GitHub update`;
  ctaLabel='Export GitHub update ↓';ctaAction='export';
 }
 return `<div class="wb-hook-bar"><div class="wb-hook-copy"><span class="wb-hook-eyebrow">LIVE STOCK PULSE</span><strong>${esc(headline)}</strong></div>${ctaAction?`<div class="wb-hook-actions"><button type="button" class="button small quiet" data-action="${ctaAction}">${esc(ctaLabel)}</button></div>`:''}</div>`;
}
function inventory(){
 const totals=Object.fromEntries(STATUSES.map(s=>[s,doc.vehicles.filter(v=>v.status===s).length]));
 const missingPhotoCars=doc.vehicles.filter(v=>v.status==='available'&&!v.gallery.length);
 const draftCars=doc.vehicles.filter(v=>v.status==='draft');
 const exampleCars=doc.vehicles.filter(v=>v.status==='available'&&v.conditionExample);
 const years=[...new Set(doc.vehicles.map(v=>v.year).filter(Boolean))].sort((a,b)=>b-a);
 const filtered=doc.vehicles.filter(v=>{
  if(issueFilter==='missing-photo'&&!(v.status==='available'&&!v.gallery.length))return false;
  if(issueFilter==='example-grade'&&!(v.status==='available'&&v.conditionExample))return false;
  if(filter==='all'){if(v.status==='archived')return false;}
  else if(v.status!==filter)return false;
  if(make&&v.make!==make)return false;
  if(year&&String(v.year)!==String(year))return false;
  return [v.stockId,v.make,v.model,v.variant,...(v.specialBadges||[])].join(' ').toLowerCase().includes(query.toLowerCase());
 });
 filtered.sort((a,b)=>sort==='price-up'?(a.priceRm??Infinity)-(b.priceRm??Infinity):sort==='price-down'?(b.priceRm??-1)-(a.priceRm??-1):sort==='mileage'?(a.mileageKm??Infinity)-(b.mileageKm??Infinity):(b.year||0)-(a.year||0));
 const hasAttention=missingPhotoCars.length>0||draftCars.length>0||exampleCars.length>0;
 return `${buildHookMarkup()}
 <section class="wb-kpis wb-kpis-4" aria-label="Filter by primary stock status">${PRIMARY_KPIS.map(s=>`<button type="button" data-status-filter="${s}" aria-pressed="${filter===s}"><span>${statusName(s)}</span><strong>${totals[s]||0}</strong></button>`).join('')}</section>
 <section class="wb-panel"><div class="wb-section-head"><div><h2>Your vehicles <span class="count">${filtered.length}</span></h2><p>Update a status inline, or open a car to edit its photos, RS/RF badges, and specifications.</p></div><div class="wb-head-actions">${filter!=='all'||issueFilter||query||make||year?`<button type="button" class="button quiet" data-action="reset-filters">Show all (${doc.vehicles.filter(v=>v.status!=='archived').length})</button>`:''}<button type="button" class="button" data-action="new">${icon('plus')} Add vehicle</button></div></div>
 ${hasAttention?`<div class="stock-attention-bar" role="region" aria-label="Stock attention">
  <span class="attention-label">Stock Attention:</span>
  <div class="attention-chips">
   ${missingPhotoCars.length?`<button type="button" class="attention-chip is-warn ${issueFilter==='missing-photo'?'is-active':''}" data-action="filter-missing-photo">${missingPhotoCars.length} available missing cover photo</button>`:''}
   ${draftCars.length?`<button type="button" class="attention-chip ${filter==='draft'?'is-active':''}" data-action="filter-draft">${draftCars.length} unpublished draft${draftCars.length>1?'s':''}</button>`:''}
   ${exampleCars.length?`<button type="button" class="attention-chip ${issueFilter==='example-grade'?'is-active':''}" data-action="filter-example-grade">${exampleCars.length} using example grade/report</button>`:''}
   ${issueFilter||filter!=='all'?`<button type="button" class="text-button" data-action="reset-filters">Clear filter</button>`:''}
  </div>
 </div>`:''}
 <div class="wb-toolbar ${moreFilters?'expanded':''}"><label class="search-field">${icon('search')}<input id="stockSearch" type="search" placeholder="Search stock ID, make, model, RS / RF…" value="${esc(query)}" aria-label="Search inventory"></label><label class="compact-field"><span>Make</span><select id="makeFilter"><option value="">All makes</option>${[...new Set(doc.vehicles.map(v=>v.make).filter(Boolean))].sort().map(v=>`<option ${make===v?'selected':''}>${esc(v)}</option>`).join('')}</select></label><label class="compact-field"><span>Sort</span><select id="stockSort">${[['price-up','Price: low to high'],['price-down','Price: high to low'],['mileage','Lowest mileage'],['newest','Newest year']].map(([v,t])=>`<option value="${v}" ${sort===v?'selected':''}>${t}</option>`).join('')}</select></label><button type="button" class="button quiet" data-action="toggle-filters" aria-expanded="${moreFilters}">More Filters ${moreFilters?'▴':'▾'}</button><button type="button" class="button quiet view-toggle" data-action="toggle-view">${cards?'Table view':'Card view'}</button></div>
 ${moreFilters?`<div class="wb-more-filters"><label class="compact-field"><span>All Statuses (incl. Archived / Unavailable)</span><select id="statusSelectFilter"><option value="all" ${filter==='all'?'selected':''}>All active (excl. Archived)</option>${STATUSES.map(s=>`<option value="${s}" ${filter===s?'selected':''}>${statusName(s)} (${totals[s]||0})</option>`).join('')}</select></label><label class="compact-field"><span>Year</span><select id="yearFilter"><option value="">All years</option>${years.map(y=>`<option value="${y}" ${String(year)===String(y)?'selected':''}>${y}</option>`).join('')}</select></label><label class="compact-field"><span>Stock Check Filter</span><select id="issueSelectFilter"><option value="" ${!issueFilter?'selected':''}>All vehicles</option><option value="missing-photo" ${issueFilter==='missing-photo'?'selected':''}>Missing cover photo (${missingPhotoCars.length})</option><option value="example-grade" ${issueFilter==='example-grade'?'selected':''}>Using example grade/report (${exampleCars.length})</option></select></label><button type="button" class="button quiet" data-action="reset-filters">Reset all filters</button></div>`:''}
 ${selection.size?`<div class="bulk-bar"><strong>${selection.size} selected</strong><label>Change status <select id="bulkStatus"><option value="">Choose…</option>${STATUSES.map(s=>`<option value="${s}">${statusName(s)}</option>`).join('')}</select></label><button type="button" class="text-button" data-action="bulk-clear">Clear</button></div>`:''}
 <div class="wb-inventory ${cards?'card-layout':''}"><div class="wb-table-head"><label><input type="checkbox" id="selectAll" ${filtered.length&&filtered.every(v=>selection.has(v.id))?'checked':''} aria-label="Select all shown vehicles"></label><span>VEHICLE / STOCK ID</span><span>STATUS & BADGES</span><span>PRICE / LOCATION</span><span>PHOTOS</span><span>ACTIONS</span></div>${filtered.map(v=>{const sp=vehicleSpecialBadges(v,doc.homepage),cSrc=staticWbSrc(v.coverImageUrl);return `<div class="wb-swipe-host" data-swipe-host><article class="wb-row" data-id="${esc(v.id)}"><label class="row-check"><input data-select="${esc(v.id)}" type="checkbox" ${selection.has(v.id)?'checked':''} aria-label="Select ${esc(v.stockId)}"></label><button type="button" class="wb-vehicle" data-edit="${esc(v.id)}">${v.coverImageUrl?`<img ${cSrc?`src="${esc(cSrc)}" `:''}data-source="${esc(v.coverImageUrl)}" alt="${esc(v.make+' '+v.model)}" loading="lazy" decoding="async">`:`<span class="wb-photo-placeholder">${icon('photo')}</span>`}<span><strong>${v.year||''} ${esc(v.make)} ${esc(v.model)}</strong><small>${esc(v.variant||v.body)} · ${esc(v.transmission)}</small><code>${esc(v.stockId)}</code></span></button><div class="row-status-group"><label class="row-status"><span class="sr-only">Status for ${esc(v.stockId)}</span><select class="status-pill ${v.status}" data-status="${esc(v.id)}">${STATUSES.map(s=>`<option value="${s}" ${v.status===s?'selected':''}>${statusName(s)}</option>`).join('')}</select></label>${sp.length?`<div class="wb-badge-chips">${sp.map(b=>`<span class="wb-mini-badge">${esc(b)}</span>`).join('')}</div>`:''}</div><div class="row-price"><strong>${money(v.priceRm)}</strong><small>${esc(v.location||'Location not set')}</small></div><button type="button" class="photo-count" data-photos="${esc(v.id)}">${icon('photo')} ${v.gallery.length}</button><div class="row-actions"><button type="button" data-edit="${esc(v.id)}">Edit</button><details><summary aria-label="More actions for ${esc(v.stockId)}">•••</summary><div class="row-menu"><button type="button" data-duplicate="${esc(v.id)}">Duplicate as draft</button><div class="archive-fuse-mount" data-archive-mount="${esc(v.id)}"></div><button type="button" data-delete="${esc(v.id)}" class="danger-text">Delete</button></div></details></div></article></div>`;}).join('')||`<div class="empty-state"><h3>${doc.vehicles.length?'No matching vehicles':'No vehicles in inventory yet'}</h3><p>${doc.vehicles.length?'Try another search or clear the active filter to see your collection.':'Add your first vehicle or restore a JSON backup from Website Settings.'}</p><button type="button" class="button quiet" data-action="${doc.vehicles.length?'reset-filters':'new'}">${doc.vehicles.length?'Reset filters':'+ Add first vehicle'}</button></div>`}</div></section>`;
}
function editor(){
 const activeTags=new Set((editing.specialBadges||[]).map(t=>String(t).toUpperCase()));
 const currentFeatures=new Set((editing.features||[]).map(f=>f.trim()));
 return `<form id="vehicleForm" class="vehicle-form"><div class="editor-heading"><div><p class="eyebrow">VEHICLE RECORD · SMART 3-STEP EDITOR</p><h2>${editing.stockId?esc((editing.manufactureYear||editing.year||'')+' '+editing.make+' '+editing.model):'Add your next vehicle'}</h2><p>Enter the verified vehicle details, choose its photos, and save a draft. Publish when you are ready.</p></div><button type="button" class="button quiet" data-action="back">← Back to inventory</button></div>
 <section class="wb-autofill-bar" aria-label="Smart Auto-Fill Assistant">
  <div class="wb-autofill-head">
   <div>
    <span class="wb-hook-eyebrow">⚡ SMART AUTO-FILL &amp; GUIDED ASSISTANT · 一键自动填表助手</span>
    <strong>Pick a popular model preset or click “Smart Complete” after typing Make &amp; Model</strong>
    <p>Automatically fills Stock ID, Body Type, Transmission, Engine CC, Chassis Code, Card Badges (RS / RF / TYPE R / LOW KM), Showroom Copy &amp; Features.</p>
   </div>
   <div class="wb-autofill-actions">
    <button type="button" class="button small" data-action="smart-complete">⚡ Smart Complete from Make/Model</button>
    <button type="button" class="button small quiet" data-action="auto-copy">✨ Auto-Write Copy</button>
   </div>
  </div>
  <div class="wb-preset-row">
   <span class="wb-preset-label">1-Click Model Presets:</span>
   <div class="wb-preset-chips">
    ${MODEL_PRESETS.map(p=>`<button type="button" class="wb-preset-chip" data-preset="${esc(p.id)}">+ ${esc(p.label)}</button>`).join('')}
   </div>
  </div>
  <details class="wb-fill-guide">
   <summary>💡 How to fill &amp; publish a car in 60 seconds (填写指南 — 放什么内容？)</summary>
   <div class="wb-fill-guide-grid">
    <div><strong>1. Click a Preset or Type Make + Model</strong><p>Click any model chip above (e.g. <em>Alphard 2.5 SC</em> or <em>Civic Type R FL5</em>) to auto-fill 80% of the form immediately.</p></div>
    <div><strong>2. Fill Price (RM) &amp; Mileage (km)</strong><p>Enter only your selling price (e.g. <code>248000</code>) and mileage (e.g. <code>18500</code>). Under 25,000 km automatically activates the <code>LOW KM</code> badge.</p></div>
    <div><strong>3. Drop Photos &amp; Save as Available</strong><p>Drag your car photos into Step 02 (Photo #1 becomes the cover), set Status to <strong>Available</strong>, and click <strong>Save vehicle</strong>.</p></div>
   </div>
  </details>
 </section>
 <section class="wb-panel form-section"><div class="form-section-title"><span>01</span><div><h3>Basic Information</h3><p>Core vehicle identity, pricing, status, and optional RS / RF / LOW KM card badges.</p></div></div><div class="form-grid">${field('Stock ID','stockId','text',null,true,`<button type="button" class="field-quick-btn" data-action="auto-stock-id">⚡ Auto ID</button>`)}${field('Make','make','text',null,true)}${field('Model','model','text',null,true)}${field('Variant (e.g. RS, RF, Type R)','variant')}${field('Manufacture year','manufactureYear','number')}${field('Price (RM)','priceRm','number')}${field('Mileage (km)','mileageKm','number')}${field('Status','status','select',STATUSES,true)}${field('Showroom location','location')}${field('Transmission','transmission','select',['Auto','Manual'])}${field('Body type','body','select',['','MPV','SUV','Sedan','Wagon','Coupe','Hatchback','Convertible','Pickup'])}${field('Condition','conditionType','select',['Recond','Pre-owned','Consignment'])}</div>
 <div class="badge-picker-block"><div class="badge-picker-head"><strong>Card Highlight Badges (RS, RF, LOW KM)</strong><small>Shown on homepage vehicle cards replacing the generic “Available” badge.</small></div><div class="badge-tag-grid">${SPECIAL_TAGS.map(tag=>`<label class="badge-tag-option"><input type="checkbox" name="specialBadgeTag" value="${esc(tag)}" ${activeTags.has(tag)||(tag==='LOW KM'&&editing.lowKm)?'checked':''}><span>${esc(tag)}</span></label>`).join('')}</div><div class="form-grid" style="margin-top:12px">${field('Custom badge label (optional, e.g. MUGEN / EDITION 1)','badgeLabel')}<label class="check-field" style="align-self:end"><input type="checkbox" name="lowKm" ${editing.lowKm||(editing.mileageKm!=null&&editing.mileageKm<=25000)?'checked':''}> Highlight as Low Mileage (LOW KM badge)</label></div></div>
 <p class="muted">Leave Price blank to display “Enquire” (valid business state). Booked vehicles invite enquiries about similar stock.</p></section>
 <section class="wb-panel form-section" id="photosSection"><div class="form-section-title"><span>02</span><div><h3>Vehicle Photos (Cover &amp; 1/N Gallery)</h3><p>Photo #1 is the cover image. Buyers swipe 1/12 → 12/12 on mobile and tap to enlarge.</p></div><span class="count">${editing.gallery.length} photos</span></div><label class="upload-zone" id="photoDrop">${icon('photo')}<strong>Drop photos here, or choose files</strong><span>JPG, PNG, WebP · compressed to 1920px WebP · saved to your media library</span><input id="photoFiles" type="file" accept="image/jpeg,image/png,image/webp" multiple></label><div id="uploadProgress" aria-live="polite"></div><div class="photo-editor-grid">${editing.gallery.map((m,i)=>{const mSrc=staticWbSrc(m.url);return `<article class="photo-tile"><div><img ${mSrc?`src="${esc(mSrc)}" `:''}data-source="${esc(m.url)}" alt="Photo ${i+1}" loading="lazy" decoding="async">${i===0?'<span class="cover-label">Cover photo</span>':`<span class="cover-label" style="background:#080b10cc;color:#f8fafc">${i+1}/${editing.gallery.length}</span>`}</div><label class="photo-category-field">Photo category<select data-media-category="${i}">${[['exterior','Exterior'],['interior','Interior'],['engine','Engine'],['details','Details']].map(([key,name])=>`<option value="${name}" ${photoCategory(m.category)===key?'selected':''}>${name}</option>`).join('')}</select></label><div class="photo-actions"><button type="button" data-cover="${i}" ${i===0?'disabled':''}>Set cover</button><button type="button" data-move="${i}" data-step="-1" ${i===0?'disabled':''} aria-label="Move photo ${i+1} left">←</button><button type="button" data-move="${i}" data-step="1" ${i===editing.gallery.length-1?'disabled':''} aria-label="Move photo ${i+1} right">→</button><label class="replace-photo">Replace<input type="file" accept="image/jpeg,image/png,image/webp" data-replace="${i}"></label><button type="button" data-remove="${i}" class="danger-text">Remove</button></div></article>`;}).join('')}</div></section>
 <details class="wb-panel form-section" open><summary><span class="form-section-title"><span>03</span><span><strong>Grades, Specs, Auto-Copy &amp; Walkthrough Video</strong><small>Auction &amp; interior grades, engine specs, 1-click feature chips, and auto-generated showroom copy.</small></span></span></summary><div class="form-grid">${field('Auction grade','auctionGrade','select',GRADES)}${field('Interior grade','interiorGrade','select',INTERIORS)}${field('Auction house','auctionHouse')}${field('Registration year','registrationYear','number')}${field('Engine capacity (cc)','engineCc','number')}${field('Engine description','engine')}${field('Fuel type','fuelType','select',['','Petrol','Diesel','Hybrid','Electric'])}${field('Exterior colour','exteriorColor')}${field('Interior colour','interiorColor')}${field('Chassis / Frame No. / VIN (real vehicle number)','chassisNumber')}${field('Chassis model code (e.g. FL5)','chassisCode')}${field('Warranty','warrantyInfo','text',null,false,`<span class="field-quick-group"><button type="button" class="field-quick-btn" data-warranty-preset="Up to 5-Year Warranty (Engine, Gearbox, ECU &amp; Steering Rack)">5-Yr</button><button type="button" class="field-quick-btn" data-warranty-preset="Up to 7-Year / Unlimited Mileage Warranty Available">7-Yr</button></span>`)}</div><label class="check-field"><input type="checkbox" name="conditionExample" ${editing.conditionExample?'checked':''}> Show example grade &amp; demonstration report notice</label><p class="muted">New vehicles default to off. Legacy demo cars keep this enabled until a real grade or auction sheet is attached.</p><label class="check-field"><input type="checkbox" name="gradeVerified" ${editing.gradeVerified?'checked':''}> Auction grade checked against the original report</label><label class="check-field"><input type="checkbox" name="isFeatured" ${editing.isFeatured?'checked':''}> Feature on the homepage</label><div class="form-grid wide">${field('Condition notes','conditionNotes','textarea',null,false,`<button type="button" class="field-quick-btn" data-action="auto-copy">✨ Auto-Write</button>`)}${field('Description','description','textarea',null,false,`<button type="button" class="field-quick-btn" data-action="auto-copy">✨ Auto-Write</button>`)}<div class="field"><span class="field-label-row"><span>Features / options (one per line — click chips below to add/remove)</span></span><div class="wb-feature-chips">${QUICK_FEATURES.map(f=>`<button type="button" class="wb-feature-chip ${currentFeatures.has(f)?'is-active':''}" data-toggle-feature="${esc(f)}">${currentFeatures.has(f)?'✓ ':'+ '}${esc(f)}</button>`).join('')}</div><textarea name="features" rows="5" placeholder="e.g.&#10;Sunroof / Panoramic Roof&#10;360° Surround Camera&#10;Apple CarPlay &amp; Android Auto">${esc(editing.features.join('\n'))}</textarea><small class="field-hint">Click any chip above to toggle common recond features, or type one feature per line.</small></div><div class="field-stack"><label class="field">Danny's TikTok explanation<input name="presenterUrl" type="url" value="${esc(editing.presenter?.url||'')}" placeholder="https://www.tiktok.com/@dannyongg/video/…"><small class="field-hint">Optional — embeds Danny's TikTok walkthrough video on the car detail page.</small></label><label class="field" style="margin-top:14px">Facebook video fallback<input name="presenterFacebook" type="url" value="${esc(editing.presenter?.facebook||'')}" placeholder="https://www.facebook.com/reel/…"><small class="field-hint">Optional Facebook Reel link shown alongside TikTok.</small></label></div></div></details><div class="editor-save"><span id="editorError" role="alert">Save and go live updates this vehicle only. Other drafts stay private.</span><div><button type="button" class="button quiet" data-action="preview-card">Preview card</button><button type="button" class="button quiet" data-action="save-draft">Save as draft</button><button type="submit" class="button" id="saveVehicle">Save and go live ${icon('check')}</button></div></div></form>`;
}
function deliveriesMarkup(){
 const stories=doc.stories||[];
 const pubCount=stories.filter(s=>s.published).length;
 const vidCount=stories.filter(s=>s.videoUrl).length;
 return `<div class="wb-section-head" style="padding:0 0 18px">
   <div>
    <p class="eyebrow">RECENT DELIVERIES · PHOTOS &amp; VIDEOS (${pubCount} SHOWN · ${vidCount} VIDEO)</p>
    <h3>Handover moments &amp; customer stories <span class="count">${stories.length}</span></h3>
    <p>Upload handover photos or attach a TikTok / Reel / MP4 link. Toggle “Show on website” to display or hide any item on the homepage.</p>
   </div>
   <button type="button" class="button" data-action="add-story">${icon('plus')} Add photo / video</button>
  </div>
  <div class="story-workbench-grid" style="padding:0">
   ${stories.map((s,idx)=>{const sSrc=staticWbSrc(s.image);return `<details class="wb-story-card ${s.published?'is-published':''}" data-story-id="${esc(s.id)}"><summary class="delivery-summary"><img ${sSrc?`src="${esc(sSrc)}"`:''} data-source="${esc(s.image)}" alt=""><span><strong>${esc(s.title||'New handover')}</strong><small>${s.published?'Shown after publication':'Hidden'} · ${s.videoUrl?'Photo + video':'Photo'}</small></span><span class="delivery-edit">Edit ↓</span></summary>
    <div class="wb-story-media">
     ${s.image?`<img ${sSrc?`src="${esc(sSrc)}" `:''}data-source="${esc(s.image)}" alt="${esc(s.title)}" loading="lazy" decoding="async">`:`<div class="wb-photo-placeholder">${icon('photo')}</div>`}
     <span class="wb-story-badge ${s.videoUrl?'is-video':''}">${s.videoUrl?'VIDEO + PHOTO':'PHOTO'}</span>
     <label class="wb-story-upload button quiet">${icon('photo')} ${s.image?'Change cover photo':'Upload photo'}<input type="file" accept="image/jpeg,image/png,image/webp" data-story-photo="${esc(s.id)}" hidden></label>
    </div>
    <div class="wb-story-body">
     <div class="form-grid">
      <label class="field">Title (e.g. Porsche 911 Handover)<input type="text" data-story-input="title" data-story-id="${esc(s.id)}" value="${esc(s.title)}" placeholder="e.g. Honda Civic Type R FL5 Handover"></label>
      <label class="field">Location / Tag (optional)<input type="text" data-story-input="date" data-story-id="${esc(s.id)}" value="${esc(s.date||'')}" placeholder="Glenmarie · Handover"></label>
     </div>
     <label class="field"><span class="field-label-row"><span>Short caption</span><button type="button" class="field-quick-btn" data-story-autofill="${esc(s.id)}">✨ Auto-Fill Caption</button></span><input type="text" data-story-input="caption" data-story-id="${esc(s.id)}" value="${esc(s.caption)}" placeholder="e.g. Handed over in Glenmarie after full inspection and detailing."></label>
     <label class="field">Video URL (optional — TikTok, Facebook Reel, or .mp4)<input type="url" data-story-input="videoUrl" data-story-id="${esc(s.id)}" value="${esc(s.videoUrl||'')}" placeholder="https://www.tiktok.com/@dannyongg/video/..."></label>
     <div class="owner-item-save"><button type="button" class="button" data-live-story="${esc(s.id)}">Save and go live</button><small>Only this handover is published.</small></div>
     <div class="wb-story-footer">
      <label class="check-field"><input type="checkbox" data-story-publish="${esc(s.id)}" ${s.published?'checked':''}> <strong>Show on website</strong></label>
      <div class="wb-story-actions">
       <button type="button" class="button quiet" data-story-move="${idx}" data-step="-1" ${idx===0?'disabled':''} aria-label="Move earlier">←</button>
       <button type="button" class="button quiet" data-story-move="${idx}" data-step="1" ${idx===stories.length-1?'disabled':''} aria-label="Move later">→</button>
       <button type="button" class="text-button danger-text" data-story-delete="${esc(s.id)}">Delete</button>
      </div>
     </div>
    </div>
   </details>`;}).join('')||'<div class="empty-state"><h3>No delivery moments yet</h3><p>Add your first customer handover photo or video above.</p></div>'}
  </div>`;
}
function deliveriesView(){
 return `<section class="wb-panel" style="padding:23px">${deliveriesMarkup()}</section>`;
}
function servicesMarkup(){
 const pkgs=doc.tintPackages||[];
 const xpel=pkgs.filter(p=>p.brand==='XPEL');
 const threeM=pkgs.filter(p=>p.brand==='3M');
 const renderPkgCard=p=>{
  const isXpel=p.brand==='XPEL';
  const cats=isXpel?['Standard','Large','SUV','MPV']:['Standard','SUV','MPV'];
  const imgSrc=staticWbSrc('/'+String(p.image||'').replace(/^\//,''));
  return `<article class="wb-tint-card ${p.published!==false?'is-published':''}" data-tint-id="${esc(p.id)}">
   <div class="wb-tint-head">
    <div class="wb-tint-brand-group">
     <span class="wb-tint-brand-pill ${isXpel?'is-xpel':'is-3m'}">${esc(p.brand)}</span>
     <input type="text" class="wb-tint-name-input" data-tint-field="name" data-tint-id="${esc(p.id)}" value="${esc(p.name)}" aria-label="Package name">
    </div>
    <label class="check-field"><input type="checkbox" data-tint-publish="${esc(p.id)}" ${p.published!==false?'checked':''}> <strong>Active</strong></label>
   </div>
   <div class="wb-tint-prices">
    ${cats.map(cat=>`<label class="field"><span>${cat} (RM)</span><input type="number" min="0" step="50" data-tint-price="${cat}" data-tint-id="${esc(p.id)}" value="${esc(p.prices?.[cat]??'')}"></label>`).join('')}
   </div>
   ${!isXpel?`<div class="wb-tint-specs-grid">
    <label class="field"><span>Film Options / Code</span><input type="text" data-tint-field="code" data-tint-id="${esc(p.id)}" value="${esc(p.code||'')}"></label>
    <label class="field"><span>Warranty</span><input type="text" data-tint-field="warranty" data-tint-id="${esc(p.id)}" value="${esc(p.warranty||'5 YEARS')}"></label>
    <label class="field"><span>VLT</span><input type="text" data-tint-field="vlt" data-tint-id="${esc(p.id)}" value="${esc(p.vlt||'')}"></label>
    <label class="field"><span>IRR</span><input type="text" data-tint-field="irr" data-tint-id="${esc(p.id)}" value="${esc(p.irr||'')}"></label>
    <label class="field"><span>TSER</span><input type="text" data-tint-field="tser" data-tint-id="${esc(p.id)}" value="${esc(p.tser||'')}"></label>
    <label class="field"><span>UVR</span><input type="text" data-tint-field="uvr" data-tint-id="${esc(p.id)}" value="${esc(p.uvr||'99%')}"></label>
   </div>`:`<div class="wb-tint-xpel-meta">
    ${imgSrc?`<img src="${esc(imgSrc)}" alt="${esc(p.name)}" class="wb-tint-thumb" loading="lazy">`:''}
    <span>XPEL 4-category pricing (Standard, Large, SUV, MPV) · Shown with supplied XPEL package artwork on the Services page.</span>
   </div>`}
   <div class="wb-tint-foot">
    <small>Edits save to your cloud draft. Use Save and go live to update this package.</small>
    <button type="button" class="text-button danger-text" data-tint-delete="${esc(p.id)}">Remove</button>
   </div>
  </article>`;
 };
 return `<div class="wb-hook-bar">
   <div class="wb-hook-copy">
    <span class="wb-hook-eyebrow">WINDOW TINTING · XPEL &amp; 3M PRICE SHEET MANAGER</span>
    <strong>${xpel.filter(p=>p.published!==false).length} XPEL packages · ${threeM.filter(p=>p.published!==false).length} 3M packages active on the public Services &amp; Tinted page</strong>
   </div>
   <div class="wb-hook-actions">
    <a class="button small quiet" href="${base}services/?local-preview=1">Preview Services page ↗</a>
    <button type="button" class="button small quiet" data-action="reset-tint">Reset default prices</button>
   </div>
  </div>
  <section class="wb-panel" style="padding:23px;margin-bottom:20px">
   <div class="wb-section-head" style="padding:0 0 18px">
    <div>
     <p class="eyebrow">01 · XPEL WINDOW TINT PACKAGES (${xpel.length})</p>
     <h2>XPEL packages &amp; 4-tier vehicle pricing</h2>
     <p>Edit Standard, Large, SUV, and MPV prices (RM) directly below. Changes save automatically.</p>
    </div>
    <button type="button" class="button small" data-action="add-xpel">${icon('plus')} Add XPEL package</button>
   </div>
   <div class="wb-tint-grid">${xpel.map(renderPkgCard).join('')}</div>
  </section>
  <section class="wb-panel" style="padding:23px">
   <div class="wb-section-head" style="padding:0 0 18px">
    <div>
     <p class="eyebrow">02 · 3M WINDOW FILM PACKAGES (${threeM.length})</p>
     <h2>3M packages, specifications &amp; 3-tier pricing</h2>
     <p>Edit Standard, SUV, and MPV prices (RM) as well as film codes, VLT, IRR, TSER, UVR, and warranty details.</p>
    </div>
    <button type="button" class="button small" data-action="add-3m">${icon('plus')} Add 3M package</button>
   </div>
   <div class="wb-tint-grid">${threeM.map(renderPkgCard).join('')}</div>
  </section>`;
}
function brandFilterSettingsMarkup(){
 const makes=inventoryBrands(doc.vehicles),manual=doc.homepage.brandFilterMode==='manual';
 const selected=new Set(manual||doc.homepage.brandFilters.length?doc.homepage.brandFilters:visibleBrandFilters(doc));
 return `<section class="wb-brand-settings" aria-labelledby="brandFilterSettingsTitle"><div class="wb-brand-settings-heading"><h3 id="brandFilterSettingsTitle">Homepage brand buttons · 首页品牌按钮</h3><p>Brand buttons sit beside All stock / Available / Booked / Sold. Removing a button never deletes cars or their sold history.</p></div><label class="field">Display mode · 显示方式<select name="brandFilterMode" id="brandFilterMode"><option value="auto" ${!manual?'selected':''}>Automatic: brands with available or booked cars · 自动显示有库存的品牌</option><option value="manual" ${manual?'selected':''}>Manual: choose brands below · 手动选择品牌</option></select></label><p class="wb-brand-hint">Automatic mode removes sold-out brands from the buttons. Sold still shows every published sold car. 手动隐藏品牌，不会影响 Sold 内的车辆。</p><fieldset id="brandFilterChoices" ${manual?'':'hidden'}><legend>Choose buttons to show · 勾选首页要显示的品牌</legend><div class="wb-brand-options">${makes.map(make=>{const active=doc.vehicles.filter(v=>v.make===make&&['available','reserved'].includes(v.status)).length,sold=doc.vehicles.filter(v=>v.make===make&&v.status==='sold').length;return `<label><input type="checkbox" name="brandFilters" value="${esc(make)}" ${selected.has(make)?'checked':''}><span><strong>${esc(make)}</strong><small>${active} in stock · ${sold} sold</small></span></label>`;}).join('')||'<p>Add a vehicle and enter its brand first. Brands appear here automatically.</p>'}</div></fieldset><p class="wb-brand-hint">Add a vehicle with a new brand to add it to this list. Choose Manual to hide individual buttons; leave all unchecked to hide the entire brand row. 新增车辆时填写品牌，这里就会出现。</p><button class="button small" type="submit">Save brand buttons · 保存品牌显示</button></section>`;
}
function themeSettingsMarkup(){return '<section class="wb-theme-settings"><h3>Appearance</h3><p>Theme choices follow you between the showroom, login and workbench. The system preference is used until you choose Day or Night.</p>'+themeButtonMarkup()+'</section>';}

function settings(){
 return `<form id="settingsForm">
 <details class="wb-panel form-section settings-group" open>
  <summary><span class="form-section-title"><span>01</span><span><strong>Brand &amp; Contact (Danny’s Profile &amp; Locations)</strong><small>Appears in the showroom header, About Danny section, and WhatsApp enquiry links.</small></span></span></summary>
  <div class="form-grid">${[['Name','name'],['WhatsApp (country code, digits only)','phone'],['Email','email'],['Full business / showroom address','location'],['TikTok URL','tiktok'],['Facebook URL','facebook'],['小红书 URL','rednote']].map(([name,key])=>`<label class="field">${name}<input name="${key}" value="${esc(doc.profile[key])}" ${key==='phone'?'pattern="[0-9]{8,15}" required':''} ${key==='email'?'type="email"':''}></label>`).join('')}<label class="field">Showroom locations (one per line)<textarea name="locations">${esc((doc.profile.locations||['Glenmarie','Bukit Jelutong']).join('\n'))}</textarea></label><label class="field">Intro<textarea name="intro">${esc(doc.profile.intro)}</textarea></label></div>
  <div style="margin-top:16px"><button class="button" type="submit">Save Brand &amp; Showroom Settings</button></div>
 </details>
 <details class="wb-panel form-section settings-group" open>
  <summary><span class="form-section-title"><span>02</span><span><strong>Showroom Display &amp; Calculator Defaults</strong><small>Control RS/RF/LOW KM card badges, sold vehicle visibility, and default loan calculator rates.</small></span></span></summary>
  <div class="form-grid">${[['Example annual rate (%)','rate',0,30],['Tenure (years)','tenure',1,9],['Down payment (%)','downPayment',0,100]].map(([name,key,min,max])=>`<label class="field">${name}${key==='tenure'?`<select name="tenure">${[5,7,9].map(year=>`<option value="${year}" ${doc.finance.tenure===year?'selected':''}>${year}</option>`).join('')}</select>`:`<input name="${key}" type="number" min="${min}" max="${max}" step="${key==='rate'?'any':'5'}" value="${doc.finance[key]}" required>`}</label>`).join('')}</div>
  <div class="settings-checks">
   <label class="check-field"><input type="checkbox" name="hideAvailableBadge" ${doc.homepage.hideAvailableBadge!==false?'checked':''}> <strong>Replace generic “Available” card badge with RS / RF / Trim &amp; LOW KM badges</strong></label>
   <label class="check-field"><input type="checkbox" name="autoLowKmBadge" ${doc.homepage.autoLowKmBadge!==false?'checked':''}> <strong>Automatically add “LOW KM” badge</strong> to vehicles with mileage under 25,000 km</label>
   <label class="check-field"><input type="checkbox" name="showSoldVehicles" ${doc.homepage.showSoldVehicles?'checked':''}> Show sold vehicles in the public showroom</label>
  </div>
  ${themeSettingsMarkup()}
  ${brandFilterSettingsMarkup()}
  <button class="button" type="submit">Save settings and go live</button>
 </details>
 </form>
 <details class="wb-panel form-section settings-group" id="deliveriesGroup">
  <summary><span class="form-section-title"><span>03</span><span><strong>Deliveries (Photos &amp; Videos)</strong><small>Manage customer handover photos and TikTok/Reel videos shown on the homepage (${(doc.stories||[]).filter(s=>s.published).length} active).</small></span></span></summary>
  ${deliveriesMarkup()}
 </details>
 <details class="wb-panel form-section backup-panel settings-group" id="backupGroup" open>
  <summary><span class="form-section-title"><span>04</span><span><strong>Cloudflare Pages &amp; GitHub Pages Export, Backup &amp; Reset</strong><small>Publish your updated vehicles, deliveries, and XPEL/3M tint packages to Cloudflare Pages or GitHub Pages.</small></span></span></summary>
  <div class="backup-explainer-grid">
   <div class="backup-explainer-item"><strong>1. Export Site Update ZIP (Cloudflare &amp; GitHub)</strong><p>Packages <code>data/public-site.json</code>, <code>data/inventory-workbench.json</code>, and all new <code>public/assets/uploads/*</code> photos. Commit to your repo to deploy automatically on Cloudflare Pages or GitHub Pages.</p></div>
   <div class="backup-explainer-item"><strong>2. Download / Restore JSON backup</strong><p>Saves or restores the complete inventory, deliveries, and XPEL/3M services JSON in this browser.</p></div>
   <div class="backup-explainer-item"><strong>3. Reset to website stock</strong><p>Clears local edits in this browser and reloads the currently published website snapshot.</p></div>
  </div>
  <div class="actions">
   <button type="button" class="button" data-action="export">Export site update ZIP</button>
   <button type="button" class="button quiet" data-action="json">Download public-site.json</button>
   <label class="button quiet">Restore JSON backup<input id="restoreBackup" type="file" accept=".json" hidden></label>
   <button type="button" class="button quiet danger-text" data-action="reset">Reset to website stock</button>
  </div>
 </details>`;
}
function captureForm(){const form=$('#vehicleForm');if(!form)return;const data=new FormData(form);for(const [key,value] of data){if(['features','presenterUrl','presenterFacebook','gradeVerified','isFeatured','conditionExample','specialBadgeTag','lowKm'].includes(key))continue;editing[key]=['manufactureYear','priceRm','mileageKm','engineCc','registrationYear'].includes(key)?value===''?null:Number(value):String(value).trim();}editing.conditionExample=data.has('conditionExample');editing.gradeVerified=data.has('gradeVerified');editing.isFeatured=data.has('isFeatured');editing.lowKm=data.has('lowKm');editing.specialBadges=data.getAll('specialBadgeTag').map(v=>String(v).trim()).filter(Boolean);editing.features=String(data.get('features')||'').split('\n').map(v=>v.trim()).filter(Boolean);editing.presenter={...editing.presenter,url:String(data.get('presenterUrl')||''),facebook:String(data.get('presenterFacebook')||'')};editing.coverImageUrl=editing.gallery[0]?.url||'';editing=normalizeVehicle(editing);}
async function saveVehicle(asDraft){if(busy)return;captureForm();if(asDraft)editing.status='draft';const errors=vehicleIssues(editing);if(doc.vehicles.some(v=>v.id!==editing.id&&v.stockId.toLowerCase()===editing.stockId.toLowerCase()))errors.push('Stock ID already exists. Choose a unique ID.');if(editing.presenter?.url&&!/^https:\/\/(www\.)?tiktok.com\/@[\w.-]+\/video\/\d+(\?.*)?$/.test(editing.presenter.url))errors.push('Use a TikTok video URL for Danny’s explanation.');if(editing.presenter?.facebook&&!/^https:\/\/(www\.)?facebook.com\/reel\/\d+\/?$/.test(editing.presenter.facebook))errors.push('Use a Facebook Reel URL for the fallback.');if(errors.length){$('#editorError').textContent=errors.join(' ');toast(errors[0],true);return;}const targetId=editing.id,controls=[...document.querySelectorAll('#vehicleForm input,#vehicleForm select,#vehicleForm textarea,#vehicleForm button,[data-nav]')].map(el=>[el,el.disabled]);busy=true;controls.forEach(([el])=>el.disabled=true);const before=structuredClone(doc);const i=doc.vehicles.findIndex(v=>v.id===editing.id);if(i<0)doc.vehicles.push(structuredClone(editing));else doc.vehicles[i]=structuredClone(editing);try{await persist();if(!asDraft)await publishItem({collection:'vehicles',id:targetId});else toast('Vehicle draft saved.');editorDirty=false;busy=false;activate('inventory');}catch(e){doc=before;toast(e.message,true);}finally{busy=false;controls.forEach(([el,disabled])=>el.disabled=disabled);}}
async function upload(files,replaceIndex){if(busy)return;captureForm();if(files.length>30)return toast('Choose up to 30 photos at once.',true);if(replaceIndex==null&&editing.gallery.length+files.length>60)return toast('A car can have up to 60 photos.',true);busy=true;const target=editing,progress=$('#uploadProgress');document.querySelectorAll('[data-nav],#openPreview,#exportUpdate,#saveVehicle,[data-action],#vehicleForm input,#vehicleForm select,#vehicleForm textarea').forEach(el=>el.disabled=true);progress.innerHTML=[...files].map((f,i)=>`<label>${esc(f.name)} <progress id="progress${i}" max="100" value="0"></progress><span id="progressText${i}">Waiting</span></label>`).join('');let uploaded=0;try{for(const [i,file] of [...files].entries()){const text=$('#progressText'+i);text.textContent='Resizing…';$('#progress'+i).value=20;const blob=await compressPhoto(file);$('#progress'+i).value=70;const url=cloudReady?await uploadCloudMedia(blob):'/assets/uploads/'+crypto.randomUUID()+'.webp';await writeLocal(url,blob);const media={id:crypto.randomUUID(),url,visible:true,category:'Photo',ratio:'16/10'};if(replaceIndex!=null)target.gallery[replaceIndex]=media;else target.gallery.push(media);$('#progress'+i).value=100;text.textContent='Ready';uploaded++;editorDirty=true;}toast(uploaded+' photos added. Save the vehicle to keep this gallery.');}catch(e){toast(e.message,true);}finally{busy=false;editing.coverImageUrl=editing.gallery[0]?.url||'';document.querySelectorAll('[data-nav],#openPreview,#exportUpdate').forEach(el=>el.disabled=false);render();}}
async function uploadStoryPhoto(storyId,file){
 if(!file||busy)return;
 const story=(doc.stories||[]).find(s=>s.id===storyId);
 if(!story)return;
 busy=true;
 try{
  const blob=await compressPhoto(file);
  const url=cloudReady?await uploadCloudMedia(blob):'/assets/uploads/story-'+crypto.randomUUID()+'.webp';
  await writeLocal(url,blob);
  story.image=url;
  await persist();
  toast(cloudReady?'Delivery photo saved to your cloud draft. Publish when ready.':'Delivery photo saved in this browser. Reconnect before publishing.');
 }catch(e){toast(e.message,true);}
 finally{busy=false;render();}
}
function render(){syncStatusBanner();content.innerHTML=view==='overview'?overviewMarkup():view==='media'?mediaLibraryMarkup():view==='homepage'?homepageEditorMarkup():view==='tools'?toolsSettingsMarkup():view==='advanced'?advancedMarkup():view==='inventory'?inventory():view==='edit'?editor():view==='services'?servicesMarkup():view==='deliveries'?deliveriesView():settings();hydrateImages();bind();bindOwnerExtras();if(view==='overview')loadVisitorStats();}
function bind(){
 if($('#workbenchThemeSelect'))$('#workbenchThemeSelect').onchange=e=>saveWorkbenchTheme(e.target.value);
 if($('#brandFilterMode'))$('#brandFilterMode').onchange=event=>{$('#brandFilterChoices').hidden=event.target.value!=='manual';};
 if($('#vehicleForm'))$('#vehicleForm').oninput=event=>{editorDirty=true;if(['auctionGrade','interiorGrade','auctionHouse','gradeVerified'].includes(event.target.name)){editing.conditionExample=false;$('#vehicleForm input[name=conditionExample]').checked=false;}};
 const search=$('#stockSearch');if(search)search.oninput=()=>{query=search.value;const start=search.selectionStart;render();const next=$('#stockSearch');next.focus();next.setSelectionRange(start,start);};
 for(const [id,setter] of [['makeFilter',v=>make=v],['yearFilter',v=>year=v],['stockSort',v=>sort=v],['statusSelectFilter',v=>{filter=v;issueFilter='';}],['issueSelectFilter',v=>issueFilter=v]]){const node=$('#'+id);if(node)node.onchange=()=>{setter(node.value);render();};}
 document.querySelectorAll('[data-status-filter]').forEach(b=>b.onclick=()=>{filter=filter===b.dataset.statusFilter?'all':b.dataset.statusFilter;issueFilter='';selection.clear();render();});
 document.querySelectorAll('[data-edit],[data-photos]').forEach(b=>b.onclick=()=>openVehicleEditor(b.dataset.edit||b.dataset.photos,Boolean(b.dataset.photos)));
 document.querySelectorAll('[data-select]').forEach(b=>b.onchange=()=>{if(b.checked)selection.add(b.dataset.select);else selection.delete(b.dataset.select);render();});
 if($('#selectAll'))$('#selectAll').onchange=e=>{document.querySelectorAll('[data-select]').forEach(b=>e.target.checked?selection.add(b.dataset.select):selection.delete(b.dataset.select));render();};
 document.querySelectorAll('[data-status]').forEach(select=>select.onchange=()=>changeVehicleStatus(select));
 if($('#bulkStatus'))$('#bulkStatus').onchange=async e=>{const next=e.target.value;if(!next)return;if(!await confirmAction('Update '+selection.size+' vehicles?','Set the selected cars to '+statusName(next)+' in your local inventory.'))return;const before=structuredClone(doc);for(const v of doc.vehicles)if(selection.has(v.id))v.status=next;try{await persist();selection.clear();render();toast('Selected vehicle statuses updated.');}catch(error){doc=before;toast(error.message,true);}};
 for(const action of ['duplicate','delete'])document.querySelectorAll('[data-'+action+']').forEach(b=>b.onclick=async()=>{const v=doc.vehicles.find(v=>v.id===b.dataset[action]);if(!v)return;if(action==='duplicate'){editing=normalizeVehicle({...v,id:crypto.randomUUID(),stockId:v.stockId+'-COPY',status:'draft'});while(doc.vehicles.some(x=>x.stockId===editing.stockId))editing.stockId+='-COPY';activate('edit');return;}if(!await confirmAction(label(action)+' '+v.stockId+'?','Remove this car from your browser inventory? Export a backup first.'))return;const before=structuredClone(doc);doc.vehicles=doc.vehicles.filter(x=>x.id!==v.id);try{await persist();render();toast('Vehicle removed locally.');}catch(error){doc=before;try{await persist();}catch{}render();toast(error.message,true);}});
 if($('#vehicleForm'))$('#vehicleForm').onsubmit=e=>{e.preventDefault();if(!busy)saveVehicle(false);};
 if($('#chooseAuctionReport'))$('#chooseAuctionReport').onclick=()=>$('#auctionReportFile').click();
 if($('#auctionReportFile'))$('#auctionReportFile').onchange=e=>uploadReport(e.target.files[0]);
 if($('#removeAuctionReport'))$('#removeAuctionReport').onclick=async()=>{if(busy)return;captureForm();if(!await confirmAction('Remove report?','Remove the auction report attached to this vehicle?'))return;editing.auctionReport=null;editorDirty=true;render();};
 if($('#photoFiles'))$('#photoFiles').onchange=e=>upload(e.target.files);
 const drop=$('#photoDrop');if(drop){drop.ondragover=e=>{e.preventDefault();drop.classList.add('dragging');};drop.ondragleave=()=>drop.classList.remove('dragging');drop.ondrop=e=>{e.preventDefault();drop.classList.remove('dragging');upload(e.dataTransfer.files);};}
 document.querySelectorAll('[data-replace]').forEach(b=>b.onchange=()=>upload(b.files,Number(b.dataset.replace)));
 document.querySelectorAll('[data-media-category]').forEach(select=>select.onchange=()=>{captureForm();editing.gallery[Number(select.dataset.mediaCategory)].category=select.value;editorDirty=true;});
 document.querySelectorAll('[data-cover],[data-move],[data-remove]').forEach(b=>b.onclick=async()=>{if(busy)return;captureForm();const index=Number(b.dataset.cover??b.dataset.move??b.dataset.remove);if(b.dataset.remove!=null){if(!await confirmAction('Remove photo?','Remove this photo from the vehicle gallery?'))return;editing.gallery.splice(index,1);}else{const destination=b.dataset.cover!=null?0:index+Number(b.dataset.step);const [photo]=editing.gallery.splice(index,1);editing.gallery.splice(destination,0,photo);}editing.coverImageUrl=editing.gallery[0]?.url||'';editorDirty=true;render();});
 document.querySelectorAll('[data-story-input]').forEach(inp=>inp.onchange=async()=>{const s=(doc.stories||[]).find(x=>x.id===inp.dataset.storyId);if(!s)return;s[inp.dataset.storyInput]=inp.value.trim();s.mediaType=s.videoUrl?'video':'photo';await persist();if(inp.dataset.storyInput==='videoUrl')render();});
 document.querySelectorAll('[data-story-publish]').forEach(chk=>chk.onchange=async()=>{const s=(doc.stories||[]).find(x=>x.id===chk.dataset.storyPublish);if(!s)return;s.published=chk.checked;if(chk.checked)s.consent='approved';await persist();render();toast('Delivery visibility saved to draft. Use Save and go live to update the website.');});
 document.querySelectorAll('[data-story-photo]').forEach(inp=>inp.onchange=e=>uploadStoryPhoto(inp.dataset.storyPhoto,e.target.files[0]));
 document.querySelectorAll('[data-story-move]').forEach(b=>b.onclick=async()=>{const i=Number(b.dataset.storyMove),dest=i+Number(b.dataset.step);if(dest<0||dest>=doc.stories.length)return;const [item]=doc.stories.splice(i,1);doc.stories.splice(dest,0,item);await persist();render();});
 document.querySelectorAll('[data-story-delete]').forEach(b=>b.onclick=async()=>{const s=(doc.stories||[]).find(x=>x.id===b.dataset.storyDelete);if(!s||!await confirmAction('Remove delivery moment?','Delete “'+(s.title||'this delivery')+'” from Deliveries?'))return;doc.stories=doc.stories.filter(x=>x.id!==s.id);await persist();render();toast('Delivery moment removed.');});
 document.querySelectorAll('[data-tint-price]').forEach(inp=>inp.onchange=async()=>{const p=(doc.tintPackages||[]).find(x=>x.id===inp.dataset.tintId);if(!p)return;const val=number(inp.value);if(val==null||val<0)return toast('Enter a valid price in RM.',true);p.prices=p.prices||{};p.prices[inp.dataset.tintPrice]=val;await persist();toast(`${p.brand} ${p.name} (${inp.dataset.tintPrice}) updated to RM ${val.toLocaleString('en-MY')}.`);});
 document.querySelectorAll('[data-tint-field]').forEach(inp=>inp.onchange=async()=>{const p=(doc.tintPackages||[]).find(x=>x.id===inp.dataset.tintId);if(!p)return;p[inp.dataset.tintField]=inp.value.trim();await persist();toast(`${p.brand} ${p.name} updated.`);});
 document.querySelectorAll('[data-tint-publish]').forEach(chk=>chk.onchange=async()=>{const p=(doc.tintPackages||[]).find(x=>x.id===chk.dataset.tintPublish);if(!p)return;p.published=chk.checked;await persist();render();toast(chk.checked?`${p.brand} ${p.name} active on Services page.`:`${p.brand} ${p.name} hidden from Services page.`);});
 document.querySelectorAll('[data-tint-delete]').forEach(b=>b.onclick=async()=>{const p=(doc.tintPackages||[]).find(x=>x.id===b.dataset.tintDelete);if(!p||!await confirmAction('Remove tint package?',`Delete ${p.brand} ${p.name} from Services & Tinted?`))return;doc.tintPackages=doc.tintPackages.filter(x=>x.id!==p.id);await persist();render();toast(`${p.brand} ${p.name} removed.`);});
 document.querySelectorAll('[data-preset]').forEach(b=>b.onclick=()=>{const preset=MODEL_PRESETS.find(p=>p.id===b.dataset.preset);if(!preset)return;captureForm();editing.make=preset.make;editing.model=preset.model;editing.variant=preset.variant;editorDirty=true;render();toast('Model name added. Enter verified specifications from the vehicle documents.');});
 document.querySelectorAll('[data-toggle-feature]').forEach(b=>b.onclick=()=>{
  captureForm();
  const feat=b.dataset.toggleFeature;
  const list=new Set(editing.features||[]);
  if(list.has(feat))list.delete(feat);else list.add(feat);
  editing.features=[...list];
  editorDirty=true;
  render();
 });
 document.querySelectorAll('[data-warranty-preset]').forEach(b=>b.onclick=()=>{
  captureForm();
  editing.warrantyInfo=b.dataset.warrantyPreset;
  editorDirty=true;
  render();
  toast('Warranty field filled.');
 });
 document.querySelectorAll('[data-story-autofill]').forEach(b=>b.onclick=async()=>{
  const s=(doc.stories||[]).find(x=>x.id===b.dataset.storyAutofill);
  if(!s)return;
  const loc=s.date||'Glenmarie, Shah Alam';
  const title=s.title&&s.title!=='New customer handover'?s.title:'Japan Recond Handover';
  s.caption=`${title.replace(/handover/i,'').trim()} handed over to its new owner at ${loc.split('·')[0].trim()} after full pre-delivery inspection and detailing by Danny.`;
  await persist();
  render();
  toast('✨ Handover caption auto-filled.');
 });
 document.querySelectorAll('[data-action]').forEach(b=>b.onclick=()=>runAction(b.dataset.action));
 if($('#settingsForm'))$('#settingsForm').onsubmit=async e=>{e.preventDefault();const values=Object.fromEntries(new FormData(e.target));for(const key of ['tiktok','facebook','rednote'])if(values[key]&&!/^https:\/\//i.test(values[key]))return toast('Social links must start with https://',true);const before=structuredClone(doc);for(const key of ['name','phone','email','location','intro','tiktok','facebook','rednote']){if(['tiktok','facebook','rednote'].includes(key)&&values[key]&&!/^https:\/\//i.test(values[key]))return toast('Social links must start with https://',true);doc.profile[key]=values[key];}doc.profile.locations=String(values.locations).split('\n').map(s=>s.trim()).filter(Boolean);for(const k of ['rate','tenure','downPayment'])doc.finance[k]=Number(values[k]);doc.homepage.brandFilterMode=values.brandFilterMode==='manual'?'manual':'auto';doc.homepage.brandFilters=new FormData(e.target).getAll('brandFilters').map(String);doc.homepage.showSoldVehicles=values.showSoldVehicles==='on';doc.homepage.hideAvailableBadge=values.hideAvailableBadge==='on';doc.homepage.autoLowKmBadge=values.autoLowKmBadge==='on';try{await persist();await publishItem({section:'settings'});}catch(error){doc=before;toast(error.message,true);}};
 if($('#restoreBackup'))$('#restoreBackup').onchange=async e=>{try{const file=e.target.files[0];if(!file)return;if(file.size>8*1024*1024)throw Error('Use a JSON backup under 8 MB.');const value=JSON.parse(await file.text()),restored=normalizeDocument(value.document||value);if(!Array.isArray(value.vehicles||value.document?.vehicles)||restored.vehicles.length>500)throw Error('Choose a valid inventory-workbench.json backup.');for(const v of restored.vehicles)if(vehicleIssues(v).length)throw Error('The backup contains invalid vehicle details.');if(!await confirmAction('Restore inventory?','Replace the inventory saved in this browser with this JSON backup?'))return;doc=restored;await persist();render();toast('Inventory restored. Keep uploaded photos in their matching website folder.');}catch(error){toast(error.message,true);}};
}
async function runAction(action){
 if(busy)return toast('Please wait until the current file operation finishes.');
 if(action==='new')return newVehicle();
 if(action==='auto-stock-id'){captureForm();editing.stockId=generateUniqueStockId(editing.make);editorDirty=true;render();toast(`Generated unique Stock ID: ${editing.stockId}`);return;}
 if(action==='auto-copy'){captureForm();const copy=generateAutoCopy(editing);editing.conditionNotes=copy.conditionNotes;editing.description=copy.description;editorDirty=true;render();toast('✨ Condition notes & showroom description auto-generated!');return;}
 if(action==='smart-complete'){captureForm();if(!editing.stockId)editing.stockId=generateUniqueStockId(editing.make);editing=normalizeVehicle(editing);editorDirty=true;render();toast('Stock ID and formatting updated. Confirm the vehicle specifications and grade from its documents.');return;}
 if(action==='go-deliveries')return activate('deliveries');
 if(action==='go-backup'){activate('settings');const g=$('#backupGroup');if(g){g.open=true;g.scrollIntoView({block:'start'});}return;}
 if(action==='filter-missing-photo'){filter='available';issueFilter=issueFilter==='missing-photo'?'':'missing-photo';return render();}
 if(action==='filter-draft'){filter=filter==='draft'?'all':'draft';issueFilter='';return render();}
 if(action==='filter-example-grade'){filter='available';issueFilter=issueFilter==='example-grade'?'':'example-grade';return render();}
 if(action==='add-story'){doc.stories=doc.stories||[];doc.stories.unshift({id:'delivery-'+crypto.randomUUID().slice(0,8),title:'New customer handover',caption:'A delivery moment shared by Danny.',image:'/assets/customer-stories/1.jpeg',videoUrl:'',mediaType:'photo',consent:'approved',published:true,date:'Glenmarie · Handover',vehicleId:''});await persist();render();const g=$('#deliveriesGroup');if(g)g.open=true;toast('New delivery added. Upload a photo or paste a video link.');return;}
 if(action==='add-xpel'){doc.tintPackages=doc.tintPackages||[];doc.tintPackages.push(normalizeTintPackage({id:'xpel-'+crypto.randomUUID().slice(0,6),brand:'XPEL',name:'New XPEL Package',prices:{Standard:2200,Large:2400,SUV:2600,MPV:2800},image:'assets/tint/xpel-titan.jpeg',published:true}));await persist();render();toast('New XPEL package added.');return;}
 if(action==='add-3m'){doc.tintPackages=doc.tintPackages||[];doc.tintPackages.push(normalizeTintPackage({id:'3m-'+crypto.randomUUID().slice(0,6),brand:'3M',name:'New 3M Series',code:'3M Custom Series',vlt:'50, 35, 20%',irr:'90%',tser:'58%',uvr:'99%',thickness:'2 MIL',warranty:'5 YEARS',prices:{Standard:2800,SUV:3000,MPV:3200},image:'assets/tint/3m-tint-packages.jpg',published:true}));await persist();render();toast('New 3M package added.');return;}
 if(action==='reset-tint'){if(!await confirmAction('Reset XPEL & 3M prices?','Restore the default supplied XPEL (6 packages) and 3M (4 packages) price sheets?'))return;doc.tintPackages=defaultTintPackages.map(normalizeTintPackage);await persist();render();toast('Default XPEL & 3M prices restored.');return;}
 if(action==='back'){if(editorDirty&&!await confirmAction('Leave unsaved changes?','Save this vehicle first to keep your edits. Leave the editor anyway?'))return;return activate('inventory');}
 if(action==='toggle-filters'){moreFilters=!moreFilters;return render();}
 if(action==='toggle-view'){cards=!cards;return render();}
 if(action==='bulk-clear'){selection.clear();return render();}
 if(action==='reset-filters'){query=make=year='';filter='all';issueFilter='';return render();}
 if(action==='save-draft')return saveVehicle(true);
 if(action==='export')return exportUpdate();
 if(action==='json')return download('public-site.json',new Blob([JSON.stringify({document:publicSnapshot(doc)},null,2)],{type:'application/json'}));
 if(action==='reset'){if(!await confirmAction('Reset browser inventory?','Remove local stock edits and return to the website’s saved inventory? Export your changes first.'))return;await deleteLocal('inventory');await deleteLocal('preview');location.reload();}
 if(action==='preview-card'){captureForm();const sp=vehicleSpecialBadges(editing,doc.homepage),cSrc=staticWbSrc(editing.coverImageUrl);$('#previewContent').innerHTML=`<article class="stock-card"><div class="stock-photo"><img ${cSrc?`src="${esc(cSrc)}" `:''}data-source="${esc(editing.coverImageUrl)}" alt="Vehicle cover"><div class="card-badges">${editing.status!=='available'||doc.homepage.hideAvailableBadge===false?`<span class="badge ${editing.status}">${statusName(editing.status)}</span>`:''}${sp.map(b=>`<span class="badge badge-special">${esc(b)}</span>`).join('')}</div></div><div class="stock-info"><small>${esc(editing.variant)} · ${esc(editing.transmission)}</small><h3>${editing.year||''} ${esc(editing.make+' '+editing.model)}</h3><code>Stock #${esc(editing.stockId)}</code><p>${esc(editing.mileage)} · Grade ${esc(editing.auctionGrade||'not provided')}</p><strong class="stock-price">${money(editing.priceRm)}</strong><p>≈ ${money(estimate(editing,doc.finance))}/mo</p></div></article>`;hydrateImages();$('#cardPreview').showModal();}
}
function publicSnapshot(input){const d=structuredClone(input);d.vehicles=d.vehicles.filter(v=>['available','reserved','sold'].includes(v.status)&&(v.status!=='sold'||d.homepage.showSoldVehicles)).map(v=>{delete v.internalCost;delete v.internalFees;delete v.legacyFeatures;delete v.actualPage;v.gallery=v.gallery.filter(m=>m.visible!==false);v.coverImageUrl=v.gallery.find(m=>!m.video)?.url||'';v.galleryUrls=v.gallery.filter(m=>!m.video).map(m=>m.url);return v;});d.stories=(d.stories||[]).filter(s=>s.published&&s.consent!=='rejected');d.tintPackages=(d.tintPackages||[]).filter(p=>p.published!==false);return d;}
function download(name,blob){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),60000);}
async function exportUpdate(){
 if(!doc||busy)return;
 if(editorDirty)return toast('Save this vehicle before exporting your update.',true);
 busy=true;
 const b=$('#exportUpdate');b.disabled=true;b.textContent='Preparing files…';
 try{
  const files={},nowIso=new Date().toISOString(),snapshot={document:publicSnapshot(doc),revision:Date.now(),updatedAt:nowIso};
  files['data/public-site.json']=strToU8(JSON.stringify(snapshot,null,2));
  files['data/inventory-workbench.json']=strToU8(JSON.stringify({document:doc},null,2));
  files['README-UPDATE.txt']=strToU8('Danny Recond Select — Cloudflare Pages & GitHub Pages Update\n\n1. Extract this ZIP.\n2. For danielong-bit/Car-Recond-Japan, copy the data/ and public/ folders into gemini-site/ (preserving folder names) and commit. This is the active website source folder.\n3. Cloudflare Pages (build command: npm run build:cloudflare, output dir: dist-cloudflare) and GitHub Pages rebuild automatically.\n');
  for(const url of new Set([...doc.vehicles.flatMap(v=>[...v.gallery.map(m=>m.url),v.auctionReport?.url].filter(Boolean)),...(doc.stories||[]).map(s=>s.image),doc.homepage.heroImage].filter(p=>p?.startsWith('/assets/uploads/')))){
   const blob=await readLocal(url);
   if(blob instanceof Blob)files['public'+url]=new Uint8Array(await blob.arrayBuffer());
   else{const response=await fetch(base+url.slice(1));if(!response.ok)throw Error('Missing photo: '+url);files['public'+url]=new Uint8Array(await response.arrayBuffer());}
  }
  download('danny-recond-site-update-'+new Date().toLocaleDateString('en-CA')+'.zip',new Blob([zipSync(files,{level:6})],{type:'application/zip'}));
  draftMeta.exportFingerprint=computeFingerprint(doc);
  draftMeta.exportGeneratedAt=nowIso;
  await writeLocal('inventory',{document:doc,updatedAt:draftMeta.updatedAt||nowIso,exportFingerprint:draftMeta.exportFingerprint,exportGeneratedAt:draftMeta.exportGeneratedAt});
  syncStatusBanner();
  toast('Export ZIP generated for Cloudflare Pages & GitHub Pages.');
 }catch(error){toast('Export failed: '+error.message,true);}
 finally{busy=false;b.disabled=false;b.textContent='Publish options';}
}
$('#exportUpdate').onclick=()=>activate('advanced');$('#exportUpdate').textContent='Publish options';
if($('#exportHelp'))$('#exportHelp').onclick=()=>confirmAction('How publishing works (Local → Export ZIP → Cloudflare / GitHub Pages)','1. Auto-Saved in Browser: All edits to vehicles, XPEL/3M tint packages, and deliveries save immediately in your browser.\n2. Preview Anytime: Click “Preview showroom” to inspect your changes on the website.\n3. Publish to Cloudflare Pages or GitHub Pages: Click “Export site update” to download a ZIP containing data/public-site.json, data/inventory-workbench.json, and public/assets/uploads/*. In Car-Recond-Japan, copy those folders into gemini-site/ and commit to deploy.');
$('#openPreview').onclick=async()=>{if(editorDirty)return toast('Save your current edits before opening a preview.',true);if(busy)return toast('Wait for the photos to finish.');try{await writeLocal('preview',publicSnapshot(doc));location.href=(view==='services'?base+'services/':base)+'?local-preview=1';}catch(error){toast(error.message,true);}};
window.addEventListener('beforeunload',e=>{if(busy||editorDirty){e.preventDefault();e.returnValue='';}});
try{
 let stored;
 try{stored=await readLocal('inventory');}catch{}
 let source=stored?.document;
 if(stored){
  draftMeta={updatedAt:stored.updatedAt||null,exportFingerprint:stored.exportFingerprint||null,exportGeneratedAt:stored.exportGeneratedAt||null};
 }
 if(!source){
  try{
   const response=await fetch(base+'inventory-workbench.json',{cache:'no-store'});
   if(response.ok)source=(await response.json()).document;
  }catch{}
 }
 if(!source)source=window.CMS_DATA;
 if(!source)throw Error('Could not load the website inventory. Refresh to try again.');
 try{const response=await fetch('/api/owner/content',{cache:'no-store',signal:AbortSignal.timeout(6000)});if(response.ok){const remote=await response.json();cloudReady=true;serverRevision=remote.draft?.revision||0;publishedRevision=remote.published?.revision||0;lastPublishedAt=remote.published?.updatedAt||null;pendingDraftChanges=remote.draft?.pendingChanges??serverRevision!==publishedRevision;if(remote.draft?.document)source=remote.draft.document;cloudStatus=!pendingDraftChanges&&serverRevision===publishedRevision?'Website is up to date':'Cloud draft saved';}}catch{}
 doc=normalizeDocument(source);
 applyTheme();initOwnerNavigation();
 syncStatusBanner();
 render();
}catch(error){content.innerHTML=`<section class="wb-panel empty-state"><h2>Inventory could not load</h2><p>${esc(error.message)}</p><button class="button" onclick="location.reload()">Try again</button></section>`;}

async function uploadReport(file){
 if(!file||busy)return;captureForm();const target=editing;busy=true;
 document.querySelectorAll('[data-nav],#openPreview,#exportUpdate,#vehicleForm input,#vehicleForm button,#vehicleForm select,#vehicleForm textarea').forEach(el=>el.disabled=true);
 try{const {blob,extension}=await prepareReportFile(file);
 const url=cloudReady?await uploadCloudMedia(blob):'/assets/uploads/'+crypto.randomUUID()+extension;await writeLocal(url,blob);target.auctionReport={url,name:file.name};target.conditionExample=false;editorDirty=true;toast('Report attached. Save this vehicle before previewing or exporting.');
 }catch(error){toast(error.message,true);}finally{busy=false;document.querySelectorAll('[data-nav],#openPreview,#exportUpdate').forEach(el=>el.disabled=false);render();}
}



if($('#wbThemeToggle'))$('#wbThemeToggle').onclick=()=>{const value=saveWorkbenchTheme(document.documentElement.dataset.theme==='dark'?'light':'dark');const select=$('#workbenchThemeSelect');if(select)select.value=value;};
function initOwnerNavigation(){
 $('#pageHeading').textContent='Overview';
 document.querySelector('.wb-sidebar').outerHTML=ownerSidebarMarkup(base,view);
 bindSidebarToggle();
 bindThemeControls();
 $('#exportUpdate').classList.add('quiet');
 if($('#exportHelp'))$('#exportHelp').textContent='Publishing help';if($('#exportHelp'))$('#exportHelp').onclick=()=>confirmAction('Save, preview, publish','Save keeps your draft in your account. Preview shows your draft in this browser. Publish website updates the public Cloudflare site for every visitor. Advanced Studio contains a downloadable backup and one-version rollback.');
}
function overviewMarkup(){
 const count=status=>doc.vehicles.filter(v=>v.status===status).length;
 const counts={available:count('available'),booked:count('reserved'),sold:count('sold'),drafts:count('draft')};
 window.dannyOwnerCounts=counts;
 const missing=doc.vehicles.filter(v=>v.status==='available'&&!v.coverImageUrl).length;
 const examples=doc.vehicles.filter(v=>v.conditionExample).length;
 const publishedAt=lastPublishedAt?'Last published '+esc(new Date(lastPublishedAt).toLocaleString()):'';

 return `<section class="owner-overview"><div class="owner-overview-heading"><div><h2>Stock at a glance</h2>${publishedAt?`<p class="owner-last-published">${publishedAt}</p>`:''}</div><button class="button quiet" data-owner-nav="inventory">View vehicles →</button></div><div id="ownerCountMount" class="owner-count-mount"><div class="owner-count-grid"><div class="owner-count-card"><span>Available</span><strong>${counts.available}</strong></div><div class="owner-count-card"><span>Booked</span><strong>${counts.booked}</strong></div><div class="owner-count-card"><span>Sold</span><strong>${counts.sold}</strong></div><div class="owner-count-card"><span>Drafts</span><strong>${counts.drafts}</strong></div></div></div><section class="wb-panel owner-visitors"><div class="owner-overview-heading"><div><h3>Website visitors</h3><p>Real visits to your showroom</p></div><button type="button" class="button quiet small" id="refreshVisitorStats">Refresh</button></div><div id="ownerVisitorStats" aria-live="polite">Loading visitor statistics…</div></section><div class="owner-task-grid"><section class="wb-panel"><h3>Your next actions</h3><div class="owner-task-list"><button data-owner-nav="inventory">Manage ${doc.vehicles.length} vehicles <span aria-hidden="true">→</span></button><button data-owner-nav="homepage">Update the homepage photo or headline <span aria-hidden="true">→</span></button><button data-owner-nav="deliveries">Add a customer handover <span aria-hidden="true">→</span></button></div></section><section class="wb-panel"><h3>Before publishing</h3><p>${missing?`${missing} available vehicle(s) need a cover photo.`:'All available vehicles have a cover photo.'}</p><p>${examples?`${examples} vehicles still use example grades. Replace these with verified reports.`:'Grades should match each car’s original report.'}</p><button class="button quiet" data-owner-nav="inventory">Review vehicles</button></section></div></section>`;
}function mediaLibraryMarkup(){return `<section><p class="eyebrow">YOUR VEHICLE PHOTOGRAPHY</p><h2>Media Library</h2><p class="owner-intro">Choose a vehicle to upload, reorder or frame its photographs. Original images stay intact.</p><div class="owner-media-grid">${doc.vehicles.map(v=>`<article>${v.coverImageUrl?`<img data-source="${esc(v.coverImageUrl)}" alt="${esc(v.make+' '+v.model)}">`:'<div class="photo-placeholder">No cover photo</div>'}<p><strong>${esc(v.make+' '+v.model)}</strong><br>${v.gallery.length} photos · ${esc(v.stockId)}</p><button class="button quiet small" data-owner-media="${esc(v.id)}">Manage photos</button></article>`).join('')}</div></section>`;}
function homepageEditorMarkup(){return `<form id="ownerHomepageForm" class="wb-panel" style="padding:24px"><p class="eyebrow">HOMEPAGE EDITOR</p><h2>Let the cars lead.</h2><p class="owner-intro">Edit the content inside a designed layout. Save a draft, preview it, then publish.</p><img class="owner-home-preview" data-source="${esc(doc.homepage.heroImage||'/assets/mountain-retreat-hero.png')}" alt="Homepage banner preview"><label class="button quiet" style="margin-top:14px">Replace banner photo<input id="ownerHeroFile" type="file" accept="image/jpeg,image/png,image/webp" hidden></label><div class="form-grid">${[['en','English headline','Japanese recond cars. Selected by Danny.'],['zh','中文标题','日本进口车，Danny 为你精选。'],['ms','Tajuk Bahasa Melayu','Kereta recond Jepun. Pilihan Danny.']].map(([key,name,fallback])=>`<label class="field">${name}<input name="hero-${key}" value="${esc(doc.homepage.heroTitles?.[key]||fallback)}" maxlength="120"></label>`).join('')}<label class="field">Layout<select name="layout"><option value="showroom" ${doc.homepage.layout!=='compact'?'selected':''}>Showroom — large car photograph</option><option value="compact" ${doc.homepage.layout==='compact'?'selected':''}>Compact — shorter introduction</option></select></label><label class="field">Section order<select name="sectionOrder"><option value="inventory-first">Vehicles, deliveries, contact</option><option value="deliveries-first" ${doc.homepage.sectionOrder==='deliveries-first'?'selected':''}>Deliveries, vehicles, contact</option></select></label></div><div class="owner-section-tabs"><label><input type="checkbox" name="showDeliveries" ${doc.homepage.showDeliveries!==false?'checked':''}> Show deliveries</label><label><input type="checkbox" name="showContact" ${doc.homepage.showContact!==false?'checked':''}> Show contact section</label></div><h3>Featured vehicles</h3><div class="owner-section-tabs">${doc.vehicles.filter(v=>v.status==='available').map(v=>`<label><input type="checkbox" name="featured" value="${esc(v.id)}" ${v.featured?'checked':''}> ${esc(v.make+' '+v.model)}</label>`).join('')}</div><button class="button" type="submit">Save and go live</button><button class="button quiet" type="submit" name="draftOnly" value="yes">Save draft</button><button class="button quiet" type="button" data-owner-preview>Preview website</button><p class="owner-intro">Use your browser’s device preview to review the desktop and mobile layout before publishing.</p></form>`;}
function toolsSettingsMarkup(){return `<section class="wb-panel" style="padding:24px"><p class="eyebrow">BUYING TOOLS</p><h2>Calculator & JPJ</h2><p>Loan assumptions are editable in Website Settings. JPJ rate tables stay linked to the official reference, rather than allowing accidental changes.</p><div class="owner-section-tabs"><button class="button" data-owner-nav="settings">Edit loan assumptions</button><a class="button quiet" href="${base}tools/" target="_blank" rel="noopener">Open customer tools ↗</a></div><p>Default annual rate: ${Number(doc.finance.rate)}% · Deposit: ${Number(doc.finance.downPayment)}% · Tenure: ${Number(doc.finance.tenure)} years</p><p>Road tax supports petrol/diesel private saloon and non-saloon codes AB / AC / AD / AE in Peninsular Malaysia. EVs, East Malaysia and other classes need the applicable JPJ schedule.</p></section>`;}
function advancedMarkup(){return `<section class="wb-panel" style="padding:24px"><p class="eyebrow">ADVANCED STUDIO</p><h2>Backups & recovery</h2><p>Everyday editing lives in Vehicles, Homepage and Deliveries. Keep a backup before making major changes.</p><div class="owner-section-tabs"><button class="button" id="ownerPublishAll">Review &amp; publish all drafts</button><button class="button quiet" id="ownerBackup">Download site backup</button><button class="button quiet" id="ownerRollback">Restore previous publication</button><button class="button quiet" data-owner-nav="settings">Imports & advanced settings</button></div><p>Rollback restores the immediately previous publication. It is only available after at least two successful publications.</p></section>`;}
async function publishWebsite(){
 if(busy||!doc)return;if(editorDirty)return toast('Save your current edits before publishing.',true);if(!cloudReady)return toast('Publishing is unavailable. Your local copy remains saved; reconnect and reload.',true);
 if(!await confirmAction('Publish website?','Your saved vehicles, homepage content, tint packages and approved delivery photographs will become visible to customers.'))return;
 busy=true;const b=$('#exportUpdate');b.disabled=true;b.textContent='Publishing…';
 try{const response=await fetch('/api/owner/publish',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({document:doc,baseRevision:serverRevision})});const result=await response.json();if(!response.ok)throw Error(result.error||'Publishing failed.');serverRevision=publishedRevision=result.revision;pendingDraftChanges=false;lastPublishedAt=result.updatedAt;cloudStatus='Website published';syncStatusBanner();toast('Website published. Your changes are now live.');}catch(e){toast(e.message,true);}finally{busy=false;b.disabled=false;b.textContent='Publish options';}
}
function bindOwnerExtras(){
 if(view==='settings')document.querySelector('#deliveriesGroup')?.remove();
 enhanceLanguageControls();
 document.querySelectorAll('[data-live-story]').forEach(b=>b.onclick=()=>saveCurrentItem(b,{collection:'stories',id:b.dataset.liveStory}));
 document.querySelectorAll('.wb-tint-card').forEach(card=>{const b=document.createElement('button');b.type='button';b.className='button';b.textContent='Save and go live';b.onclick=()=>saveCurrentItem(b,{collection:'tintPackages',id:card.dataset.tintId});card.append(b);});
 document.querySelectorAll('.wb-story-card').forEach(item=>item.addEventListener('toggle',()=>{if(item.open)document.querySelectorAll('.wb-story-card').forEach(other=>{if(other!==item)other.open=false;});}));
 document.querySelectorAll('[data-nav],[data-owner-nav]').forEach(b=>b.onclick=async()=>{if(busy)return;if(editorDirty&&!await confirmAction('Leave unsaved changes?','Save this vehicle to keep your edits. Leave anyway?'))return;const next=b.dataset.ownerNav||b.dataset.nav;if(next==='edit')newVehicle();else activate(next);});
 document.querySelectorAll('[data-owner-media]').forEach(b=>b.onclick=()=>{editing=structuredClone(doc.vehicles.find(v=>v.id===b.dataset.ownerMedia));activate('edit');$('#photosSection')?.scrollIntoView({block:'start'});});
 if($('#ownerPublishAll'))$('#ownerPublishAll').onclick=publishWebsite;
 if($('#ownerBackup'))$('#ownerBackup').onclick=exportUpdate;
 if($('#ownerRollback'))$('#ownerRollback').onclick=async()=>{if(!cloudReady||!await confirmAction('Restore previous publication?','This replaces the current live website with its previous saved publication.'))return;try{const response=await fetch('/api/owner/rollback',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({baseRevision:serverRevision})});const result=await response.json();if(!response.ok)throw Error(result.error);location.reload();}catch(e){toast(e.message,true);}};
 if($('#ownerHomepageForm'))$('#ownerHomepageForm').oninput=()=>{editorDirty=true;};
 if($('#ownerHomepageForm'))$('#ownerHomepageForm').onsubmit=async e=>{e.preventDefault();const values=new FormData(e.target);doc.homepage.heroTitles=Object.fromEntries(['en','zh','ms'].map(k=>[k,String(values.get('hero-'+k)||'').trim()]));doc.homepage.layout=values.get('layout');doc.homepage.sectionOrder=values.get('sectionOrder');doc.homepage.showDeliveries=values.has('showDeliveries');doc.homepage.showContact=values.has('showContact');const featured=new Set(values.getAll('featured'));doc.vehicles.forEach(v=>v.featured=v.isFeatured=featured.has(v.id));try{await persist();if(e.submitter?.name!=='draftOnly')await publishItem({section:'homepage'});else toast('Homepage draft saved.');editorDirty=false;}catch(e){toast(e.message,true);}};
 if($('#ownerHeroFile'))$('#ownerHeroFile').onchange=async e=>{const file=e.target.files[0];if(!file)return;const form=new FormData($('#ownerHomepageForm'));doc.homepage.heroTitles=Object.fromEntries(['en','zh','ms'].map(k=>[k,String(form.get('hero-'+k)||'')]));doc.homepage.layout=form.get('layout');doc.homepage.sectionOrder=form.get('sectionOrder');try{const blob=await compressPhoto(file);doc.homepage.heroImage=cloudReady?await uploadCloudMedia(blob):'/assets/uploads/'+crypto.randomUUID()+'.webp';await writeLocal(doc.homepage.heroImage,blob);await persist();editorDirty=false;render();toast('Banner photo saved to draft.');}catch(e){toast(e.message,true);}};
 document.querySelectorAll('[data-owner-preview]').forEach(b=>b.onclick=()=>$('#openPreview').click());
 const helper=document.querySelector('.wb-autofill-bar');if(helper&&!helper.parentElement.classList.contains('owner-helpers')){helper.querySelectorAll('p').forEach(p=>p.textContent='Model templates assist naming only. Enter specifications, equipment, grade and warranty from the vehicle documents.');const wrapper=document.createElement('details');wrapper.className='owner-helpers';wrapper.innerHTML='<summary>Optional model naming helpers</summary>';helper.before(wrapper);wrapper.append(helper);}
 const tiles=[...document.querySelectorAll('.photo-editor-grid .photo-tile')];let dragged=null;
 tiles.forEach((tile,i)=>{tile.draggable=true;tile.setAttribute('aria-label',`Photo ${i+1}. Drag to reorder or use arrow buttons.`);tile.ondragstart=e=>{if(e.target.closest('input,select,button')){e.preventDefault();return;}dragged=i;e.dataTransfer.setData('text/plain',String(i));};tile.ondragover=e=>{e.preventDefault();tile.classList.add('drag-over');};tile.ondragleave=()=>tile.classList.remove('drag-over');tile.ondrop=e=>{e.preventDefault();if(dragged==null||dragged===i)return;captureForm();const [photo]=editing.gallery.splice(dragged,1);editing.gallery.splice(i,0,photo);editing.coverImageUrl=editing.gallery[0]?.url||'';editorDirty=true;render();};
  const m=editing.gallery[i],img=tile.querySelector('img');img.style.objectPosition=`${m.cropX??50}% ${m.cropY??50}%`;
  tile.insertAdjacentHTML('beforeend',`<label class="crop-controls">Frame X<input type="range" min="0" max="100" value="${m.cropX??50}" data-crop="${i}" data-axis="cropX" aria-label="Photo ${i+1} horizontal framing"></label><label class="crop-controls">Frame Y<input type="range" min="0" max="100" value="${m.cropY??50}" data-crop="${i}" data-axis="cropY" aria-label="Photo ${i+1} vertical framing"></label>`);
 });
 document.querySelectorAll('[data-crop]').forEach(input=>input.oninput=()=>{const i=Number(input.dataset.crop),m=editing.gallery[i];m[input.dataset.axis]=Number(input.value);const img=tiles[i].querySelector('img');img.style.objectPosition=`${m.cropX??50}% ${m.cropY??50}%`;editorDirty=true;});
 bindThemeControls();
}
window.addEventListener('unhandledrejection',event=>{if(event.reason?.message){toast(event.reason.message,true);event.preventDefault();}});

async function publishItem(scope){
 if(!cloudReady)throw Error('Not live yet. Reconnect and reload; your draft is kept.');
 await saveQueue;
 const response=await fetch('/api/owner/publish',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({document:doc,baseRevision:serverRevision,scope})});
 const result=await response.json();if(!response.ok)throw Error(result.error||'Not live yet. Try saving again.');
 serverRevision=publishedRevision=result.revision;lastPublishedAt=result.updatedAt;pendingDraftChanges=result.pendingChanges;cloudStatus='Saved and live · '+new Date(result.updatedAt).toLocaleTimeString();syncStatusBanner();toast('Saved and live. View the website to see your update.');
}
async function saveCurrentItem(button,scope){if(busy)return;busy=true;button.disabled=true;try{await persist();await publishItem(scope);}catch(e){toast(e.message,true);}finally{busy=false;button.disabled=false;}}
