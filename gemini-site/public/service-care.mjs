import {escapeHtml as esc,translator} from './vehicle-tools.mjs';
import {icon} from './stock-icons.mjs';
import {tintPackages as defaultTintPackages} from './tint-packages.mjs';

const VLT_PRESETS=[
 {
  vlt:70,
  code:'70% VLT',
  opacity:0.18,
  irr:94,
  tser:62,
  uvr:99.9,
  cabinTemp:'-6°C',
  tag:{en:'JPJ Front Windscreen Compliant',zh:'符合 JPJ 前挡风玻璃标准',ms:'Lulus Cermin Hadapan JPJ'},
  desc:{
   en:'Crystal-clear night visibility with high infrared rejection. Ideal for front windscreens and drivers who prefer an factory-clear look.',
   zh:'夜间视野清晰透亮，同时阻隔高达 94% 红外线热量，最适合前挡风玻璃与喜欢原厂通透感的车主。',
   ms:'Penglihatan malam yang jelas dengan penolakan inframerah tinggi. Sesuai untuk cermin hadapan mengikut spesifikasi JPJ.'
  }
 },
 {
  vlt:50,
  code:'50% VLT',
  opacity:0.38,
  irr:96,
  tser:68,
  uvr:99.9,
  cabinTemp:'-8°C',
  tag:{en:'JPJ Front Side Windows Compliant',zh:'符合 JPJ 前侧窗标准',ms:'Lulus Tingkap Sisi Hadapan JPJ'},
  desc:{
   en:'Refined neutral smoked tone that cuts tropical glare while maintaining effortless side-mirror visibility in rain and night driving.',
   zh:'自然柔和的烟熏色调，有效消减马来西亚正午刺眼眩光，雨夜看后视镜依然清晰从容。',
   ms:'Tona lembut yang mengurangkan silau matahari tropika sambil mengekalkan kejelasan cermin sisi pada waktu malam.'
  }
 },
 {
  vlt:30,
  code:'30% VLT',
  opacity:0.62,
  irr:98,
  tser:74,
  uvr:99.9,
  cabinTemp:'-10°C',
  tag:{en:'Executive Rear Privacy & Glare Shield',zh:'行政级后排隐私与高效隔热',ms:'Privasi Eksekutif & Penebat Haba'},
  desc:{
   en:'Boutique showroom look with strong cabin privacy and superior heat rejection for rear passengers and leather upholstery protection.',
   zh:'展厅级高质感深色视觉，兼具出色的车厢隐私度与高效隔热，保护后排家人与真皮座椅。',
   ms:'Gaya eksklusif dengan privasi kabin tinggi serta perlindungan haba optimum untuk penumpang belakang.'
  }
 },
 {
  vlt:15,
  code:'15% VLT',
  opacity:0.82,
  irr:99,
  tser:79,
  uvr:99.9,
  cabinTemp:'-12°C',
  tag:{en:'VIP MPV / Rear Cabin Maximum Privacy',zh:'VIP 级后排高隐私 · 极致隔热',ms:'Privasi Maksimum Kabin Belakang VIP'},
  desc:{
   en:'Deep obsidian privacy shade popular on Alphard, Vellfire, and luxury SUVs for rear glass—keeping the cabin cool even parked under the sun.',
   zh:'深受 Alphard、Vellfire 及豪华 SUV 车主喜爱的曜石黑高隐私后排膜，烈日停放也能显著降低车内温度。',
   ms:'Tona gelap privasi penuh yang popular untuk MPV mewah dan SUV bagi memastikan kabin kekal sejuk di bawah matahari.'
  }
 }
];

export function renderServiceCare(host,_vehicles,lang,wa,customPackages){
 if(!host)return;
 const tr=translator(lang),asset=path=>(window.SITE_BASE||'/')+String(path||'').replace(/^\//,'');
 const activeList=(Array.isArray(customPackages)&&customPackages.length?customPackages:defaultTintPackages).filter(p=>p.published!==false);
 let brand=host.dataset.brand||'XPEL',body=host.dataset.vehicleBody||'Standard',activeVlt=Number(host.dataset.vlt||50);
 if(!VLT_PRESETS.some(x=>x.vlt===activeVlt))activeVlt=50;
 const names={Standard:tr('Standard','标准车','Standard'),Large:tr('Large','大型车','Besar'),SUV:'SUV',MPV:'MPV'};
 const money=value=>value!=null?'RM '+Number(value).toLocaleString('en-MY'):tr('Enquire','欢迎垂询','Tanya');
 function draw(){
  const categories=brand==='XPEL'?['Standard','Large','SUV','MPV']:['Standard','SUV','MPV'];if(!categories.includes(body))body='Standard';
  host.dataset.brand=brand;host.dataset.vehicleBody=body;host.dataset.vlt=String(activeVlt);
  const packages=activeList.filter(p=>p.brand===brand);
  const xpelCount=activeList.filter(p=>p.brand==='XPEL').length;
  const threeMCount=activeList.filter(p=>p.brand==='3M').length;
  const sim=VLT_PRESETS.find(x=>x.vlt===activeVlt)||VLT_PRESETS[1];
  const simWaMsg=wa([
   'Hi Danny, I tested the Window Tint Simulator on your Services page.',
   `Preferred brand: ${brand}`,
   `Vehicle category: ${body}`,
   `Selected shade: ${sim.code} (${sim.tag.en})`,
   'Please advise the best tint package and installation slot.'
  ].join('\n'));
  host.innerHTML=`<header class="tint-intro reveal-on-scroll is-visible">
   <div class="tint-intro-top">
    <p class="eyebrow">${tr('WINDOW TINTING · WITH DANNY','隔热膜配套 · DANNY 为你安排','FILEM TINGKAP · BERSAMA DANNY')}</p>
    <div class="tint-assurance-pills">
     <span>✓ ${tr('100% Authentic XPEL & 3M Authorised Film','100% 正品授权 XPEL 与 3M 隔热膜','100% Filem Tulen XPEL & 3M')}</span>
     <span>✓ ${tr('JPJ VLT Compliant Options','符合 JPJ 透光度规范','Pilihan Lulus Spesifikasi JPJ')}</span>
     <span>✓ ${tr('Dust-Free Cleanroom Installation','无尘车间专业施工','Pemasangan Bilik Bersih Bebas Habuk')}</span>
    </div>
   </div>
   <h1>${tr('Your car. A cooler next drive.','选好隔热膜，舒服出发。','Kereta anda. Pemanduan lebih selesa.')}</h1>
   <p>${tr('Choose an XPEL or 3M tint package. Preview shade levels interactively below and speak with Danny for your quote and installation slot before or after car collection.','选择 XPEL 或 3M 隔热膜配套。可在下方互动预览不同透光度（VLT）隔热效果，并向 Danny 咨询报价与提车贴膜安排。','Pilih pakej filem XPEL atau 3M. Pratonton tahap gelap VLT di bawah dan hubungi Danny untuk sebut harga serta slot pemasangan.')}</p>
   <div class="tint-process">
    <span><strong>01</strong> ${tr('Simulate VLT & choose package','预览透光度并选择配套','Simulasi VLT & pilih pakej')}</span>
    <span><strong>02</strong> ${tr('Confirm vehicle category with Danny','向 Danny 确认车型与报价','Sahkan kategori bersama Danny')}</span>
    <span><strong>03</strong> ${tr('Cleanroom installation before handover','交车前无尘施工交付','Pemasangan rapi sebelum serahan')}</span>
   </div>
  </header>

  <section class="tint-simulator-card reveal-on-scroll is-visible" aria-labelledby="tintSimTitle">
   <div class="tint-sim-header">
    <div>
     <p class="eyebrow">${tr('INTERACTIVE CABIN COMFORT & SHADE STUDIO','互动透光度（VLT）与隔热模拟器','STUDIO INTERAKTIF TONA & HABA KABIN')}</p>
     <h2 id="tintSimTitle">${tr('Compare VLT Shade & Solar Heat Rejection','实时体验不同透光度（VLT）与隔热表现','Bandingkan Tona VLT & Penolakan Haba Suria')}</h2>
    </div>
    <div class="tint-sim-shades" role="group" aria-label="${tr('Select VLT shade percentage','选择透光度比例','Pilih peratusan VLT')}">
     ${VLT_PRESETS.map(item=>`<button type="button" class="tint-vlt-btn ${item.vlt===sim.vlt?'is-active':''}" data-vlt="${item.vlt}" aria-pressed="${item.vlt===sim.vlt}"><strong>${item.vlt}%</strong><small>VLT</small></button>`).join('')}
    </div>
   </div>
   <div class="tint-sim-body">
    <div class="tint-sim-stage" style="--tint-overlay-alpha:${sim.opacity}">
     <img src="${asset('assets/audi-s5/seats_16x9.jpg')}" alt="${tr('Cabin interior preview through tinted glass','隔热膜车窗透视内饰预览','Pratonton kabin melalui cermin gelap')}" loading="eager" decoding="sync">
     <div class="tint-sim-glass-layer" aria-hidden="true"></div>
     <div class="tint-sim-stage-badges">
      <span class="tint-sim-vlt-pill">${esc(sim.code)} · ${esc(sim.tag[lang]||sim.tag.en)}</span>
      <span class="tint-sim-temp-pill">❄️ ${tr('Cabin feel','体感降温','Suhu kabin')} <strong>${esc(sim.cabinTemp)}</strong></span>
     </div>
    </div>
    <div class="tint-sim-metrics">
     <div class="tint-sim-copy">
      <h3>${esc(sim.code)} — ${esc(sim.tag[lang]||sim.tag.en)}</h3>
      <p>${esc(sim.desc[lang]||sim.desc.en)}</p>
     </div>
     <div class="tint-sim-bars">
      <div class="tint-sim-bar-row">
       <div class="tint-sim-bar-label"><span>${tr('Infrared Heat Rejection (IRR)','红外线热能阻隔率 (IRR)','Penolakan Haba Inframerah (IRR)')}</span><strong>${sim.irr}%</strong></div>
       <div class="tint-sim-bar-track"><span style="width:${sim.irr}%"></span></div>
      </div>
      <div class="tint-sim-bar-row">
       <div class="tint-sim-bar-label"><span>${tr('Total Solar Energy Rejected (TSER)','总太阳能阻隔率 (TSER)','Jumlah Tenaga Suria Ditolak (TSER)')}</span><strong>${sim.tser}%</strong></div>
       <div class="tint-sim-bar-track"><span style="width:${sim.tser}%"></span></div>
      </div>
      <div class="tint-sim-bar-row">
       <div class="tint-sim-bar-label"><span>${tr('UV Ray Protection (UVR)','紫外线阻隔率 (UVR)','Perlindungan Sinar UV (UVR)')}</span><strong>${sim.uvr}%</strong></div>
       <div class="tint-sim-bar-track"><span style="width:100%"></span></div>
      </div>
     </div>
     <div class="tint-sim-actions">
      <a class="button whatsapp-action" href="${esc(simWaMsg)}" target="_blank" rel="noopener">${icon('wa')}<span>${tr(`Ask Danny about ${sim.code} tint`,`向 Danny 咨询 ${sim.code} 隔热方案`,`Tanya Danny tentang filem ${sim.code}`)}</span>${icon('arrow')}</a>
     </div>
    </div>
   </div>
  </section>

  <div class="tint-toolbar reveal-on-scroll is-visible"><div class="tint-brands" role="group" aria-label="${tr('Tint brand','隔热膜品牌','Jenama filem')}">${['XPEL','3M'].map(name=>`<button type="button" data-brand="${name}" aria-pressed="${brand===name}"><strong class="${name==='3M'?'three-m':''}">${name}</strong><small>${name==='XPEL'?xpelCount:threeMCount} ${tr('packages','个配套','pakej')}</small></button>`).join('')}</div><div class="tint-body"><span>${tr('Vehicle category','车身类别','Kategori kereta')}</span><div role="group" aria-label="${tr('Vehicle category','车身类别','Kategori kereta')}">${categories.map(name=>`<button type="button" data-body="${name}" aria-pressed="${body===name}">${names[name]}</button>`).join('')}</div></div></div>
  <div class="tint-collection-heading reveal-on-scroll is-visible"><div><h2>${brand} ${tr('tint packages','隔热膜配套','pakej filem')}</h2><p>${tr('Prices shown for','当前价格类别：','Harga untuk')} <strong>${names[body]}</strong> · ${tr('Includes front windscreen, rear windscreen & all side windows','包含前挡、后挡与全车侧窗施工','Termasuk cermin hadapan, belakang & semua tingkap sisi')}</p></div>${brand==='3M'?`<button class="button quiet" type="button" data-poster="assets/tint/3m-tint-packages.jpg" data-title="3M ${tr('supplied price sheet','原始配套价目表','senarai harga dibekalkan')}">${icon('photo')}${tr('View original price sheet','查看原始配套价目表','Lihat senarai harga asal')} ↗</button>`:''}</div>
  ${brand==='3M'?`<div class="tint-sheet-banner reveal-on-scroll is-visible"><button type="button" data-poster="assets/tint/3m-tint-packages.jpg" data-title="3M ${tr('supplied price sheet','原始配套价目表','senarai harga dibekalkan')}"><img src="${asset('assets/tint/3m-tint-packages.jpg')}" alt="${tr('3M window tint price sheet from the supplied PDF','提供的 PDF 中的 3M 隔热膜价目表','Senarai harga filem 3M daripada PDF dibekalkan')}" loading="eager" decoding="sync"><span>${tr('Tap to enlarge','点击放大','Tekan untuk besarkan')} ⤢</span></button><div><p class="eyebrow">3M / ${tr('ORIGINAL PRICE SHEET','原始配套资料','SENARAI HARGA ASAL')}</p><h3>Crystalline BLK · Crystalline · Ceramic IR · CS</h3><p>${tr('View the supplied sheet for film options, specifications and warranty details. Choose a package below to ask Danny.','膜款、规格与保修资料可查看原始价目表。下方选择配套后，即可向 Danny 咨询。','Lihat helaian asal untuk pilihan filem, spesifikasi dan waranti. Pilih pakej di bawah untuk bertanya kepada Danny.')}</p></div></div>`:''}
  <div class="tint-grid ${brand==='3M'?'tint-grid-3m':''}">${packages.map((p,idx)=>{const price=p.prices?.[body]??p.prices?.Standard;const message=['Hi Danny, I am interested in a window tint package.',`Brand: ${p.brand}`,`Package: ${p.name}`,`Vehicle category: ${body}`,`Preferred VLT shade: ${sim.code}`,`Price on supplied package sheet: ${money(price)}`,'Please confirm the package, final quote and installation arrangements.',location.origin+location.pathname].join('\n');const specs3m=brand==='3M'&&p.code?`<div class="tint-specs" aria-label="${esc(p.name)} specifications"><div class="tint-spec-code"><span>${tr('FILM OPTIONS','膜款选择','PILIHAN FILEM')}</span><strong>${esc(p.code)}</strong></div><div class="tint-spec-grid"><div><small>VLT</small><strong>${esc(p.vlt)}</strong></div><div><small>IRR</small><strong>${esc(p.irr)}</strong></div><div><small>TSER</small><strong>${esc(p.tser)}</strong></div><div><small>UVR</small><strong>${esc(p.uvr)}</strong></div></div><div class="tint-spec-badges">${p.thickness?`<span>${esc(p.thickness)}</span>`:''}${p.warranty?`<span>${esc(p.warranty)} WARRANTY</span>`:''}</div></div>`:`<div class="tint-xpel-highlights"><span class="tint-xpel-pill">${idx===0?tr('Nano-Ceramic Flagship','纳米陶瓷旗舰级','Nano-Seramik Utama'):idx===1?tr('High Heat Rejection','高隔热安全膜','Penolakan Haba Tinggi'):tr('Balanced Clarity & UV Shield','清晰视野与防晒保护','Jelas & Perlindungan UV')}</span><span class="tint-xpel-pill">UVR 99%</span></div>`;return `<article class="tint-card reveal-on-scroll is-visible ${idx===0?'is-featured-package':''}">${brand==='XPEL'?`<button type="button" class="tint-poster" data-poster="${esc(p.image||'assets/tint/xpel-titan.jpeg')}" data-title="${esc(p.brand+' '+p.name)}"><img src="${asset(p.image||'assets/tint/xpel-titan.jpeg')}" alt="${esc('XPEL '+p.name+' '+tr('supplied package artwork','原始配套图','gambar pakej dibekalkan'))}" loading="eager" fetchpriority="high" decoding="sync"><span>${icon('photo')}${tr('View package details','查看配套详情','Lihat butiran pakej')} ⤢</span></button>`:`<div class="tint-series"><strong class="three-m">3M</strong><span>${tr('WINDOW FILM','汽车隔热膜','FILEM TINGKAP')}</span></div>`}<div class="tint-card-copy"><div class="tint-card-kicker-row"><p class="tint-card-kicker">${brand} / ${names[body]}</p>${idx===0?`<span class="tint-popular-badge">★ ${tr('Most Popular','热门首选','Paling Popular')}</span>`:''}</div><h3>${esc(p.name)}</h3>${specs3m}<div class="tint-price-block"><small>${tr('Package price for','配套价格 ·','Harga pakej')} ${esc(names[body])}</small><p class="tint-price">${money(price)}</p></div><a class="button" href="${esc(wa(message))}" target="_blank" rel="noopener" aria-label="${esc(tr('Ask Danny about','向 Danny 咨询','Tanya Danny tentang')+' '+p.brand+' '+p.name)}">${icon('wa')}${tr('Ask Danny','向 Danny 咨询','Tanya Danny')}${icon('arrow')}</a></div></article>`;}).join('')}</div><p class="tint-footnote">${tr('Prices and specifications follow the supplied package materials. Confirm your vehicle category, final price and installation slot with Danny.','价格与规格按所提供配套资料展示。车身类别、最终报价与贴膜时间请向 Danny 确认。','Harga dan spesifikasi mengikut bahan pakej dibekalkan. Sahkan kategori kereta, harga akhir dan masa pemasangan bersama Danny.')}</p>
  <dialog class="tint-dialog" aria-labelledby="tintPosterTitle"><div class="tint-dialog-head"><h2 id="tintPosterTitle"></h2><button type="button" data-close aria-label="${tr('Close image','关闭图片','Tutup gambar')}">×</button></div><img alt=""></dialog>`;
  host.querySelectorAll('[data-brand]').forEach(button=>button.onclick=()=>{brand=button.dataset.brand;draw();host.querySelector(`[data-brand="${brand}"]`)?.focus();});
  host.querySelectorAll('[data-body]').forEach(button=>button.onclick=()=>{body=button.dataset.body;draw();host.querySelector(`[data-body="${body}"]`)?.focus();});
  host.querySelectorAll('[data-vlt]').forEach(button=>button.onclick=()=>{activeVlt=Number(button.dataset.vlt);draw();host.querySelector(`[data-vlt="${activeVlt}"]`)?.focus();});
  const dialog=host.querySelector('dialog');let opener;
  host.querySelectorAll('[data-poster]').forEach(button=>button.onclick=()=>{opener=button;dialog.querySelector('h2').textContent=button.dataset.title;const img=dialog.querySelector('img');img.src=asset(button.dataset.poster);img.alt=button.dataset.title;dialog.showModal();});
  dialog.querySelector('[data-close]').onclick=()=>dialog.close();dialog.onclick=event=>{if(event.target===dialog)dialog.close();};dialog.onclose=()=>opener?.focus();
 }
 draw();
}
