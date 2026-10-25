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
function financingDocumentsMarkup(lang) {
 const tr=translator(lang);
 const documents=[
  tr('IC / MyKad or another identity document accepted by the bank','IC / MyKad 或银行接受的其他身份证明','IC / MyKad atau dokumen pengenalan lain yang diterima bank'),
  tr('Valid driving licence','有效驾驶执照','Lesen memandu yang sah'),
  tr('Payslips for the latest 3–6 months','最近 3–6 个月的薪水单','Penyata gaji 3–6 bulan terkini'),
  tr('Bank statements for the latest 3–6 months','最近 3–6 个月的银行结单','Penyata bank 3–6 bulan terkini'),
  tr('EPF statement','EPF 公积金结单','Penyata KWSP / EPF'),
  tr('Latest income tax filing or statement','最新报税申报或税务结单','Pemfailan atau penyata cukai pendapatan terkini')
 ];
 return `<details class="finance-documents" id="financingDocuments"><summary>${tr('Documents to prepare for financing','申请贷款前请准备','Dokumen untuk permohonan pembiayaan')}</summary><div class="finance-documents-body"><p>${tr('Banks may request different documents for each application. These are commonly requested:','银行会按申请情况要求不同文件，以下是常见准备资料：','Bank mungkin meminta dokumen berbeza mengikut permohonan. Dokumen berikut lazimnya diminta:')}</p><ul>${documents.map(item=>`<li>${item}</li>`).join('')}</ul><p class="finance-documents-privacy">${tr('Confirm the bank’s exact requirements with Danny. Do not upload or post identity or financial documents on this public website. Ask Danny for a private submission method if you decide to proceed.','请先向 Danny 确认银行的具体要求。请勿在公开网站上传或留言身份证件及财务文件；决定继续申请后，请向 Danny 索取私下提交方式。','Sahkan keperluan tepat bank dengan Danny. Jangan muat naik atau siarkan dokumen identiti atau kewangan di laman awam ini. Minta Danny cara penghantaran peribadi jika anda ingin meneruskan.')}</p></div></details>`;
}
export function calculatorMarkup(v,finance,lang) {
 const tr=translator(lang),f=financeSettings(finance);
 const base=(typeof window!=='undefined'&&window.SITE_BASE)||'/';
 const fullToolsHref=`${base}tools/${v?.id?`?vehicle=${encodeURIComponent(v.id)}`:''}`;
 return `<section class="vehicle-calculator" data-stock-id="${escapeHtml(v.stockId)}" id="vehicleCalculator" aria-labelledby="vehicleCalcTitle"><div class="tool-heading"><div><p class="eyebrow">${tr('PLAN YOUR NEXT CHAPTER','规划你的下一程','RANCANG LANGKAH SETERUSNYA')}</p><h2 id="vehicleCalcTitle">${tr('Monthly payment','月供计算器','Ansuran bulanan')}</h2></div><span class="tool-currency">RM</span></div><form id="vehicleCalcForm"><div class="payment-field"><div><label for="paymentDown">${tr('Down payment','首付','Deposit')}</label><output id="paymentDownValue" for="paymentDown">${f.downPayment}%</output></div><input id="paymentDown" type="range" min="0" max="100" step="5" value="${f.downPayment}" aria-label="${tr('Down payment','首付','Deposit')}"><div class="down-presets">${[10,20,30].map(value=>`<button type="button" data-down-preset="${value}" aria-pressed="${value===f.downPayment}">${value}%</button>`).join('')}</div></div><label class="payment-tenure" for="paymentYears">${tr('Loan tenure (years)','贷款年限（年）','Tempoh pinjaman (tahun)')}<select id="paymentYears">${[5,7,9].map(year=>`<option value="${year}" ${year===f.tenure?'selected':''}>${year} ${tr('years','年','tahun')}</option>`).join('')}</select></label><p class="fixed-rate">${tr('Fixed example rate','固定示例利率','Kadar contoh tetap')}<strong>${f.rate.toFixed(2).replace(/0$/,'').replace(/\.0$/,'')}% ${f.method==='flat'?tr('flat p.a.','平息／年','rata setahun'):'EIR '+tr('p.a.','／年','setahun')}</strong></p><p class="tool-error" id="paymentError" role="alert"></p></form><div class="payment-result" aria-live="polite" aria-atomic="true"><small>${tr('Estimated monthly payment','预计每月供款','Anggaran ansuran bulanan')}</small><strong id="paymentMonthly">—</strong><span id="paymentTerm"></span></div><a id="paymentEnquiry" class="button" target="_blank" rel="noopener">${tr('Ask Danny for a quote','向 Danny 索取报价','Minta sebut harga Danny')} ↗</a><a class="full-calculator-link" href="${escapeHtml(fullToolsHref)}">${tr('Open full loan & JPJ road tax calculator →','打开完整贷款与 JPJ 路税计算器 →','Buka kalkulator pinjaman & cukai jalan JPJ penuh →')}</a><p class="calc-caption">${tr('Indicative only. Actual rate, tenure and eligibility depend on the bank and your profile. Danny can arrange a personalised quote.','仅供试算，实际利率、年限与贷款资格由银行按个人资料审批。可联系 Danny 获取适合你的报价。','Anggaran sahaja. Kadar, tempoh dan kelayakan sebenar bergantung pada bank dan profil anda. Danny boleh membantu mendapatkan sebut harga.')}</p>${financingDocumentsMarkup(lang)}</section>`;
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
  const {example,auctionGrade,interiorGrade}=conditionValues(v);
  const waReportHref=wa(`Hi Danny, please share the original auction report and grade details for ${v.year||''} ${v.make} ${v.model}, Stock #${v.stockId}.`);
  const interiorMeanings=[
    ['A',tr('Like-new cabin · Spotless upholstery, trim & controls with minimal wear.','接近全新内饰 · 座椅、饰板与按键整洁干净，几乎无磨损。','Kabin seperti baharu · Kerusi, kemasan & kawalan sangat bersih tanpa kesan haus.')],
    ['B',tr('Clean cabin · Well-kept interior with only light, normal age-related wear.','整洁良好内饰 · 车厢保养良好，仅有轻微正常使用痕迹。','Kabin bersih · Dalaman terjaga rapi dengan kesan penggunaan biasa yang ringan.')],
    ['C',tr('Fair cabin · Visible wear, seat creases or minor trim blemishes that may need touch-up.','一般内饰状况 · 有可见使用痕迹、座椅折痕或轻微饰板瑕疵。','Kabin sederhana · Kesan penggunaan ketara, kedutan kerusi atau calar kecil pada kemasan.')],
    ['D',tr('Heavy wear · Noticeable stains, tears or trim wear requiring interior refurbishment.','明显磨损内饰 · 有较明显污渍、破损或老化，建议整备翻新。','Haus ketara · Kotoran, koyakan atau kehausan kemasan yang memerlukan pemulihan dalaman.')]
  ];
  const waStrip=`<div class="report-wa-strip"><p>${tr('Want to inspect the original auction sheet? Danny sends it personally via WhatsApp upon request.','想看原始拍卖报告（Auction Report）？点击右侧按钮，Danny 会在 WhatsApp 直接发给你。','Ingin melihat laporan lelong asal? Danny akan menghantarnya terus melalui WhatsApp atas permintaan.')}</p><a class="button quiet" href="${e(waReportHref)}" target="_blank" rel="noopener">${tr('Request report on WhatsApp','在 WhatsApp 索取报告','Minta laporan di WhatsApp')} ↗</a></div>`;
  const explainer=`<details class="grade-explainer"><summary>${tr('What do A / B / C / D mean?','内饰等级 A / B / C / D 是什么意思？','Apakah maksud gred dalaman A / B / C / D?')}</summary><p>${tr('Japanese auction houses grade the cabin interior from A to D separately from the overall car number grade:','日本拍卖行会将车厢内饰从 A 到 D 单独评级（与 5 / 4.5 / 4 等综合车况分数分开）：','Rumah lelong Jepun menilai bahagian dalaman kabin dari A hingga D secara berasingan daripada gred keseluruhan kereta:')}</p><div class="interior-scale">${interiorMeanings.map(([letter,desc])=>{const isCurrent=interiorGrade===letter;return `<div class="interior-scale-item ${isCurrent?'is-current':''}" ${isCurrent?'aria-current="true"':''}><div class="interior-scale-head"><span class="interior-grade-pill">${letter}</span>${isCurrent?`<em class="interior-current-tag">${example?tr('Example','示例','Contoh'):tr('This car','本车等级','Kereta ini')}</em>`:''}</div><p class="interior-grade-desc">${e(desc)}</p></div>`;}).join('')}</div></details>`;
  if(!example&&!auctionGrade&&!interiorGrade)return `<section class="detail-info condition-panel" id="vehicleCondition"><p class="eyebrow">${tr('THIS CAR’S CONDITION','这辆车的车况等级','KEADAAN KERETA INI')}</p><div class="condition-heading"><h2>${tr('Vehicle grade','车辆拍卖与内饰等级','Gred kenderaan')}</h2></div><p class="condition-summary-copy">${tr('Auction grade and report are not provided yet for this listing. Message Danny on WhatsApp to request the inspection and condition details.','此车辆的拍卖等级暂未提供。欢迎通过 WhatsApp 向 Danny 索取原始拍卖报告与车况详情。','Gred lelongan belum diberikan untuk senarai ini. Mesej Danny di WhatsApp untuk butiran keadaan.')}</p>${waStrip}${explainer}</section>`;
  return `<section class="detail-info condition-panel" id="vehicleCondition"><p class="eyebrow">${tr('THIS CAR’S CONDITION','这辆车的车况等级','KEADAAN KERETA INI')}</p><div class="condition-heading"><h2>${tr('Vehicle grade','车辆拍卖与内饰等级','Gred kenderaan')}</h2>${example?`<span class="example-label">${tr('EXAMPLE','示例','CONTOH')}</span>`:''}</div><p class="condition-summary-copy">${tr('Overall Japanese auction grade and cabin interior grade at a glance. Message Danny on WhatsApp whenever you would like to review the original auction sheet together.','一眼看清日本拍卖综合等级与车厢内饰等级。如需查看原始拍卖报告（Auction Sheet），欢迎直接通过 WhatsApp 向 Danny 索取。','Ringkasan gred lelong Jepun dan gred dalaman kabin. Mesej Danny di WhatsApp jika anda ingin menyemak laporan lelong asal bersama-sama.')}</p><div class="condition-scores"><div><small>${tr('Auction grade','拍卖综合等级','Gred lelong')}</small><strong>${e(auctionGrade||'—')}</strong><span>${example?tr('Example grade','示例等级','Gred contoh'):!auctionGrade?none:v.gradeVerified?tr('Verified with Danny','已与报告核对','Disahkan bersama Danny'):tr('Overall exterior & mechanical grade','外观与车况综合评级','Gred keseluruhan luaran & mekanikal')}</span></div><div><small>${tr('Interior grade','车厢内饰等级','Gred dalaman')}</small><strong>${e(interiorGrade||'—')}</strong><span>${example?tr('Example grade','示例等级','Gred contoh'):interiorGrade?tr('Cabin condition grade','车厢内饰评级','Gred keadaan kabin'):none}</span></div></div>${!example&&v.auctionHouse?`<p class="report-house">${tr('Auction house','拍卖行','Rumah lelong')}: <strong>${e(v.auctionHouse)}</strong></p>`:''}${waStrip}${explainer}</section>`;
}
export async function bindAuctionReport(_v,_base,_openPhoto,_lang='en') {
  // Reports are shared directly via WhatsApp upon request to keep vehicle detail pages fast and uncluttered.
}
