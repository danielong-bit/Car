import {financeSettings} from './inventory-domain.mjs';
import {loanSchedule,roadTax} from './finance-engine.mjs';
import {escapeHtml as esc,translator} from './vehicle-tools.mjs';
export const JPJ_SOURCE='https://www.jpj.gov.my/wp-content/uploads/2022/11/Garis-Panduan-Pengiraan-LKM-Bajet-20092.pdf';
function inferEngineCc(v){
 if(Number.isFinite(Number(v?.engineCc))&&Number(v.engineCc)>0)return Math.round(Number(v.engineCc));
 const raw=String(v?.engine||'');
 const ccMatch=raw.match(/(\d[\d,]{2,4})\s*cc/i);
 if(ccMatch)return Number(ccMatch[1].replace(/,/g,''));
 const litreMatch=raw.match(/(\d\.\d)\s*l/i);
 if(litreMatch)return Math.round(Number(litreMatch[1])*1000);
 return 1998;
}
function inferJpjClass(v){
 const body=String(v?.body||'').toUpperCase();
 return /SUV|MPV|4X4|PICKUP/.test(body)?'AD':'AB';
}
export function renderBuyingTools(host,doc={},lang='en'){
 if(!host)return;
 const f=financeSettings(doc.finance);
 const tr=translator(lang);
 const money=n=>'RM '+Number(n).toLocaleString('en-MY',{minimumFractionDigits:2,maximumFractionDigits:2});
 const phone=doc.profile?.phone||'60125686528';
 const base=window.SITE_BASE||'/';
 const cars=(doc.vehicles||[]).filter(v=>['available','reserved'].includes(v.status)&&v.priceRm!=null);
 const requestedId=new URLSearchParams(location.search).get('vehicle')||'';
 const presetCar=cars.find(v=>v.id===requestedId||v.stockId===requestedId)||null;
 const initialPrice=presetCar?.priceRm??200000;
 const initialCc=presetCar?inferEngineCc(presetCar):1998;
 const initialCode=presetCar?inferJpjClass(presetCar):'AB';

 host.innerHTML=`<p class="eyebrow">${tr('PLAN YOUR PURCHASE','规划购车预算','RANCANG PEMBELIAN')}</p>
 <h1>${tr('Calculator & JPJ Utilities','月供计算器与 JPJ 路税工具','Kalkulator & Utiliti JPJ')}</h1>
 <p class="tools-lead">${tr('Estimate Malaysian hire-purchase monthly installments, check official Peninsular Malaysia JPJ road tax (LKM), and access verified vehicle ownership utilities before you commit.','在决定购车前，清晰测算马来西亚汽车贷款月供、查询西马 JPJ 官方路税（LKM），并浏览官方拥车实用工具。','Anggarkan ansuran bulanan sewa beli Malaysia, semak cukai jalan rasmi JPJ Semenanjung Malaysia (LKM), dan akses utiliti pemilikan kereta rasmi sebelum membuat keputusan.')}</p>
 <div class="tools-grid">
  <section class="tool-panel" id="loanTool">
   <div class="tool-panel-head">
    <h2>${tr('Monthly payment','月供估算','Ansuran bulanan')}</h2>
    <span class="tool-panel-badge">${tr('Malaysian Hire-Purchase','马来西亚车贷测算','Sewa Beli Malaysia')}</span>
   </div>
   <form id="buyingLoan" novalidate>
    <div class="tools-car-picker"><label for="buyingCarPreset">${tr('Choose a car or enter your own price','选择库存车，或自行输入车价','Pilih kereta atau masukkan harga sendiri')}<select id="buyingCarPreset"><option value="">${tr('Custom price — enter below','自定车价 — 在下方输入','Harga sendiri — masukkan di bawah')}</option>${cars.map(v=>`<option value="${esc(v.id)}" ${presetCar?.id===v.id?'selected':''}>${esc([v.year,v.make,v.model,v.variant].filter(Boolean).join(' '))} · ${esc(v.stockId||'')} — RM ${Number(v.priceRm).toLocaleString('en-MY')}${v.status==='reserved'?' · '+tr('Booked','已预订','Ditempah'):''}</option>`).join('')}</select></label><a class="tool-car-link" id="buyingPresetLink" href="${presetCar?`${base}vehicle/${encodeURIComponent(presetCar.id)}/`:`${base}#inventory`}">${presetCar?tr('View selected car →','查看该车辆 →','Lihat kereta dipilih →'):tr('Browse showroom →','浏览现车 →','Lihat showroom →')}</a></div>
    <label>${tr('Vehicle price (RM)','车价（RM）','Harga kereta (RM)')}<input name="price" type="number" min="0" max="10000000" step="0.01" value="${initialPrice}" required></label>
    <label>${tr('Down payment (%)','首付（%）','Deposit (%)')}<input name="down" type="number" min="0" max="100" step="1" value="${f.downPayment}" required></label>
    <div class="tool-quick-chips is-compact" role="group" aria-label="${tr('Quick deposit percentage','快捷首付比例','Peratusan deposit pantas')}">
     ${[10,15,20,30].map(pct=>`<button type="button" class="tool-chip" data-quick-down="${pct}">${pct}% ${tr('Down','首付','Deposit')}</button>`).join('')}
    </div>
    <label>${tr('Tenure (years)','贷款年限（年）','Tempoh (tahun)')}<select name="years">${[1,2,3,4,5,6,7,8,9].map(y=>`<option value="${y}" ${y===(f.tenure)?'selected':''}>${y} ${tr(y===1?'year':'years','年',y===1?'tahun':'tahun')}</option>`).join('')}</select></label>
    <label>${tr('Annual rate (%)','年利率（%）','Kadar tahunan (%)')}<input name="rate" type="number" min="0" max="30" step=".01" value="${f.rate}" required></label>
    <label>${tr('Calculation method','计算方法','Kaedah pengiraan')}<select name="method"><option value="flat" ${f.method==='flat'?'selected':''}>${tr('Flat rate (comparison only)','平息（对比参考）','Kadar rata (perbandingan sahaja)')}</option><option value="reducing" ${f.method!=='flat'?'selected':''}>${tr('Effective annual rate / reducing balance','实际年利率／递减余额','Kadar efektif / baki berkurangan')}</option></select></label>
    <button class="button" type="submit" style="margin-top:18px">${tr('Calculate','计算','Kira')}</button>
   </form>
   <output class="tools-result" id="buyingMonthly" aria-live="polite"></output>
   <p id="buyingLoanError" class="tool-error" role="alert"></p>
   <div id="buyingLoanBreakdown" class="tools-breakdown" aria-live="polite"></div>
   <div class="tools-panel-actions">
    <a class="button whatsapp-action" id="buyingLoanWa" href="https://wa.me/${esc(phone)}" target="_blank" rel="noopener"><span>${tr('Discuss this financing estimate with Danny','向 Danny 咨询此贷款方案','Bincang anggaran pembiayaan ini dengan Danny')}</span> <span aria-hidden="true">↗</span></a>
   </div>
   <small>${tr('Malaysian hire-purchase estimate only. Bank interest rates, processing fees, insurance and final approval depend on individual bank assessment. This is not a financing offer.','仅作马来西亚汽车贷款（Hire-Purchase）估算参考。实际银行利率、手续费、车险及最终审批取决于银行评估，并非正式贷款承诺。','Anggaran sewa beli Malaysia sahaja. Kadar faedah bank, fi pemprosesan, insurans dan kelulusan akhir bergantung pada penilaian bank. Ini bukan tawaran pembiayaan rasmi.')}</small>
  </section>
  <section class="tool-panel" id="roadTaxTool">
   <div class="tool-panel-head">
    <h2>${tr('Annual road tax','年度路税','Cukai jalan tahunan')}</h2>
    <span class="tool-panel-badge">${tr('Peninsular Malaysia LKM','西马 JPJ 路税','LKM Semenanjung')}</span>
   </div>
   <div class="tool-quick-chips" role="group" aria-label="${tr('Common engine displacements','常见引擎排量','Kapasiti enjin biasa')}">
    ${[[1498,'1.5L (1,498 cc)'],[1998,'2.0L (1,998 cc)'],[2494,'2.5L (2,494 cc)'],[2995,'3.0L (2,995 cc)'],[3799,'3.8L (3,799 cc)']].map(([ccVal,ccLabel])=>`<button type="button" class="tool-chip" data-quick-cc="${ccVal}">${ccLabel}</button>`).join('')}
   </div>
   <form id="buyingTax" novalidate>
    <label>${tr('Exact engine capacity (cc)','准确引擎排量（cc）','Kapasiti enjin tepat (cc)')}<input name="cc" type="number" min="1" max="10000" step="1" value="${initialCc}" required></label>
    <label>${tr('JPJ registration class','JPJ 注册类别','Kelas pendaftaran JPJ')}<select name="code"><option value="AB" ${initialCode==='AB'?'selected':''}>AB — ${tr('Private saloon / individual','私人轿车／个人','Saloon persendirian / individu')}</option><option value="AC" ${initialCode==='AC'?'selected':''}>AC — ${tr('Private saloon / company','私人轿车／公司','Saloon persendirian / syarikat')}</option><option value="AD" ${initialCode==='AD'?'selected':''}>AD — ${tr('Private non-saloon (SUV/MPV) / individual','私人非轿车（SUV/MPV）／个人','Bukan saloon (SUV/MPV) / individu')}</option><option value="AE" ${initialCode==='AE'?'selected':''}>AE — ${tr('Private non-saloon (SUV/MPV) / company','私人非轿车（SUV/MPV）／公司','Bukan saloon (SUV/MPV) / syarikat')}</option></select></label>
    <p>${tr('Peninsular Malaysia · petrol/diesel only. Choose the class on the registration document; body style alone does not confirm the class.','仅适用于马来半岛汽油／柴油车。请按注册文件选择类别，不能只凭车身外形判断。','Semenanjung Malaysia · petrol/diesel sahaja. Pilih kelas pada dokumen pendaftaran, bukan berdasarkan bentuk badan sahaja.')}</p>
    <button class="button" type="submit">${tr('Calculate road tax','计算路税','Kira cukai jalan')}</button>
   </form>
   <output class="tools-result" id="buyingTaxResult" aria-live="polite"></output>
   <p id="buyingTaxError" class="tool-error" role="alert"></p>
   <div id="buyingTaxBreakdown" class="tools-breakdown" aria-live="polite"></div>
   <small>${tr('Excludes insurance and processing fees. EVs, East Malaysia, duty-free islands and other classes follow separate JPJ schedules.','不含保险及手续费。电动车、东马、免税岛和其他车辆类别适用不同的 JPJ 费率表。','Tidak termasuk insurans dan fi. EV, Malaysia Timur, pulau bebas cukai dan kelas lain memerlukan jadual JPJ yang berkenaan.')}</small>
   <p><a href="${JPJ_SOURCE}" target="_blank" rel="noopener">${tr('Official JPJ schedule — sections 1.1.2–1.1.4 ↗','JPJ 官方费率表 — 第 1.1.2–1.1.4 节 ↗','Jadual rasmi JPJ — seksyen 1.1.2–1.1.4 ↗')}</a></p>
   <p>${tr('Source checked 21 October 2026. Confirm the final amount with JPJ before registration.','资料核对日期：2026 年 10 月 21 日。注册前请向 JPJ 确认最终金额。','Sumber disemak 21 Oktober 2026. Sahkan amaun akhir dengan JPJ sebelum pendaftaran.')}</p>
  </section>
 </div>
 <section class="tools-utilities-section" aria-labelledby="jpjUtilitiesHeading">
  <div class="tools-utilities-head">
   <p class="eyebrow">${tr('OFFICIAL MALAYSIAN MOTORING RESOURCES','马来西亚官方拥车与注册指南','SUMBER RASMI PEMILIKAN KERETA MALAYSIA')}</p>
   <h2 id="jpjUtilitiesHeading">${tr('JPJ & Recond Ownership Utilities','JPJ 与进口车上牌实用工具','Utiliti JPJ & Pemilikan Kereta Recond')}</h2>
   <p>${tr('Direct links to official Malaysian government and inspection portals. Selecting an external link below opens the official service in a new tab.', '以下为马来西亚陆路交通局（JPJ）及验车机构的官方链接。点击外部链接将在新标签页打开官方网站。', 'Pautan terus ke portal rasmi kerajaan Malaysia dan pemeriksaan kenderaan. Memilih pautan luar di bawah akan membuka laman rasmi dalam tab baharu.')}</p>
  </div>
  <div class="tools-utilities-grid">
   <article class="utility-card">
    <span class="utility-badge">${tr('Official Portal','官方网站','Portal Rasmi')}</span>
    <h3>${tr('JPJ mySIKAP Public Portal','JPJ mySIKAP 公众门户','Portal Awam mySIKAP JPJ')}</h3>
    <p>${tr('Check vehicle registration status, road tax (LKM) validity, and number plate running numbers directly on the Road Transport Department Malaysia portal.','直接在马来西亚陆路交通局（JPJ）官方门户查询车辆注册状态、路税（LKM）有效期及最新车牌号段。','Semak status pendaftaran kenderaan, tempoh sah cukai jalan (LKM), dan nombor pendaftaran terkini terus di portal rasmi JPJ Malaysia.')}</p>
    <a class="utility-link" href="https://public.jpj.gov.my/" target="_blank" rel="noopener noreferrer">${tr('Open public.jpj.gov.my','访问 public.jpj.gov.my','Buka public.jpj.gov.my')} <span aria-hidden="true">↗</span></a>
   </article>
   <article class="utility-card">
    <span class="utility-badge">${tr('Official Tariff PDF','官方费率文件','Jadual Rasmi PDF')}</span>
    <h3>${tr('JPJ LKM Road Tax Schedule','JPJ LKM 路税计算指南','Garis Panduan Kadar Fi LKM JPJ')}</h3>
    <p>${tr('Download the official JPJ Motor Vehicle Licence (LKM) calculation guideline PDF covering progressive displacement rates above 1,600 cc.','下载马来西亚 JPJ 官方路税（LKM）计算指南 PDF 原件，涵盖 1,600 cc 以上累进排量费率表。','Muat turun PDF garis panduan rasmi pengiraan Lesen Kenderaan Motor (LKM) JPJ termasuk kadar progresif melebihi 1,600 cc.')}</p>
    <a class="utility-link" href="${JPJ_SOURCE}" target="_blank" rel="noopener noreferrer">${tr('View official JPJ PDF','查看 JPJ 官方 PDF','Lihat PDF rasmi JPJ')} <span aria-hidden="true">↗</span></a>
   </article>
   <article class="utility-card">
    <span class="utility-badge">${tr('Inspection Authority','法定验车机构','Badan Pemeriksaan')}</span>
    <h3>${tr('PUSPAKOM Vehicle Inspection','PUSPAKOM 验车中心','Pemeriksaan Kenderaan PUSPAKOM')}</h3>
    <p>${tr('Every imported reconditioned vehicle undergoes mandatory PUSPAKOM B2 inspection and customs verification before JPJ registration.', '每辆进口 RECOND 车在 JPJ 正式注册上牌前，均须通过 PUSPAKOM B2 法定验车与关税文件核验。', 'Setiap kereta recond import menjalani pemeriksaan wajib PUSPAKOM B2 dan pengesahan kastam sebelum pendaftaran JPJ.')}</p>
    <a class="utility-link" href="https://www.puspakom.com.my/" target="_blank" rel="noopener noreferrer">${tr('Open puspakom.com.my','访问 puspakom.com.my','Buka puspakom.com.my')} <span aria-hidden="true">↗</span></a>
   </article>
   <article class="utility-card utility-card--highlight">
    <span class="utility-badge">${tr('Direct Assistance','Danny 专人协助','Bantuan Terus')}</span>
    <h3>${tr('AP, Number Plate & NCD Transfer','AP 文件、选牌与 NCD 转移协助','Bantuan AP, Nombor Plat & Pindah NCD')}</h3>
    <p>${tr('Have questions about auction report verification, JPJ number plate tender/interchange, or transferring your insurance NCD to a recond car? Ask Danny directly.','对原始拍卖报告核对、JPJ 投标车牌／保留旧车牌或车险 NCD 转移有疑问？直接通过 WhatsApp 咨询 Danny。','Ada soalan mengenai semakan laporan lelong, bidaan/tukar nombor plat JPJ, atau pemindahan NCD insurans ke kereta recond? Tanya Danny terus.')}</p>
    <a class="utility-link" href="https://wa.me/${esc(phone)}?text=${encodeURIComponent('Hi Danny, I have a question about JPJ registration, road tax, or financing for a recond car.')}" target="_blank" rel="noopener">${tr('Ask Danny on WhatsApp','WhatsApp 咨询 Danny','Tanya Danny di WhatsApp')} <span aria-hidden="true">↗</span></a>
   </article>
  </div>
 </section>`;

 const loan=host.querySelector('#buyingLoan'),tax=host.querySelector('#buyingTax'),presetSelect=host.querySelector('#buyingCarPreset'),presetLink=host.querySelector('#buyingPresetLink');
 const runLoan=e=>{
  e?.preventDefault();
  const values=Object.fromEntries(new FormData(loan));
  const breakdownEl=host.querySelector('#buyingLoanBreakdown');
  const waBtn=host.querySelector('#buyingLoanWa');
  try{
   const price=Number(values.price),down=Number(values.down),years=Number(values.years),rate=Number(values.rate),method=values.method;
   if(!Number.isFinite(price)||price<=0||!Number.isFinite(down)||down<0||down>100)throw Error(tr('Check the price and deposit (0%–100%).','请检查车价和首付比例（0%–100%）。','Semak harga kereta dan deposit (0%–100%).'));
   if(!Number.isFinite(years)||years<1||years>9||!Number.isFinite(rate)||rate<0||rate>30)throw Error(tr('Choose a tenure between 1–9 years and a valid annual rate.','请选择 1–9 年贷款期限及有效年利率。','Pilih tempoh 1–9 tahun dan kadar tahunan yang sah.'));
   const depositRm=price*(down/100);
   const principal=Math.max(0,price-depositRm);
   const result=principal===0?{monthly:0,totalInterest:0,totalPaid:0,rows:[]}:loanSchedule(principal,years,rate,method);
   host.querySelector('#buyingMonthly').textContent=money(result.monthly)+' / '+tr('month','月','bulan');
   host.querySelector('#buyingLoanError').textContent='';
   host.querySelectorAll('[data-quick-price]').forEach(btn=>btn.classList.toggle('is-active',Number(btn.dataset.quickPrice)===price));
   host.querySelectorAll('[data-quick-down]').forEach(btn=>btn.classList.toggle('is-active',Number(btn.dataset.quickDown)===down));
   if(breakdownEl){
    const totalOutlay=Math.max(1,depositRm+principal+result.totalInterest);
    const depPct=Math.round((depositRm/totalOutlay)*100);
    const prinPct=Math.round((principal/totalOutlay)*100);
    const intPct=Math.max(0,100-depPct-prinPct);
    breakdownEl.innerHTML=`<div class="tools-visual-meter" aria-hidden="true">
     <div class="tools-meter-bar">
      <span class="meter-seg is-deposit" style="width:${depPct}%"></span>
      <span class="meter-seg is-principal" style="width:${prinPct}%"></span>
      <span class="meter-seg is-interest" style="width:${intPct}%"></span>
     </div>
     <div class="tools-meter-legend">
      <span><i class="dot is-deposit"></i>${tr('Deposit','首付','Deposit')} ${depPct}%</span>
      <span><i class="dot is-principal"></i>${tr('Principal','本金','Prinsipal')} ${prinPct}%</span>
      <span><i class="dot is-interest"></i>${tr('Interest','利息','Faedah')} ${intPct}%</span>
     </div>
    </div>
    <dl class="tools-breakdown-grid">
     <div><dt>${tr('Vehicle price','车辆价格','Harga kereta')}</dt><dd>${money(price)}</dd></div>
     <div><dt>${tr('Down payment','首付金额','Bayaran pendahuluan')} (${down}%)</dt><dd>${money(depositRm)}</dd></div>
     <div><dt>${tr('Loan principal','贷款本金','Prinsipal pinjaman')}</dt><dd>${money(principal)}</dd></div>
     <div><dt>${tr('Estimated total interest','预计总利息','Anggaran jumlah faedah')}</dt><dd>${money(result.totalInterest)}</dd></div>
     <div><dt>${tr('Total amount payable','贷款本息合计','Jumlah bayaran balik')}</dt><dd>${money(result.totalPaid)}</dd></div>
     <div><dt>${tr('Tenure & basis','期限与计算方式','Tempoh & kaedah')}</dt><dd>${years*12} ${tr('months','期（月）','bulan')} · ${method==='flat'?tr('Flat rate','平息','Kadar rata'):tr('Reducing balance','递减余额','Baki berkurangan')}</dd></div>
    </dl>`;
   }
   if(waBtn){
    const selectedCar=cars.find(c=>c.id===presetSelect?.value);
    const carLine=selectedCar?`\nCar: ${[selectedCar.year,selectedCar.make,selectedCar.model,selectedCar.variant].filter(Boolean).join(' ')} (Stock #${selectedCar.stockId})`:'';
    const msg=`Hi Danny, I calculated a loan estimate on your website:${carLine}\nVehicle price: ${money(price)}\nDown payment: ${down}% (${money(depositRm)})\nLoan amount: ${money(principal)}\nTenure: ${years} years at ${rate}% p.a. (${method==='flat'?'Flat rate':'Reducing balance'})\nEstimated monthly: ${money(result.monthly)}/month\nCan we discuss financing options?`;
    waBtn.href=`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
   }
  }catch(err){
   host.querySelector('#buyingLoanError').textContent=err.message;
   host.querySelector('#buyingMonthly').textContent='—';
   if(breakdownEl)breakdownEl.innerHTML='';
  }
 };
 const runTax=e=>{
  e?.preventDefault();
  const values=Object.fromEntries(new FormData(tax));
  const breakdownEl=host.querySelector('#buyingTaxBreakdown');
  try{
   const cc=Math.round(Number(values.cc)),code=values.code;
   const annual=roadTax(cc,code);
   const sixMonth=annual*0.5;
   host.querySelector('#buyingTaxResult').textContent=money(annual)+' / '+tr('year','年','tahun');
   host.querySelector('#buyingTaxError').textContent='';
   host.querySelectorAll('[data-quick-cc]').forEach(btn=>btn.classList.toggle('is-active',Number(btn.dataset.quickCc)===cc));
   if(breakdownEl){
    breakdownEl.innerHTML=`<dl class="tools-breakdown-grid">
     <div><dt>${tr('12-month LKM rate','12 个月路税','Kadar LKM 12 bulan')}</dt><dd>${money(annual)}</dd></div>
     <div><dt>${tr('6-month LKM base','6 个月路税基准','Kadar asas 6 bulan')}</dt><dd>${money(sixMonth)}</dd></div>
     <div><dt>${tr('Engine displacement','引擎排量','Kapasiti enjin')}</dt><dd>${cc.toLocaleString('en-MY')} cc</dd></div>
     <div><dt>${tr('Registration class','注册类别','Kelas pendaftaran')}</dt><dd>${esc(code)}</dd></div>
    </dl>`;
   }
  }catch(err){
   host.querySelector('#buyingTaxError').textContent=err.message;
   host.querySelector('#buyingTaxResult').textContent='—';
   if(breakdownEl)breakdownEl.innerHTML='';
  }
 };
 loan.onsubmit=runLoan;
 const clearCarSelection=()=>{if(presetSelect)presetSelect.value='';if(presetLink){presetLink.href=`${base}#inventory`;presetLink.textContent=tr('Browse showroom →','浏览现车 →','Lihat showroom →');}};
 loan.oninput=event=>{if(event.target===loan.elements.price)clearCarSelection();runLoan();};
 loan.onchange=()=>runLoan();
 tax.onsubmit=runTax;
 tax.oninput=()=>runTax();
 tax.onchange=()=>runTax();
 host.querySelectorAll('[data-quick-price]').forEach(btn=>{
  btn.onclick=()=>{
   loan.elements.price.value=btn.dataset.quickPrice;
   if(presetSelect)presetSelect.value='';
   runLoan();
  };
 });
 host.querySelectorAll('[data-quick-down]').forEach(btn=>{
  btn.onclick=()=>{
   loan.elements.down.value=btn.dataset.quickDown;
   runLoan();
  };
 });
 host.querySelectorAll('[data-quick-cc]').forEach(btn=>{
  btn.onclick=()=>{
   tax.elements.cc.value=btn.dataset.quickCc;
   runTax();
  };
 });
 if(presetSelect){
  presetSelect.onchange=()=>{
   const picked=cars.find(c=>c.id===presetSelect.value);
   if(picked){
    loan.elements.price.value=String(picked.priceRm);
    tax.elements.cc.value=String(inferEngineCc(picked));
    tax.elements.code.value=inferJpjClass(picked);
    if(presetLink){
     presetLink.href=`${base}vehicle/${encodeURIComponent(picked.id)}/`;
     presetLink.textContent=tr('View selected car →','查看该车辆 →','Lihat kereta dipilih →');
    }
   }else if(presetLink){
    presetLink.href=`${base}#inventory`;
    presetLink.textContent=tr('Browse showroom →','浏览现车 →','Lihat showroom →');
   }
   runLoan();
   runTax();
  };
 }
 runLoan();
 runTax();
}
