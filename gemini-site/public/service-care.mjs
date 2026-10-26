import {escapeHtml as esc,translator} from './vehicle-tools.mjs';
import {icon} from './stock-icons.mjs';
import {tintPackages as defaultTintPackages} from './tint-packages.mjs';

const VLT_PRESETS=[
 {vlt:70,code:'70% VLT',opacity:.18,tag:{en:'Light',zh:'浅色',ms:'Cerah'},desc:{en:'More light comes through.',zh:'透光较多。',ms:'Lebih banyak cahaya masuk.'}},
 {vlt:50,code:'50% VLT',opacity:.38,tag:{en:'Medium',zh:'中等',ms:'Sederhana'},desc:{en:'A medium shade.',zh:'中等深浅。',ms:'Tona sederhana.'}},
 {vlt:30,code:'30% VLT',opacity:.62,tag:{en:'Dark',zh:'深色',ms:'Gelap'},desc:{en:'Less light comes through.',zh:'透光较少。',ms:'Kurang cahaya masuk.'}},
 {vlt:15,code:'15% VLT',opacity:.82,tag:{en:'Very dark',zh:'更深',ms:'Sangat gelap'},desc:{en:'The darkest preview.',zh:'此处最深的预览。',ms:'Pratonton paling gelap.'}}
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
   <h1>${tr('Window tinting','汽车隔热膜','Tinted kereta')}</h1>
   <p>${tr('Choose XPEL or 3M. Try a shade, compare packages, then ask Danny for a quote.','选择 XPEL 或 3M，看看深浅、比较配套，再向 Danny 询价。','Pilih XPEL atau 3M. Cuba tona, bandingkan pakej dan minta sebut harga Danny.')}</p>
  </header>

  <section class="tint-simulator-card reveal-on-scroll is-visible" aria-labelledby="tintSimTitle">
   <div class="tint-sim-header">
    <div>

     <h2 id="tintSimTitle">${tr('Try a tint shade','看看隔热膜深浅','Cuba tahap gelap cermin')}</h2>
    </div>
    <div class="tint-sim-shades" role="group" aria-label="${tr('Select VLT shade percentage','选择透光度比例','Pilih peratusan VLT')}">
     ${VLT_PRESETS.map(item=>`<button type="button" class="tint-vlt-btn ${item.vlt===sim.vlt?'is-active':''}" data-vlt="${item.vlt}" aria-pressed="${item.vlt===sim.vlt}"><strong>${item.vlt}%</strong><small>${esc(item.tag[lang]||item.tag.en)}</small></button>`).join('')}
    </div>
   </div>
   <div class="tint-sim-body">
    <div class="tint-sim-stage" style="--tint-overlay-alpha:${sim.opacity}">
     <img src="${asset('assets/audi-s5/seats_16x9.jpg')}" alt="${tr('Cabin interior preview through tinted glass','隔热膜车窗透视内饰预览','Pratonton kabin melalui cermin gelap')}" loading="eager" decoding="sync">
     <div class="tint-sim-glass-layer" aria-hidden="true"></div>
     <div class="tint-sim-stage-badges">
      <span class="tint-sim-vlt-pill">${esc(sim.code)} · ${esc(sim.tag[lang]||sim.tag.en)}</span>

     </div>
    </div>
    <div class="tint-sim-metrics">
     <div class="tint-sim-copy">
      <h3>${esc(sim.code)} — ${esc(sim.tag[lang]||sim.tag.en)}</h3>
      <p>${esc(sim.desc[lang]||sim.desc.en)}</p>
     </div>
     <p class="tint-shade-note">${tr('VLT means how much light passes through. Lower % = darker glass. Shade preview only; heat protection depends on the film you choose.','VLT 是透光率。数字越低，颜色越深。这里只预览深浅；隔热效果取决于所选膜款。','VLT ialah jumlah cahaya yang masuk. % lebih rendah = lebih gelap. Pratonton tona sahaja; perlindungan haba bergantung pada filem pilihan.')}</p>
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
