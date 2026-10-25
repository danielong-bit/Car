export async function recordVisit(){
 if(new URLSearchParams(location.search).has('local-preview'))return;
 try{
  const key='danny-visit-session',now=Date.now();let session;
  try{session=JSON.parse(localStorage.getItem(key)||'null');}catch{}
  if(!session||now-session.started>1800000)session={id:crypto.randomUUID(),started:now};
  localStorage.setItem(key,JSON.stringify(session));
  if(session.sent)return;
  const response=await fetch('/api/analytics/visit',{method:'POST',headers:{'Content-Type':'application/json'},credentials:'same-origin',body:JSON.stringify({id:session.id}),keepalive:true});
  if(response.ok){session.sent=true;localStorage.setItem(key,JSON.stringify(session));}
 }catch{/* Statistics never interrupt browsing. */}
}
let report,loading;
export function loadVisitorStats(){
 if(window.DANNY_PREVIEW_EDITOR===true){const host=document.getElementById('ownerVisitorStats');if(host)host.textContent='Live visitor statistics are available in the connected Cloudflare dashboard.';return;}
 const host=document.getElementById('ownerVisitorStats');if(!host)return;
 const refresh=document.getElementById('refreshVisitorStats');if(refresh)refresh.onclick=()=>{report=undefined;loadVisitorStats();};
 if(report&&Date.now()-Date.parse(report.updatedAt)<60000){paint(host,report);return;}
 loading??=fetch('/api/owner/analytics',{credentials:'same-origin',cache:'no-store'}).then(async response=>{if(!response.ok)throw Error();const value=await response.json();if(!Number.isFinite(value.total))throw Error();report=value;return value;}).finally(()=>{loading=undefined;});
 loading.then(value=>{const target=document.getElementById('ownerVisitorStats');if(target)paint(target,value);}).catch(()=>{
  const target=document.getElementById('ownerVisitorStats');
  if(target)paint(target,{total:0,today:0,devices:[],countries:[],offline:true});
 });
}
function paint(host,data){
 const escape=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
 const country=value=>{try{return new Intl.DisplayNames(['en'],{type:'region'}).of(value)||value;}catch{return value;}};
 const barList=(items,regions=false,accent='var(--mint)')=>{
  if(!items||!items.length)return '<p class="visitor-empty">No visits recorded yet.</p>';
  const sum=Math.max(1,items.reduce((acc,it)=>acc+(Number(it.count)||0),0));
  return `<div class="visitor-bars">${items.map(item=>{
   const c=Number(item.count)||0;
   const pct=Math.round((c/sum)*100);
   const label=escape(regions?country(item.name):item.name);
   return `<div class="visitor-bar-row"><div class="visitor-bar-head"><span>${label}</span><strong>${c.toLocaleString()} <em>(${pct}%)</em></strong></div><div class="visitor-bar-track" aria-hidden="true"><span style="width:${Math.max(c>0?6:0,pct)}%;background:${accent}"></span></div></div>`;
  }).join('')}</div>`;
 };
 const daily=Array.isArray(data.daily)?data.daily:[];
 const maxDay=Math.max(1,...daily);
 const dayNames=['6d','5d','4d','3d','2d','1d','Today'];
 const sparkBars=daily.map((v,i)=>{
  const h=v>0?Math.max(4,Math.round((v/maxDay)*100)):0;
  return `<div class="visitor-spark-col" title="${dayNames[i]}: ${v} visits"><div class="visitor-spark-bar-wrap"><span class="visitor-spark-bar${i===daily.length-1?' is-today':''}" style="height:${h}%"></span></div><small>${dayNames[i]}</small></div>`;
 }).join('');
 host.innerHTML=`<div class="visitor-totals"><div class="visitor-kpi-box"><span>Visits · last 30 days</span><strong>${Number(data.total||0).toLocaleString()}</strong><small>Deduplicated 30-min browser sessions</small></div><div class="visitor-kpi-box"><span>Today · Malaysia time</span><strong>${Number(data.today||0).toLocaleString()}</strong><small>Active showroom traffic today</small></div><div class="visitor-kpi-box visitor-spark-box"><span>7-day session pulse</span><div class="visitor-spark-chart" aria-label="Last 7 days traffic trend">${sparkBars||'<span class="visitor-empty">Daily traffic is unavailable.</span>'}</div></div></div><div class="visitor-details"><section class="visitor-chart-card"><h4>Device Breakdown</h4>${barList(data.devices,false,'var(--mint)')}</section><section class="visitor-chart-card"><h4>Top Regions</h4>${barList(data.countries,true,'var(--price-accent)')}</section></div><p class="visitor-note">${data.offline?'Visitor statistics will populate automatically when connected to live Cloudflare analytics.':'Visits are browser sessions, not an exact count of people. Country is approximate. Owner visits are excluded.'}</p>`;
}
