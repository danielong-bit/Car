export function renderContactFaq(host,language='en',visible=true){
 if(!host)return;host.hidden=!visible;
 const tr=(en,zh,ms)=>language==='zh'?zh:language==='ms'?ms:en;
 const items=[
 [tr('Is the car still available?','这辆车还有现货吗？','Adakah kereta masih tersedia?'),tr('Message Danny with the model or stock number to confirm current availability and final pricing before your visit.','看中车型后，把车型或库存编号发给 Danny，到店前确认现货和最终价格。','Hantar model atau nombor stok kepada Danny untuk mengesahkan ketersediaan dan harga akhir sebelum lawatan.')],
 [tr('Can I view a car in person?','可以预约到店看车吗？','Bolehkah saya melihat kereta sendiri?'),tr('Yes. Contact Danny to arrange a viewing in Bukit Jelutong, Shah Alam. Use the directions above to plan your visit.','可以。请联系 Danny 预约到 Shah Alam 的 Bukit Jelutong 看车，可使用上方导航规划路线。','Ya. Hubungi Danny untuk mengatur lawatan di Bukit Jelutong, Shah Alam. Gunakan pautan arah di atas.')],
 [tr('How do I get a financing quote?','如何取得贷款与月供报价？','Bagaimanakah saya mendapatkan sebut harga pembiayaan?'),tr('Share your preferred car, down payment and loan tenure with Danny. The website calculator is an estimate; Danny can help arrange a personalised quote.','把心仪车辆、首付和贷款年限告诉 Danny。网站计算器仅供估算，Danny 可协助安排个人报价。','Kongsi pilihan kereta, deposit dan tempoh pinjaman dengan Danny. Kalkulator laman ini ialah anggaran; Danny boleh membantu mengatur sebut harga peribadi.')],
 [tr('Can I see the original auction report?','可以查看原始拍卖报告吗？','Bolehkah saya melihat laporan lelong asal?'),tr('Ask Danny for the original report for your chosen car and discuss its condition, mileage and inspection details before deciding.','请向 Danny 索取心仪车辆的原始报告，并在决定前确认车况、里程和验车详情。','Minta laporan asal daripada Danny dan bincangkan keadaan, perbatuan serta butiran pemeriksaan sebelum membuat keputusan.')],
 [tr('Can I arrange tint with my car?','买车时可以一起安排隔热膜吗？','Bolehkah saya mengatur pemasangan filem penapis haba?'),tr('Ask Danny about available tint options and installation arrangements. Visit Services & Tint to explore the choices.','可以向 Danny 咨询现有隔热膜选择和安装安排，也可浏览 Services & Tint 了解选项。','Tanya Danny tentang pilihan filem penapis haba dan pemasangan. Lihat Services & Tint untuk mengetahui pilihan.')]
 ];
 const title=document.createElement('h2');title.id='faqTitle';title.textContent=tr('Frequently asked questions','常见问题','Soalan lazim');
 const list=document.createElement('div');list.className='faq-list';
 for(const [i,[question,answer]] of items.entries()){
  const detail=document.createElement('details');detail.name='contact-faq';detail.open=i===0;
  const summary=document.createElement('summary');summary.textContent=question;
  const body=document.createElement('p');body.textContent=answer;detail.append(summary,body);list.append(detail);
 }
 host.replaceChildren(title,list);
}
