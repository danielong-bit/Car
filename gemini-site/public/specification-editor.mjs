const managed=Object.assign(Object.create(null),{engine:v=>v.engine||v.engineCc,transmission:v=>v.transmission,fuel:v=>v.fuelType,colour:v=>v.exteriorColor||v.color,color:v=>v.exteriorColor||v.color,'auction grade':v=>v.auctionGrade,'interior grade':v=>v.interiorGrade});
const overview=new Set(['model','body','year','mileage','location','chassis','chassis code','platform code']);
function editable(group,key,v){
 const name=String(key).trim().toLowerCase();
 return !['vehicle status','observed'].includes(group.toLowerCase())&&!overview.has(name)&&!(managed[name]?.(v));
}
export function extraSpecificationText(v){
 return Object.entries(v.specs||{}).flatMap(([group,rows])=>(Array.isArray(rows)?rows:[]).filter(([key])=>editable(group,key,v)).map(([key,value])=>`${key}: ${value}`)).join('\n');
}
export function updateExtraSpecifications(v,text){
 const rows=[];
 for(const line of String(text||'').split(/\r?\n/).map(s=>s.trim()).filter(Boolean)){
  const match=line.match(/^([^:：]+)[:：]\s*(.+)$/);
  if(!match)throw Error('Enter each specification as Name: Value, for example Drive: AWD.');
  rows.push([match[1].trim(),match[2].trim()]);
 }
 const specs={};
 for(const [group,items] of Object.entries(v.specs||{})){
  const retained=(Array.isArray(items)?items:[]).filter(([key])=>!editable(group,key,v));
  if(retained.length)specs[group]=retained;
 }
 if(rows.length)specs.Specifications=[...(specs.Specifications||[]),...rows];
 return specs;
}
