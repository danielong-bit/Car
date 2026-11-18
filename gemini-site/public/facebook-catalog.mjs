// Shared Meta Commerce Manager / Automotive Inventory Ads catalog builder,
// readiness diagnostics, and dynamic Facebook OpenGraph HTML injector.

import {estimate} from './inventory-domain.mjs';

const DEFAULT_ORIGIN = 'https://danny.stocklist.workers.dev';

function clean(value) {
  return String(value ?? '').replace(/[\r\n]+/g, ' ').trim();
}

function escapeAttr(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

export function resolveAbsoluteUrl(rawUrl, origin = DEFAULT_ORIGIN) {
  const value = clean(rawUrl);
  if (!value) return '';
  if (/^https?:\/\//i.test(value)) return value;
  const base = clean(origin || DEFAULT_ORIGIN).replace(/\/+$/, '');
  return `${base}${value.startsWith('/') ? value : '/' + value}`;
}

function parseMileageNumber(vehicle) {
  if (vehicle?.mileageKm != null && Number.isFinite(Number(vehicle.mileageKm))) {
    return Math.max(0, Math.round(Number(vehicle.mileageKm)));
  }
  const match = String(vehicle?.mileage || '').replace(/,/g, '').match(/(\d+)/);
  return match ? Number(match[1]) : null;
}

function visiblePhotos(vehicle) {
  const fromGallery = Array.isArray(vehicle?.gallery)
    ? vehicle.gallery
        .filter(item => item && item.visible !== false && !item.video && clean(item.url))
        .map(item => clean(item.url))
    : [];
  if (Array.isArray(vehicle?.gallery)) return fromGallery;
  if (Array.isArray(vehicle?.galleryUrls) && vehicle.galleryUrls.length) {
    return vehicle.galleryUrls.map(clean).filter(Boolean);
  }
  if (clean(vehicle?.coverImageUrl)) return [clean(vehicle.coverImageUrl)];
  return [];
}

export function diagnoseVehicleForFacebook(vehicle) {
  const v = vehicle || {};
  const issues = [];
  const warnings = [];
  const photos = visiblePhotos(v);
  const price = v.priceRm ?? v.price;
  const numericPrice = price != null && price !== '' && Number.isFinite(Number(price)) ? Number(price) : null;
  const km = parseMileageNumber(v);

  if (!clean(v.make || v.brand) || !clean(v.model)) {
    issues.push('Missing make or model');
  }
  if (!clean(v.stockId || v.id)) {
    issues.push('Missing Stock ID');
  }
  if (!photos.length) {
    issues.push('Missing cover photograph');
  }
  if (v.status !== 'sold' && (numericPrice == null || numericPrice <= 0)) {
    issues.push('Missing numeric price (RM) required by Meta Catalog');
  }
  if (!['available', 'reserved', 'sold'].includes(v.status)) {
    issues.push('Not published (Draft / Archived)');
  }

  if (photos.length > 0 && photos.length < 4) {
    warnings.push(`Only ${photos.length} photo(s) — 4+ recommended for Carousel Ads`);
  }
  if (km == null) {
    warnings.push('Mileage (km) missing');
  }
  if (!clean(v.auctionGrade) && v.conditionType === 'Recond') {
    warnings.push('Auction grade not set');
  }
  if (v.conditionExample) {
    warnings.push('Using example grade notice');
  }

  const penalty = issues.length * 30 + warnings.length * 8;
  const score = Math.max(0, Math.min(100, 100 - penalty));

  return {
    ready: issues.length === 0,
    score,
    photoCount: photos.length,
    hasPrice: numericPrice != null && numericPrice > 0,
    issues,
    warnings,
  };
}

function normalizeBodyStyle(body = '') {
  const u = clean(body).toUpperCase();
  if (u === 'MPV' || u === 'MINIVAN' || u === 'VAN') return 'MINIVAN';
  if (u === 'SUV' || u === 'CROSSOVER') return 'SUV';
  if (u === 'COUPE') return 'COUPE';
  if (u === 'CONVERTIBLE' || u === 'CABRIOLET' || u === 'ROADSTER') return 'CONVERTIBLE';
  if (u === 'HATCHBACK') return 'HATCHBACK';
  if (u === 'WAGON' || u === 'ESTATE' || u === 'AVANT') return 'WAGON';
  return u === 'SEDAN' ? 'SEDAN' : '';
}

function normalizeTransmission(trans = '') {
  if (/manual|\b\d?mt\b/i.test(clean(trans))) return 'MANUAL';
  return /auto|cvt|dct|dsg/i.test(clean(trans)) ? 'AUTOMATIC' : '';
}

function normalizeFuelType(fuel = '', engine = '') {
  const combined = `${clean(fuel)} ${clean(engine)}`.toLowerCase();
  if (combined.includes('plug-in') || /\bphev\b/.test(combined)) return 'PLUGIN_HYBRID';
  if (/\b(electric|ev|bev)\b/.test(combined)) return 'ELECTRIC';
  if (combined.includes('hybrid')) return 'HYBRID';
  if (combined.includes('diesel')) return 'DIESEL';
  return /petrol|gasoline/i.test(combined) ? 'GASOLINE' : '';
}

export function buildFacebookCatalogItem(vehicle, origin = DEFAULT_ORIGIN, finance = {}) {
  const v = vehicle || {};
  const photos = visiblePhotos(v).map(u => resolveAbsoluteUrl(u, origin)).filter(Boolean);
  const year = v.manufactureYear || v.year || null;
  const make = clean(v.make || v.brand || 'Recon');
  const model = clean(v.model || 'Vehicle');
  const trim = clean(v.variant || '');
  const title = [year, make, model, trim].filter(Boolean).join(' ');
  const rawPrice = v.priceRm ?? v.price;
  const numericPrice = rawPrice != null && Number.isFinite(Number(rawPrice)) && Number(rawPrice) > 0
    ? Math.round(Number(rawPrice))
    : 0;
  const monthly = numericPrice > 0 ? estimate({ priceRm: numericPrice }, finance) : null;
  const km = parseMileageNumber(v);
  const availability = v.status === 'sold'
    ? 'out of stock'
    : v.status === 'reserved'
      ? 'available for order'
      : 'in stock';
  const stockRef = clean(v.stockId || v.id);
  const landingUrl = `${clean(origin || DEFAULT_ORIGIN).replace(/\/+$/, '')}/?vehicle=${encodeURIComponent(v.id || stockRef)}&utm_source=facebook&utm_medium=catalog&utm_campaign=fb_automotive_catalog&utm_content=${encodeURIComponent(stockRef)}`;

  const gradeText = [clean(v.auctionGrade), clean(v.interiorGrade)].filter(Boolean).join('/');
  const summaryParts = [
    `${title} (${clean(v.conditionType || 'Used')})`,
    km > 0 ? `${km.toLocaleString('en-MY')} km` : '',
    gradeText && !v.conditionExample ? `Auction Grade ${gradeText}` : '',
    clean(v.exteriorColor || v.color),
    monthly ? `Est. RM ${monthly.toLocaleString('en-MY')}/month` : '',
    clean(v.description || v.sub || ''),
    `Showroom: ${clean(v.location || 'Glenmarie / Bukit Jelutong, Shah Alam')}. Stock #${stockRef}.`,
  ].filter(Boolean);

  return {
    id: stockRef,
    vehicle_id: stockRef,
    title,
    description: summaryParts.join(' · ').slice(0, 4900),
    availability,
    condition: 'used',
    state_of_vehicle: 'USED',
    price: numericPrice > 0 ? `${numericPrice} MYR` : '0 MYR',
    price_amount: numericPrice,
    currency: 'MYR',
    link: landingUrl,
    url: landingUrl,
    image_link: photos[0] || '',
    additional_image_link: photos.slice(1, 11).join(','),
    brand: make,
    make,
    model,
    trim,
    year: Number(year) || '',
    'mileage.value': km,
    'mileage.unit': 'KM',
    body_style: normalizeBodyStyle(v.body),
    transmission: normalizeTransmission(v.transmission),
    fuel_type: normalizeFuelType(v.fuelType, v.engine),
    exterior_color: clean(v.exteriorColor || v.color),
    interior_color: clean(v.interiorColor || ''),
    drivetrain: /awd|4wd|quattro|4matic/i.test(`${v.variant || ''} ${JSON.stringify(v.specs || {})}`) ? 'AWD' : 'Other',
    address: JSON.stringify({
      addr1: 'U8, Metropolitan Business Park, Bukit Jelutong',
      city: 'Shah Alam',
      region: 'Selangor',
      postal_code: '40150',
      country: 'MY',
    }),
    custom_label_0: gradeText && !v.conditionExample ? `Grade ${gradeText}` : '',
    custom_label_1: monthly ? `RM ${monthly.toLocaleString('en-MY')}/mo` : '',
    custom_label_2: clean(v.status || 'available').toUpperCase(),
  };
}

export const CATALOG_CSV_COLUMNS = [
  'id',
  'vehicle_id',
  'title',
  'description',
  'availability',
  'condition',
  'state_of_vehicle',
  'price',
  'link',
  'url',
  'image_link',
  'additional_image_link',
  'brand',
  'make',
  'model',
  'trim',
  'year',
  'mileage.value',
  'mileage.unit',
  'body_style',
  'transmission',
  'fuel_type',
  'exterior_color',
  'custom_label_0',
  'custom_label_1',
  'custom_label_2',
];

function csvCell(value) {
  const str = String(value ?? '');
  if (/[",\r\n]/.test(str)) {
    return `"${str.replaceAll('"', '""')}"`;
  }
  return str;
}

export function buildFacebookCatalogFeed(doc, originOrOptions = DEFAULT_ORIGIN, maybeOptions = {}) {
  const isOptionsObject = originOrOptions && typeof originOrOptions === 'object';
  const origin = isOptionsObject ? (originOrOptions.origin || DEFAULT_ORIGIN) : (originOrOptions || DEFAULT_ORIGIN);
  const { includeSold = false } = isOptionsObject ? originOrOptions : (maybeOptions || {});
  const vehicles = Array.isArray(doc?.vehicles) ? doc.vehicles : [];
  const finance = doc?.finance || {};
  const diagnostics = vehicles
    .filter(v => v && v.status !== 'archived')
    .map(v => ({
      id: v.id,
      stockId: v.stockId,
      title: [v.manufactureYear || v.year, v.make || v.brand, v.model].filter(Boolean).join(' '),
      status: v.status,
      ...diagnoseVehicleForFacebook(v),
    }));

  const eligible = vehicles.filter(v => {
    if (!v || !['available', 'reserved', ...(includeSold ? ['sold'] : [])].includes(v.status)) return false;
    return diagnoseVehicleForFacebook(v).ready;
  });

  const items = eligible.map(v => buildFacebookCatalogItem(v, origin, finance));
  const headerRow = CATALOG_CSV_COLUMNS.join(',');
  const dataRows = items.map(item => CATALOG_CSV_COLUMNS.map(col => csvCell(item[col])).join(','));
  const csv = [headerRow, ...dataRows].join('\r\n') + '\r\n';

  const readyCount = diagnostics.filter(d => d.ready).length;
  const attentionCount = diagnostics.filter(d => !d.ready).length;
  const avgScore = diagnostics.length
    ? Math.round(diagnostics.reduce((sum, d) => sum + d.score, 0) / diagnostics.length)
    : 100;

  return {
    count: items.length,
    items,
    csv,
    diagnostics,
    stats: {
      totalActive: diagnostics.length,
      catalogReady: readyCount,
      exportedCount: items.length,
      needsAttention: attentionCount,
      averageScore: avgScore,
      generatedAt: new Date().toISOString(),
    },
  };
}

export function findVehicleByQueryOrPath(doc, pathname = '/', searchParams = null) {
  const list = Array.isArray(doc?.vehicles) ? doc.vehicles : [];
  if (!list.length) return null;
  let key = '';
  if (searchParams) {
    const sp = searchParams instanceof URLSearchParams ? searchParams : new URLSearchParams(String(searchParams));
    key = clean(sp.get('vehicle') || sp.get('car'));
  }
  if (!key && pathname) {
    const match = String(pathname).match(/^\/(?:vehicle|stock)\/([^/?#]+)/i);
    if (match?.[1]) key = decodeURIComponent(match[1]);
  }
  if (!key) return null;
  const lower = key.toLowerCase();
  return list.find(v => String(v.id || '').toLowerCase() === lower || String(v.stockId || '').toLowerCase() === lower) || null;
}

export function buildVehicleOpenGraphMeta(vehicle, doc = {}, origin = DEFAULT_ORIGIN, requestUrl = '') {
  if (!vehicle) return null;
  const year = vehicle.manufactureYear || vehicle.year || '';
  const make = clean(vehicle.make || vehicle.brand || '');
  const model = clean(vehicle.model || '');
  const variant = clean(vehicle.variant || '');
  const carTitle = [year, make, model, variant].filter(Boolean).join(' ');
  const rawPrice = vehicle.priceRm ?? vehicle.price;
  const numericPrice = rawPrice != null && Number.isFinite(Number(rawPrice)) && Number(rawPrice) > 0 ? Math.round(Number(rawPrice)) : null;
  const statusTag = vehicle.status === 'sold' ? 'SOLD' : vehicle.status === 'reserved' ? 'BOOKED' : numericPrice ? `RM ${numericPrice.toLocaleString('en-MY')}` : 'Enquire';
  const monthly = numericPrice && vehicle.status === 'available' ? estimate({ priceRm: numericPrice }, doc?.finance || {}) : null;

  const title = `${carTitle} · ${statusTag} | Danny Recond Select`;
  const km = parseMileageNumber(vehicle);
  const grade = [clean(vehicle.auctionGrade), clean(vehicle.interiorGrade)].filter(Boolean).join('/');
  const specs = [
    vehicle.conditionType === 'Recond' ? 'Japan Recond' : clean(vehicle.conditionType),
    km != null ? `${km.toLocaleString('en-MY')} km` : clean(vehicle.mileage),
    grade && !vehicle.conditionExample ? `Grade ${grade}` : '',
    monthly ? `Est. RM ${monthly.toLocaleString('en-MY')}/mo` : '',
    clean(vehicle.exteriorColor || vehicle.color),
  ].filter(Boolean).join(' · ');

  const description = `${carTitle} (${statusTag})${specs ? ` — ${specs}` : ''}. Stock #${clean(vehicle.stockId || vehicle.id)} at Danny Recond Select, Shah Alam.`;
  const photos = visiblePhotos(vehicle);
  const imageUrl = resolveAbsoluteUrl(photos[0] || '/assets/audi-s5/main-car-16x9.jpg', origin);
  const canonicalUrl = `${clean(origin).replace(/\/+$/, '')}/?vehicle=${encodeURIComponent(vehicle.id || vehicle.stockId)}`;
  const availability = vehicle.status === 'sold' ? 'oos' : vehicle.status === 'reserved' ? 'pending' : 'instock';

  return {
    title,
    description,
    imageUrl,
    canonicalUrl,
    brand: make || 'Recond',
    priceAmount: numericPrice,
    currency: 'MYR',
    availability,
    retailerItemId: clean(vehicle.stockId || vehicle.id),
  };
}

export function injectVehicleOpenGraphHtml(html, vehicle, doc = {}, origin = DEFAULT_ORIGIN, requestUrl = '') {
  let targetVehicle = vehicle;
  let targetDoc = doc;
  let targetOrigin = origin;
  let targetUrl = requestUrl;
  if (Array.isArray(vehicle?.vehicles) && typeof doc === 'string') {
    targetDoc = vehicle;
    targetUrl = doc;
    try {
      const parsed = new URL(doc, DEFAULT_ORIGIN);
      targetOrigin = parsed.origin;
      targetVehicle = findVehicleByQueryOrPath(targetDoc, parsed.pathname, parsed.searchParams);
    } catch {
      targetVehicle = null;
    }
  }
  const meta = buildVehicleOpenGraphMeta(targetVehicle, targetDoc, targetOrigin, targetUrl);
  if (!meta || typeof html !== 'string') return html;

  let out = html;
  out = out.replace(/<title>[^<]*<\/title>/i, `<title>${escapeAttr(meta.title)}</title>`);
  out = out.replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/?>/gi, `<meta name="description" content="${escapeAttr(meta.description)}">`);
  out = out.replace(/<meta\s+property="og:type"\s+content="[^"]*"\s*\/?>/gi, '<meta property="og:type" content="product">');
  out = out.replace(/<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/gi, `<meta property="og:title" content="${escapeAttr(meta.title)}">`);
  out = out.replace(/<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/gi, `<meta property="og:description" content="${escapeAttr(meta.description)}">`);
  out = out.replace(/<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>/gi, `<meta property="og:image" content="${escapeAttr(meta.imageUrl)}">`);
  out = out.replace(/<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/gi, `<meta property="og:url" content="${escapeAttr(meta.canonicalUrl)}">`);
  out = out.replace(/<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/gi, `<meta name="twitter:title" content="${escapeAttr(meta.title)}">`);
  out = out.replace(/<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/gi, `<meta name="twitter:description" content="${escapeAttr(meta.description)}">`);
  out = out.replace(/<meta\s+name="twitter:image"\s+content="[^"]*"\s*\/?>/gi, `<meta name="twitter:image" content="${escapeAttr(meta.imageUrl)}">`);

  const productTags = [
    `<meta property="product:brand" content="${escapeAttr(meta.brand)}">`,
    `<meta property="product:availability" content="${escapeAttr(meta.availability)}">`,
    `<meta property="product:condition" content="used">`,
    `<meta property="product:retailer_item_id" content="${escapeAttr(meta.retailerItemId)}">`,
    ...(meta.priceAmount != null
      ? [
          `<meta property="product:price:amount" content="${escapeAttr(meta.priceAmount)}">`,
          `<meta property="product:price:currency" content="MYR">`,
        ]
      : []),
  ].join('');

  if (out.includes('</head>')) {
    out = out.replace('</head>', `${productTags}</head>`);
  }
  return out;
}
