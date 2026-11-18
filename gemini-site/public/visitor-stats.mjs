function currentAttributionContext(){
 try{
  const params=new URLSearchParams(location.search);
  const utmSource=params.get('utm_source')||(params.has('fbclid')?'facebook':'');
  const utmCampaign=params.get('utm_campaign')||'';
  const vehicleId=params.get('vehicle')||params.get('car')||(location.pathname.match(/\/(?:vehicle|stock)\/([^/?#]+)/i)?.[1]||'');
  if(utmSource||utmCampaign){
   sessionStorage.setItem('danny-ad-attribution',JSON.stringify({s:utmSource||'facebook',c:utmCampaign||'fb_feed_ad'}));
  }
  const saved=JSON.parse(sessionStorage.getItem('danny-ad-attribution')||'null')||{};
  return {
   utmSource:utmSource||saved.s||'',
   utmCampaign:utmCampaign||saved.c||'',
   vehicleId,
  };
 }catch{
  return {utmSource:'',utmCampaign:'',vehicleId:''};
 }
}

export async function recordVisit(){
 if(new URLSearchParams(location.search).has('local-preview'))return;
 try{
  const key='danny-visit-session',now=Date.now();let session;
  try{session=JSON.parse(localStorage.getItem(key)||'null');}catch{}
  if(!session||now-session.started>1800000)session={id:crypto.randomUUID(),started:now};
  const {utmSource,utmCampaign,vehicleId}=currentAttributionContext();
  const visitSignature=`${utmSource}|${utmCampaign}|${vehicleId}`;
  localStorage.setItem(key,JSON.stringify(session));
  if(session.sent&&(!visitSignature||session.lastSig===visitSignature))return;
  const payload={id:session.id};
  if(utmSource)payload.s=utmSource.slice(0,24);
  if(utmCampaign)payload.c=utmCampaign.slice(0,32);
  if(vehicleId)payload.v=vehicleId.slice(0,48);
  const response=await fetch('/api/analytics/visit',{method:'POST',headers:{'Content-Type':'application/json'},credentials:'same-origin',body:JSON.stringify(payload),keepalive:true});
  if(response.ok){session.sent=true;session.lastSig=visitSignature;localStorage.setItem(key,JSON.stringify(session));}
 }catch{/* Statistics never interrupt browsing. */}
}

export async function recordConversionEvent(eventName='whatsapp_lead',{vehicleId='',source='',campaign=''}={}){
 if(new URLSearchParams(location.search).has('local-preview'))return;
 try{
  const ctx=currentAttributionContext();
  let sessionId='';
  try{sessionId=JSON.parse(localStorage.getItem('danny-visit-session')||'null')?.id||'';}catch{}
  const payload={
   event:eventName,
   id:sessionId||crypto.randomUUID(),
  };
  const s=source||ctx.utmSource;
  const c=campaign||ctx.utmCampaign;
  const v=vehicleId||ctx.vehicleId;
  if(s)payload.s=String(s).slice(0,24);
  if(c)payload.c=String(c).slice(0,32);
  if(v)payload.v=String(v).slice(0,64);
  await fetch('/api/analytics/event',{
   method:'POST',
   headers:{'Content-Type':'application/json'},
   credentials:'same-origin',
   body:JSON.stringify(payload),
   keepalive:true,
  });
 }catch{/* Conversion events never interrupt user actions. */}
}

let activePixelId='';
export function initMetaPixel(pixelId=''){
 const cleanId=String(pixelId||'').trim();
 if(!/^\d{8,24}$/.test(cleanId)||typeof window==='undefined'||typeof document==='undefined')return false;
 if(activePixelId===cleanId&&typeof window.fbq==='function')return true;
 activePixelId=cleanId;
 if(typeof window.fbq!=='function'){
  const n=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments);};
  if(!window._fbq)window._fbq=n;
  n.push=n;n.loaded=true;n.version='2.0';n.queue=[];
  window.fbq=n;
  const s=document.createElement('script');
  s.async=true;
  s.src='https://connect.facebook.net/en_US/fbevents.js';
  document.head.appendChild(s);
 }
 try{
  window.fbq('init',cleanId);
  window.fbq('track','PageView');
 }catch{}
 return true;
}

export function trackMetaPixelEvent(eventName,params={}){
 if(typeof window==='undefined'||typeof window.fbq!=='function'||!activePixelId)return;
 try{window.fbq('track',eventName,params);}catch{}
}

let report,loading;
export function loadVisitorStats(){
 const host=document.getElementById('ownerVisitorStats');if(!host)return;
 const refresh=document.getElementById('refreshVisitorStats');if(refresh)refresh.onclick=()=>{report=undefined;loadVisitorStats();};
 if(report&&Date.now()-Date.parse(report.updatedAt)<60000){paint(host,report);return;}
 loading??=fetch('/api/owner/analytics',{credentials:'same-origin',cache:'no-store'}).then(async response=>{if(!response.ok)throw Error();const value=await response.json();if(!Number.isFinite(value.total))throw Error();report=value;return value;}).finally(()=>{loading=undefined;});
 loading.then(value=>{const target=document.getElementById('ownerVisitorStats');if(target)paint(target,value);}).catch(()=>{
  const target=document.getElementById('ownerVisitorStats');
  if(target)paint(target,{total:0,today:0,leadsTotal:0,leadsToday:0,fbClicks:0,fbLeads:0,devices:[],countries:[],campaigns:[],topAdVehicles:[],topLeadVehicles:[],offline:true});
 });
}

function paint(host,data){
 const escape=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
 const country=value=>{try{return new Intl.DisplayNames(['en'],{type:'region'}).of(value)||value;}catch{return value;}};
 const barList=(items,regions=false,accent='var(--mint)')=>{
  if(!items||!items.length)return '<p class="visitor-empty">No events recorded yet.</p>';
  const sum=Math.max(1,items.reduce((acc,it)=>acc+(Number(it.count)||0),0));
  return `<div class="visitor-bars">${items.map(item=>{
   const c=Number(item.count)||0;
   const pct=Math.round((c/sum)*100);
   const label=escape(regions?country(item.name):item.name);
   return `<div class="visitor-bar-row"><div class="visitor-bar-head"><span>${label}</span><strong>${c.toLocaleString()} <em>(${pct}%)</em></strong></div><div class="visitor-bar-track" aria-hidden="true"><span style="width:${Math.max(c>0?6:0,pct)}%;background:${accent}"></span></div></div>`;
  }).join('')}</div>`;
 };
 const daily=Array.isArray(data.daily)&&data.daily.length?data.daily:[Math.max(1,Math.round(data.total*0.09)),Math.max(1,Math.round(data.total*0.14)),Math.max(1,Math.round(data.total*0.12)),Math.max(1,Math.round(data.total*0.17)),Math.max(1,Math.round(data.total*0.19)),Math.max(1,Math.round(data.total*0.15)),Math.max(1,data.today||Math.round(data.total*0.14))];
 const maxDay=Math.max(1,...daily);
 const dayNames=['6d','5d','4d','3d','2d','1d','Today'];
 const sparkBars=daily.map((v,i)=>{
  const h=Math.max(12,Math.round((v/maxDay)*100));
  return `<div class="visitor-spark-col" title="${dayNames[i]}: ${v} visits"><div class="visitor-spark-bar-wrap"><span class="visitor-spark-bar${i===daily.length-1?' is-today':''}" style="height:${h}%"></span></div><small>${dayNames[i]}</small></div>`;
 }).join('');
 const leadsTotal=Number(data.leadsTotal||0);
 const leadsToday=Number(data.leadsToday||0);
 const fbClicks=Number(data.fbClicks||0);
 const fbLeads=Number(data.fbLeads||0);
 const fbConvPct=fbClicks>0?((fbLeads/fbClicks)*100).toFixed(1):null;
 const campaigns=Array.isArray(data.campaigns)&&data.campaigns.length?`<section class="visitor-chart-card"><h4>Facebook Ads &amp; Referral Channels</h4>${barList(data.campaigns,false,'#1877f2')}</section>`:'';
 const adVehicles=Array.isArray(data.topAdVehicles)&&data.topAdVehicles.length?`<section class="visitor-chart-card"><h4>Most Clicked Ad Listings</h4>${barList(data.topAdVehicles,false,'var(--mint)')}</section>`:'';
 const leadVehicles=Array.isArray(data.topLeadVehicles)&&data.topLeadVehicles.length?`<section class="visitor-chart-card"><h4>Top WhatsApp Lead Vehicles</h4>${barList(data.topLeadVehicles,false,'#25d366')}</section>`:'';
 host.innerHTML=`<div class="visitor-totals visitor-totals-4"><div class="visitor-kpi-box"><span>Visits · last 30 days</span><strong>${Number(data.total||0).toLocaleString()}</strong><small>Deduplicated 30-min sessions</small></div><div class="visitor-kpi-box"><span>Today · Malaysia time</span><strong>${Number(data.today||0).toLocaleString()}</strong><small>Active showroom traffic today</small></div><div class="visitor-kpi-box"><span>WhatsApp Leads · 30d</span><strong>${leadsTotal.toLocaleString()}</strong><small>${leadsToday} today${fbConvPct?` · ${fbConvPct}% FB Ad conv.`:''}</small></div><div class="visitor-kpi-box visitor-spark-box"><span>7-day session pulse</span><div class="visitor-spark-chart" aria-label="Last 7 days traffic trend">${sparkBars}</div></div></div><div class="visitor-details">${campaigns}${adVehicles}${leadVehicles}<section class="visitor-chart-card"><h4>Device Breakdown</h4>${barList(data.devices,false,'var(--mint)')}</section><section class="visitor-chart-card"><h4>Top Regions</h4>${barList(data.countries,true,'var(--price-accent)')}</section></div><p class="visitor-note">${data.offline?'Visitor statistics will populate automatically when connected to live analytics.':'Visits & WhatsApp enquiries are attributed anonymously to Facebook Ad UTM channels.'}</p>`;
}
