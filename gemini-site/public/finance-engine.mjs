export function loanSchedule(principal,years,annualRate,method='reducing'){
  if(![principal,years,annualRate].every(Number.isFinite)||principal<0||years<1||years>9||annualRate<0||annualRate>30||!Number.isInteger(years))throw new Error('Check amount, 1–9 year tenure and 0–30% annual rate.');
  const n=years*12,r=Math.pow(1+annualRate/100,1/12)-1;
  const flatInterest=principal*annualRate/100*years;
  const monthly=method==='flat'?(principal+flatInterest)/n:r===0?principal/n:principal*r/(1-Math.pow(1+r,-n));
  let balance=principal;const rows=[];
  for(let month=1;month<=n;month++){const interest=method==='flat'?flatInterest/n:balance*r;const payment=month===n?balance+interest:monthly;const capital=payment-interest;balance=Math.max(0,balance-capital);rows.push({month,payment,principal:capital,interest,balance:month===n?0:balance});}
  return {monthly,rows,totalInterest:method==='flat'?flatInterest:rows.reduce((n,r)=>n+r.interest,0),totalPaid:rows.reduce((n,r)=>n+r.payment,0)};
}
// JPJ petrol/diesel private vehicle schedule, sections 1.1.2–1.1.4.
export function roadTax(cc,code,region='peninsular'){
  if(region!=='peninsular'||!['AB','AC','AD','AE'].includes(code))throw Error('Get a JPJ quote for this registration region or vehicle class.');
  if(!Number.isInteger(cc)||cc<1||cc>10000)throw Error('Enter the exact engine capacity in cc from the registration document.');
  const saloon=code==='AB'||code==='AC',company=code==='AC';const fixed=saloon?(company?[20,110,140,180]:[20,55,70,90]):[20,85,100,120];
  for(const [i,max] of [1000,1200,1400,1600].entries())if(cc<=max)return fixed[i];
  const bands=saloon?(company?[[1800,400,.8,1600],[2000,560,1,1800],[2500,760,3,2000],[3000,2260,7.5,2500],[10000,6010,13.5,3000]]:[[1800,200,.4,1600],[2000,280,.5,1800],[2500,380,1,2000],[3000,880,2.5,2500],[10000,2130,4.5,3000]]):[[1800,300,.3,1600],[2000,360,.4,1800],[2500,440,.8,2000],[3000,840,1.6,2500],[10000,1640,1.6,3000]];
  const [,base,rate,threshold]=bands.find(([max])=>cc<=max);return Math.round((base+(cc-threshold)*rate)*100)/100;
}
