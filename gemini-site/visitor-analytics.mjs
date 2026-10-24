// Anonymous visit sessions only. No IP address, user agent or exact location is stored.
export function visitorAnalytics(storage,request,now=Date.now()){
 const sql=storage.sql;
 const respond=(value,status=200)=>new Response(JSON.stringify(value),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
 if(!sql)return respond({error:'Visitor statistics are unavailable.'},503);
 sql.exec('CREATE TABLE IF NOT EXISTS visitor_sessions (id TEXT PRIMARY KEY, created INTEGER NOT NULL, country TEXT NOT NULL, device TEXT NOT NULL)');
 sql.exec('CREATE INDEX IF NOT EXISTS visitor_sessions_created ON visitor_sessions(created)');
 const today=Date.parse(new Date(now+28800000).toISOString().slice(0,10)+'T00:00:00+08:00'),since=today-29*86400000;
 if(request.method==='POST')return request.json().then(data=>{
  if(!/^[a-f0-9-]{36}$/i.test(data?.id||''))return respond({error:'Invalid visit.'},400);
  const country=/^[A-Z]{2}$/.test(data.country||'')?data.country:'Unknown',device=['Mobile','Tablet','Desktop'].includes(data.device)?data.device:'Unknown';
  sql.exec('DELETE FROM visitor_sessions WHERE created < ?',since);
  sql.exec('INSERT OR IGNORE INTO visitor_sessions (id,created,country,device) VALUES (?,?,?,?)',data.id,now,country,device);
  return respond({ok:true});
 });
 const rows=(query,...params)=>Array.from(sql.exec(query,...params));
 return respond({total:rows('SELECT COUNT(*) AS count FROM visitor_sessions WHERE created >= ?',since)[0].count,today:rows('SELECT COUNT(*) AS count FROM visitor_sessions WHERE created >= ?',today)[0].count,countries:rows('SELECT country AS name,COUNT(*) AS count FROM visitor_sessions WHERE created >= ? GROUP BY country ORDER BY count DESC LIMIT 6',since),devices:rows('SELECT device AS name,COUNT(*) AS count FROM visitor_sessions WHERE created >= ? GROUP BY device ORDER BY count DESC',since),updatedAt:new Date(now).toISOString()});
}
