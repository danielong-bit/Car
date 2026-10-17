import {loanSchedule} from './finance-engine.mjs';
import {photoUrl} from './browser-stock.mjs';
import {validReportUrl,financeSettings} from './inventory-domain.mjs';

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
export function calculatorMarkup(v,finance,lang) {
 const tr=translator(lang),f=financeSettings(finance);
 return `<section class="vehicle-calculator" data-stock-id="${escapeHtml(v.stockId)}" id="vehicleCalculator" aria-labelledby="vehicleCalcTitle"><div class="tool-heading"><div><p class="eyebrow">${tr('PLAN YOUR NEXT CHAPTER','规划你的下一程','RANCANG LANGKAH SETERUSNYA')}</p><h2 id="vehicleCalcTitle">${tr('Monthly payment','月供计算器','Ansuran bulanan')}</h2></div><span class="tool-currency">RM</span></div><form id="vehicleCalcForm"><div class="payment-field"><div><label for="paymentDown">${tr('Down payment','首付','Deposit')}</label><output id="paymentDownValue" for="paymentDown">${f.downPayment}%</output></div><input id="paymentDown" type="range" min="0" max="100" step="5" value="${f.downPayment}" aria-label="${tr('Down payment','首付','Deposit')}"><div class="down-presets">${[10,20,30].map(value=>`<button type="button" data-down-preset="${value}" aria-pressed="${value===f.downPayment}">${value}%</button>`).join('')}</div></div><label class="payment-tenure" for="paymentYears">${tr('Loan tenure (years)','贷款年限（年）','Tempoh pinjaman (tahun)')}<select id="paymentYears">${[5,7,9].map(year=>`<option value="${year}" ${year===f.tenure?'selected':''}>${year} ${tr('years','年','tahun')}</option>`).join('')}</select></label><p class="fixed-rate">${tr('Fixed example rate','固定示例利率','Kadar contoh tetap')}<strong>${f.rate.toFixed(2).replace(/0$/,'').replace(/\.0$/,'')}% ${f.method==='flat'?tr('flat p.a.','平息／年','rata setahun'):'EIR '+tr('p.a.','／年','setahun')}</strong></p><p class="tool-error" id="paymentError" role="alert"></p></form><div class="payment-result" aria-live="polite" aria-atomic="true"><small>${tr('Estimated monthly payment','预计每月供款','Anggaran ansuran bulanan')}</small><strong id="paymentMonthly">—</strong><span id="paymentTerm"></span></div><a id="paymentEnquiry" class="button" target="_blank" rel="noopener">${tr('Ask Danny for a quote','向 Danny 索取报价','Minta sebut harga Danny')} ↗</a><p class="calc-caption">${tr('Indicative only. Actual rate, tenure and eligibility depend on the bank and your profile. Danny can arrange a personalised quote.','仅供试算，实际利率、年限与贷款资格由银行按个人资料审批。可联系 Danny 获取适合你的报价。','Anggaran sahaja. Kadar, tempoh dan kelayakan sebenar bergantung pada bank dan profil anda. Danny boleh membantu mendapatkan sebut harga.')}</p></section>`;
}
export function estimateVehiclePayment(vehicle,finance,down,years){
 const f=financeSettings(finance);
 if(vehicle.priceRm==null)throw Error('Price is not provided.');
 if(down%5!==0||![5,7,9].includes(years))throw Error('Choose a 5% deposit step and 5, 7 or 9 years.');
 return paymentEstimate(vehicle.priceRm,down,years,f.rate,f.method);
}
export function bindVehicleCalculator(v,finance,lang,wa,pageUrl) {
 const form=document.querySelector('#vehicleCalcForm');if(!form)return;
 const tr=translator(lang),f=financeSettings(finance),get=id=>document.getElementById(id),enquiry=get('paymentEnquiry');
 function update(){
  const down=Number(get('paymentDown').value),years=Number(get('paymentYears').value);
  get('paymentDownValue').textContent=`${down}%${v.priceRm==null?'':' · '+money(v.priceRm*down/100)}`;
  form.querySelectorAll('[data-down-preset]').forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.downPreset)===down)));
  try{
   const r=estimateVehiclePayment(v,f,down,years);get('paymentMonthly').textContent=money(r.monthly);get('paymentTerm').textContent=years+' '+tr('years','年','tahun');get('paymentError').textContent='';
   enquiry.href=wa(`Hi Danny, please arrange a payment quote.\n${v.year||''} ${v.make} ${v.model} · Stock #${v.stockId}\nListed price: ${money(v.priceRm)}\nDown payment: ${down}% (${money(r.deposit)})\nTenure: ${years} years\nFixed example annual rate: ${f.rate}% (${f.method==='flat'?'flat comparison':'EIR'})\nEstimated monthly: ${money(r.monthly)}\n${pageUrl(v)}`);enquiry.removeAttribute('aria-disabled');enquiry.removeAttribute('tabindex');
  }catch{get('paymentMonthly').textContent='—';get('paymentTerm').textContent='';get('paymentError').textContent=tr('Ask Danny for this car’s price to calculate a payment.','向 Danny 询问这辆车的价格后，即可计算月供。','Tanya Danny harga kereta ini untuk mengira ansuran.');enquiry.removeAttribute('href');enquiry.setAttribute('aria-disabled','true');enquiry.setAttribute('tabindex','-1');}
 }
 form.onsubmit=event=>event.preventDefault();form.oninput=update;form.onchange=update;form.querySelectorAll('[data-down-preset]').forEach(button=>button.onclick=()=>{get('paymentDown').value=button.dataset.downPreset;update();});update();
}

export function conditionValues(v){
 const example=v.conditionExample===true;
 return {example,auctionGrade:example?'4.5':v.auctionGrade||'',interiorGrade:example?'B':v.interiorGrade||'',report:!example&&v.auctionReport&&validReportUrl(v.auctionReport.url)?v.auctionReport:null};
}
export function conditionMarkup(v,lang,wa) {
  const tr=translator(lang),e=escapeHtml,none=tr('Not provided','尚未提供','Belum diberikan');
  const {example,auctionGrade,interiorGrade,report}=conditionValues(v);
  if(!example&&!auctionGrade&&!interiorGrade&&!report)return `<section class="detail-info condition-panel" id="vehicleCondition"><h2>${tr('Grades & auction report','车辆等级与拍卖报告','Gred & laporan lelong')}</h2><p>${tr('Condition details and report not provided yet.','车况等级与报告尚未提供。','Butiran keadaan dan laporan belum diberikan.')}</p><a class="text-link" href="${e(wa(`Hi Danny, please share the grades and original auction report for ${v.make} ${v.model}, Stock #${v.stockId}.`))}" target="_blank" rel="noopener">${tr('Request report','索取报告','Minta laporan')} ↗</a></section>`;
  return `<section class="detail-info condition-panel" id="vehicleCondition"><p class="eyebrow">${tr('THIS CAR’S CONDITION','这辆车的车况','KEADAAN KERETA INI')}</p><div class="condition-heading"><h2>${tr('Grades & auction report','车辆等级与拍卖报告','Gred & laporan lelong')}</h2>${example?`<span class="example-label">${tr('EXAMPLE','示例','CONTOH')}</span>`:''}</div>${example?`<p class="example-note">${tr('Layout example: these grades and this report do not describe the actual car.','以下等级与报告用于展示版式，并非这辆车的实际车况。','Contoh paparan: gred dan laporan ini bukan keadaan sebenar kereta.')}</p>`:''}<div class="condition-scores"><div><small>${tr('Auction grade','拍卖等级','Gred lelong')}</small><strong>${e(auctionGrade||'—')}</strong><span>${example?tr('Example grade','示例等级','Gred contoh'):!auctionGrade?none:v.gradeVerified?tr('Checked against report','已核对报告','Disemak dengan laporan'):tr('Seller-entered grade','卖家提供的等级','Gred dimasukkan penjual')}</span></div><div><small>${tr('Interior grade','内饰等级','Gred dalaman')}</small><strong>${e(interiorGrade||'—')}</strong><span>${example?tr('Example grade','示例等级','Gred contoh'):interiorGrade?tr('Cabin condition','车厢状况','Keadaan kabin'):none}</span></div></div>${!example&&v.auctionHouse?`<p class="report-house">${tr('Auction house','拍卖行','Rumah lelong')}: <strong>${e(v.auctionHouse)}</strong></p>`:''}${example?`<button type="button" class="example-report-preview" id="exampleReport"><img data-source="/assets/auction-report-example.svg" alt="${tr('Example report — not a real vehicle inspection','示例报告，并非真实车辆检测记录','Contoh laporan — bukan pemeriksaan sebenar')}"><span>${tr('Enlarge example report','放大查看示例报告','Besarkan contoh laporan')} ↗</span></button>`:''}<div class="report-file"><div><strong>${example?tr('Example auction report','示例拍卖报告','Contoh laporan lelong'):tr('Original auction report','原始拍卖报告','Laporan lelong asal')}</strong><p>${example?tr('Demonstration document only.','仅用于版式展示。','Dokumen contoh sahaja.'):report?.url?e(report.name||tr('Report attached','已附报告','Laporan dilampirkan')):tr('Report not uploaded for this car.','这辆车尚未上传报告。','Laporan belum dimuat naik untuk kereta ini.')}</p></div>${example?'':report?.url?`<a class="button quiet" id="openAuctionReport" target="_blank" rel="noopener">${tr('Open report','查看报告','Buka laporan')} ↗</a>`:`<a class="button quiet" href="${e(wa(`Hi Danny, please share the original auction report for ${v.make} ${v.model}, Stock #${v.stockId}.`))}" target="_blank" rel="noopener">${tr('Request report','索取报告','Minta laporan')} ↗</a>`}</div><details class="grade-explainer"><summary>${tr('What do A / B / C / D mean?','A / B / C / D 是什么意思？','Apakah maksud A / B / C / D?')}</summary><p>${tr('These letters describe the interior separately from the overall auction grade. The issuing auction house’s report defines the exact criteria.','这些字母用于单独描述内饰状况，与整体拍卖等级分开。具体标准以出具报告的拍卖行为准。','Huruf ini menerangkan dalaman secara berasingan daripada gred keseluruhan. Kriteria tepat mengikut rumah lelong yang mengeluarkan laporan.')}</p><div class="interior-scale">${['A','B','C','D'].map(letter=>`<span ${interiorGrade===letter?'aria-current="true"':''}>${letter}${interiorGrade===letter?' · '+(example?tr('Example','示例','Contoh'):tr('This car','本车','Kereta ini')):''}</span>`).join('')}</div></details></section>`;
}
export async function bindAuctionReport(v,base,openPhoto,lang='en') {
 const example=document.getElementById('exampleReport');if(example&&openPhoto)example.onclick=async()=>openPhoto(await photoUrl('/assets/auction-report-example.svg',base),translator(lang)('Example report — not a real vehicle inspection','示例报告，并非真实车辆检测记录','Contoh laporan — bukan pemeriksaan sebenar'));

  const link=document.getElementById('openAuctionReport');if(!link||!validReportUrl(v.auctionReport?.url))return;
  link.href=await photoUrl(v.auctionReport.url,base);
}
