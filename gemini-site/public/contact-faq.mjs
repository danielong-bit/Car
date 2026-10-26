export function renderContactFaq(host,language='en',visible=true){
 if(!host)return;host.hidden=!visible;
 const tr=(en,zh,ms)=>language==='zh'?zh:language==='ms'?ms:en;
 const items=[
  [tr('Can I verify the auction report?','可以查看拍卖报告吗？','Bolehkah saya menyemak laporan lelong?'),tr('Yes. Every recond car can be reviewed with its Japanese auction grade, interior grade, mileage record and condition notes, and independent pre-purchase inspection is welcome.','可以。每辆日本进口复新车都可核对拍卖等级、内饰等级、里程记录与车况说明，也欢迎第三方验车。','Ya. Setiap kereta recond boleh disemak dengan gred lelong Jepun, gred dalaman, rekod perbatuan dan nota keadaan.')],
  [tr('How do I get a financing quote?','如何获取贷款报价？','Bagaimanakah cara mendapatkan sebut harga pembiayaan?'),tr('Use the calculator for an instant monthly estimate, then send your preferred deposit and loan tenure to Danny on WhatsApp for a bank quote.','可先用计算器估算月供，再把首付与贷款年限发给 Danny 获取银行报价。','Gunakan kalkulator untuk anggaran bulanan, kemudian hantar deposit dan tempoh pinjaman pilihan anda kepada Danny di WhatsApp.')],
  [tr('What warranty and tint options are available?','有哪些保修与隔热膜配套？','Apakah pilihan waranti dan tinted yang tersedia?'),tr('Warranty coverage and XPEL or 3M tint packages can be arranged before delivery based on the vehicle and body type.','交车前可根据车型与车身类型安排保修方案及 XPEL 或 3M 隔热膜配套。','Perlindungan waranti serta pakej tinted XPEL atau 3M boleh diatur sebelum serahan mengikut kereta dan jenis badan.')],
  [tr('How do I book a showroom viewing in Shah Alam?','如何预约 Shah Alam 看车？','Bagaimanakah cara menempah lawatan showroom di Shah Alam?'),tr('Message Danny on WhatsApp with the car or stock reference so the vehicle can be prepared for your visit in Glenmarie / Bukit Jelutong, Shah Alam.','通过 WhatsApp 发送车型或库存编号给 Danny，即可安排在 Shah Alam 看车。','Mesej Danny di WhatsApp bersama model atau rujukan stok supaya kereta dapat disediakan untuk lawatan anda di Shah Alam.')]
 ];
 const title=document.createElement('h2');title.id='faqTitle';title.textContent=tr('Frequently asked questions','常见问题','Soalan lazim');
 const list=document.createElement('div');list.className='faq-list';
 for(const [i,[q,a]] of items.entries()){
  const detail=document.createElement('details');detail.name='contact-faq';detail.open=i===0;
  const summary=document.createElement('summary');summary.textContent=q;
  const body=document.createElement('p');body.textContent=a;
  detail.append(summary,body);list.append(detail);
 }
 host.replaceChildren(title,list);
}
