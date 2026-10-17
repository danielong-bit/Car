import {loanSchedule} from './finance-engine.mjs';
import {photoUrl} from './browser-stock.mjs';
import {validReportUrl} from './inventory-domain.mjs';

export const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function translator(lang='en') {
  return (en,zh,ms) => lang==='zh' ? zh : lang==='ms' ? ms : en;
}
const money = n => 'RM '+Number(n).toLocaleString('en-MY',{maximumFractionDigits:0});
export function paymentDestination(cars,params,base='/') {
  const selected=cars.find(v=>v.id===(params.get('vehicle')||params.get('car')))||cars.find(v=>v.status==='available'&&(v.priceRm??v.price)!=null)||cars[0];
  return selected?(params.get('local-preview')==='1'?base+'audi/?vehicle='+encodeURIComponent(selected.id)+'&local-preview=1':base+'vehicle/'+encodeURIComponent(selected.id)+'/')+'#vehicleCalculator':base+'#inventory';
}
export function paymentEstimate(price,down,years,rate,method='reducing') {
  if(![price,down,years,rate].every(Number.isFinite)||price<0||down<0||down>100) throw Error('Check the price and down payment.');
  const deposit=price*down/100,principal=price-deposit;
  return {...loanSchedule(principal,years,rate,method),deposit,principal};
}
export function calculatorMarkup(v,finance,lang,cars=[v]) {
  const tr=translator(lang),fields=[['price',tr('Vehicle price (RM)','车价 (RM)','Harga kereta (RM)'),v.priceRm??'',0,100000000,1],['down',tr('Down payment (%)','首付 (%)','Deposit (%)'),finance.downPayment??10,0,100,.1],['rate',tr('Annual interest rate (%)','年利率 (%)','Kadar faedah tahunan (%)'),finance.rate??6,0,30,.1]];
  return `<section class="vehicle-calculator" id="vehicleCalculator" aria-labelledby="vehicleCalcTitle"><div class="tool-heading"><div><p class="eyebrow">${tr('MAKE IT YOURS','看看适合你的月供','RANCANG PEMILIKAN')}</p><h2 id="vehicleCalcTitle">${tr('Monthly payment','月供计算器','Ansuran bulanan')}</h2></div><span class="tool-currency">RM</span></div><form id="vehicleCalcForm" novalidate><label class="payment-car" for="paymentCar">${tr('Choose a car','选择车辆','Pilih kereta')}<select id="paymentCar">${cars.map(car=>`<option value="${escapeHtml(car.id)}" ${car.id===v.id?'selected':''}>${escapeHtml([car.year,car.make,car.model].filter(Boolean).join(' '))} · ${escapeHtml(car.stockId)}</option>`).join('')}</select></label>${fields.map(([key,name,value,min,max,step])=>`<div class="payment-field"><div><label for="payment-${key}">${name}</label><input id="payment-${key}" name="${key}" type="number" min="${min}" max="${max}" step="${key==='price'?'.01':'any'}" value="${value}" required inputmode="decimal"></div><input data-payment-range="${key}" type="range" min="${min}" max="${key==='price'?Math.max(1000000,(v.priceRm||0)*2):max}" step="${key==='price'?1000:step}" value="${value||0}" aria-label="${escapeHtml(name)}"></div>`).join('')}<p class="tool-error" id="paymentError" role="alert"></p></form><div class="payment-result" aria-live="polite" aria-atomic="true"><small>${tr('Estimated monthly payment','预计每月供款','Anggaran ansuran bulanan')}</small><strong id="paymentMonthly">—</strong><span>${finance.tenure||7} ${tr('year example','年贷款示例','tahun anggaran')} · ${finance.method==='flat'?tr('Flat annual rate','固定年利率','Kadar rata tahunan'):'EIR'}</span></div><a id="paymentEnquiry" class="button" target="_blank" rel="noopener">${tr('Discuss this estimate','和 Danny 聊聊这个方案','Bincang anggaran ini')} ↗</a><p class="calc-caption">${tr('Use the annual rate from your bank’s quote.','可输入银行提供的年利率。','Gunakan kadar tahunan dalam sebut harga bank.')}</p></section>`;
}

export function bindVehicleCalculator(v,finance,lang,wa,pageUrl,cars=[v]) {
  const form=document.querySelector('#vehicleCalcForm');if(!form)return;
  const tr=translator(lang),get=id=>document.getElementById(id),enquiry=get('paymentEnquiry');let car=v;
  function update() {
    const values={};for(const key of ['price','down','rate']){const input=get('payment-'+key);values[key]=input.value.trim()===''?NaN:Number(input.value);}
    try {
      if([...form.querySelectorAll('input[type=number]')].some(input=>!input.validity.valid)) throw Error('invalid');
      const years=Number(finance.tenure)||7,r=paymentEstimate(values.price,values.down,years,values.rate,finance.method);
      for(const key of ['price','down','rate']){const range=form.querySelector(`[data-payment-range="${key}"]`);if(key==='price'&&values.price>Number(range.max))range.max=values.price;range.value=values[key];}
      get('paymentMonthly').textContent=money(r.monthly);get('paymentError').textContent='';
      enquiry.href=wa(`Hi Danny, please discuss this payment estimate with me.\n${car.year||''} ${car.make} ${car.model} · Stock #${car.stockId}\nPrice: ${money(values.price)}\nDown payment: ${values.down}% (${money(r.deposit)})\nTenure: ${years} years\nAnnual rate: ${values.rate}% (${finance.method==='flat'?'flat rate comparison':'EIR'})\nEstimated monthly: ${money(r.monthly)}\n${pageUrl(car)}`);enquiry.removeAttribute('aria-disabled');enquiry.removeAttribute('tabindex');
    }catch{
      get('paymentError').textContent=tr('Enter a price, 0–100% down and 0–30% interest.','请输入车价、0–100% 首付和 0–30% 年利率。','Masukkan harga, deposit 0–100% dan faedah 0–30%.');
      get('paymentMonthly').textContent='—';enquiry.removeAttribute('href');enquiry.setAttribute('aria-disabled','true');enquiry.setAttribute('tabindex','-1');
    }
  }
  form.onsubmit=e=>e.preventDefault();form.oninput=e=>{if(e.target.dataset.paymentRange)get('payment-'+e.target.dataset.paymentRange).value=e.target.value;update();};get('paymentCar').onchange=e=>{car=cars.find(item=>item.id===e.target.value)||v;get('payment-price').value=car.priceRm??'';update();};update();
}

export function conditionMarkup(v,lang,wa) {
  const tr=translator(lang),e=escapeHtml,none=tr('Not provided','尚未提供','Belum diberikan');
  const report=v.auctionReport&&validReportUrl(v.auctionReport.url)?v.auctionReport:null;
  return `<section class="detail-info condition-panel" id="vehicleCondition"><p class="eyebrow">${tr('THIS CAR’S CONDITION','这辆车的车况','KEADAAN KERETA INI')}</p><h2>${tr('Grades & auction report','车辆等级与拍卖报告','Gred & laporan lelong')}</h2><div class="condition-scores"><div><small>${tr('Auction grade','拍卖等级','Gred lelong')}</small><strong>${e(v.auctionGrade||'—')}</strong><span>${!v.auctionGrade?none:v.gradeVerified?tr('Checked against report','已核对报告','Disemak dengan laporan'):tr('Seller-entered grade','卖家提供的等级','Gred dimasukkan penjual')}</span></div><div><small>${tr('Interior grade','内饰等级','Gred dalaman')}</small><strong>${e(v.interiorGrade||'—')}</strong><span>${v.interiorGrade?tr('Cabin condition','车厢状况','Keadaan kabin'):none}</span></div></div>${v.auctionHouse?`<p class="report-house">${tr('Auction house','拍卖行','Rumah lelong')}: <strong>${e(v.auctionHouse)}</strong></p>`:''}<div class="report-file"><div><strong>${tr('Original auction report','原始拍卖报告','Laporan lelong asal')}</strong><p>${report?.url?e(report.name||tr('Report attached','已附报告','Laporan dilampirkan')):tr('Report not uploaded for this car.','这辆车尚未上传报告。','Laporan belum dimuat naik untuk kereta ini.')}</p></div>${report?.url?`<a class="button quiet" id="openAuctionReport" target="_blank" rel="noopener">${tr('Open report','查看报告','Buka laporan')} ↗</a>`:`<a class="button quiet" href="${e(wa(`Hi Danny, please share the original auction report for ${v.make} ${v.model}, Stock #${v.stockId}.`))}" target="_blank" rel="noopener">${tr('Request report','索取报告','Minta laporan')} ↗</a>`}</div><details class="grade-explainer"><summary>${tr('What do A / B / C / D mean?','A / B / C / D 是什么意思？','Apakah maksud A / B / C / D?')}</summary><p>${tr('These letters describe the interior separately from the overall auction grade. The issuing auction house’s report defines the exact criteria.','这些字母用于单独描述内饰状况，与整体拍卖等级分开。具体标准以出具报告的拍卖行为准。','Huruf ini menerangkan dalaman secara berasingan daripada gred keseluruhan. Kriteria tepat mengikut rumah lelong yang mengeluarkan laporan.')}</p><div class="interior-scale">${['A','B','C','D'].map(letter=>`<span ${v.interiorGrade===letter?'aria-current="true"':''}>${letter}${v.interiorGrade===letter?' · '+tr('This car','本车','Kereta ini'):''}</span>`).join('')}</div></details></section>`;
}
export async function bindAuctionReport(v,base) {
  const link=document.getElementById('openAuctionReport');if(!link||!validReportUrl(v.auctionReport?.url))return;
  link.href=await photoUrl(v.auctionReport.url,base);
}
