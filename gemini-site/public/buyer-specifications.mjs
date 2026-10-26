// Keep the buyer's overview concise. The complete source record stays in the CMS.
export function buyerSpecificationGroups(v,condition={}) {
 const grade=[condition.auctionGrade,condition.interiorGrade].filter(Boolean).join('/');
 const core=[['Engine',v.engine||(v.engineCc>0?`${v.engineCc} cc`:null)],['Fuel',v.fuelType],['Colour',v.exteriorColor],['Auction grade',grade?grade+(condition.example?' · '+(condition.exampleLabel||'Example'):''):null]];
 const repeated=new Set(['model','body','transmission','year','mileage','location','colour','color','chassis','chassis code','platform code','auction grade','interior grade','engine','fuel']);
 const usable=value=>value!=null&&String(value).trim()!==''&&!/\b(demo|to verify|not provided|visible)\b/i.test(String(value));
 const additional=[];
 for(const [group,values] of Object.entries(v.specs||{})){
  if(['vehicle status','observed'].includes(group.toLowerCase()))continue;
  for(const [key,value] of Array.isArray(values)?values:[]){
   const normalized=String(key).toLowerCase();
   const coreRow=core.find(([name])=>name.toLowerCase()===normalized);
   if(coreRow&&!usable(coreRow[1])&&usable(value))coreRow[1]=value;
   if(!repeated.has(normalized)&&usable(value)){additional.push([key,value]);repeated.add(normalized);}
  }
 }
 return {core:core.filter(([,value])=>usable(value)),additional};
}
