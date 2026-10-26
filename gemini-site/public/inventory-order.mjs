const orders = [
 ['price-up','Price: low → high','价格：低到高','Harga: rendah → tinggi'],
 ['price-down','Price: high → low','价格：高到低','Harga: tinggi → rendah'],
 ['mileage-up','Mileage: low → high','里程：少到多','Perbatuan: rendah → tinggi'],
 ['mileage-down','Mileage: high → low','里程：多到少','Perbatuan: tinggi → rendah'],
 ['year-new','Year: newest first','年份：新到旧','Tahun: terkini dahulu'],
 ['year-old','Year: oldest first','年份：旧到新','Tahun: terlama dahulu'],
];
export function stockSortChoices(lang='en') { return orders.map(row=>[row[0],row[lang==='zh'?2:lang==='ms'?3:1]]); }
export function validStockSort(value) { return orders.some(row=>row[0]===value); }
export function compareStock(order='price-up') {
 const key=order.startsWith('mileage')?'mileageKm':order.startsWith('year')?'year':'priceRm';
 const direction=['price-down','mileage-down','year-new'].includes(order)?-1:1;
 const number=v=>{
  const raw=v[key]??(key==='mileageKm'?String(v.mileage||'').replace(/[^\d.]/g,''):null);
  if(raw===null||raw==='')return null;
  const n=Number(raw);return Number.isFinite(n)?n:null;
 };
 return (a,b)=>{
  const av=number(a),bv=number(b);
  if(av===null||bv===null)return av===bv?0:av===null?1:-1;
  return direction*(av-bv);
 };
}
