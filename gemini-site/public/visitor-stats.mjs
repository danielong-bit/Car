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
 loading.then(value=>{const target=document.getElementById('ownerVisitorStats');if(target)paint(target,value);}).catch(()=>{const target=document.getElementById('ownerVisitorStats');if(target)target.textContent='Visitor statistics will appear when the connected website starts receiving visits.';});
}
function paint(host,data){
 const escape=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
 const country=value=>{try{return new Intl.DisplayNames(['en'],{type:'region'}).of(value)||value;}catch{return value;}};
 const list=(items,regions=false)=>items.length?items.map(item=>`<div class="visitor-breakdown"><span>${escape(regions?country(item.name):item.name)}</span><strong>${Number(item.count).toLocaleString()}</strong></div>`).join(''):'<p>No visits recorded yet.</p>';
 host.innerHTML=`<div class="visitor-totals"><div><span>Visits · last 30 days</span><strong>${data.total.toLocaleString()}</strong></div><div><span>Today · Malaysia time</span><strong>${data.today.toLocaleString()}</strong></div></div><div class="visitor-details"><section><h4>Devices</h4>${list(data.devices)}</section><section><h4>Countries</h4>${list(data.countries,true)}</section></div><p class="visitor-note">Visits are browser sessions, not an exact count of people. Country is approximate. Owner visits are excluded. Tracking starts after this update goes live.</p>`;
}
