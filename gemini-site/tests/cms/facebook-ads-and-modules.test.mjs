import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import {
  buildFacebookAdUrl,
  buildFacebookAdCampaignData,
  buildFacebookShareSharerUrl,
  buildMarketplaceListingFields,
  renderFacebookAdPreviewMarkup,
  generateFacebookPost,
  FB_AD_PRESETS,
  FB_COPY_LANGUAGES,
} from '../../public/facebook-post.mjs';
import {
  diagnoseVehicleForFacebook,
  buildFacebookCatalogFeed,
  injectVehicleOpenGraphHtml,
} from '../../public/facebook-catalog.mjs';
import { visitorAnalytics } from '../../visitor-analytics.mjs';
import { createGalleryPhotoCache } from '../../public/vehicle-gallery.mjs';
import {
  extraSpecificationText,
  updateExtraSpecifications,
} from '../../public/specification-editor.mjs';

test('buildFacebookAdUrl generates tracked UTM showroom URL synced with vehicle ID', () => {
  const url = buildFacebookAdUrl(
    { id: 'crown-crossover', stockId: 'CROWN-RS' },
    'https://danny.stocklist.workers.dev',
    'fb_feed_ad'
  );
  const parsed = new URL(url);
  assert.equal(parsed.pathname, '/');
  assert.equal(parsed.searchParams.get('vehicle'), 'crown-crossover');
  assert.equal(parsed.searchParams.get('utm_source'), 'facebook');
  assert.equal(parsed.searchParams.get('utm_medium'), 'paid_social');
  assert.equal(parsed.searchParams.get('utm_campaign'), 'fb_feed_ad');
  assert.equal(parsed.searchParams.get('utm_content'), 'CROWN-RS');
  assert.equal(buildFacebookAdUrl({}), '');
});

test('buildFacebookAdCampaignData reflects live vehicle status and builds WhatsApp lead URL', () => {
  const car = {
    id: 'civic-fl5',
    stockId: 'FL5-2023',
    make: 'Honda',
    model: 'Civic Type R',
    variant: 'FL5',
    year: 2023,
    priceRm: 328000,
    mileageKm: 12000,
    status: 'reserved',
    location: 'Glenmarie',
  };
  const data = buildFacebookAdCampaignData(
    car,
    { name: 'Danny', phone: '60125686528' },
    'https://danny.stocklist.workers.dev',
    { campaign: 'fb_marketplace', promoHeadline: 'Verified Grade 5A' }
  );
  assert.equal(data.isLive, true);
  assert.equal(data.status, 'reserved');
  assert.match(data.postText, /BOOKED \| HONDA CIVIC TYPE R FL5/);
  assert.match(data.postText, /Verified Grade 5A/);
  assert.match(data.postText, /utm_campaign=fb_marketplace/);
  assert.match(data.whatsappUrl, /^https:\/\/wa\.me\/60125686528\?/);
  assert.match(data.shareUrl, /^https:\/\/www\.facebook\.com\/sharer\/sharer\.php\?/);

  const soldPost = generateFacebookPost({ ...car, status: 'sold' }, { phone: '60125686528' });
  assert.match(soldPost, /SOLD \| HONDA CIVIC TYPE R FL5/);
  assert.ok(FB_AD_PRESETS.some((p) => p.id === 'fb_reels_ad'));
  assert.ok(FB_AD_PRESETS.some((p) => p.id === 'fb_whatsapp_ctwa'));
  assert.equal(FB_COPY_LANGUAGES.length, 4);
});

test('multi-language Facebook copy, Marketplace fields, and Feed/Reels/Marketplace mockups render cleanly', () => {
  const car = {
    id: 'alphard-sc',
    stockId: 'ALP-2022',
    make: 'Toyota',
    model: 'Alphard',
    variant: '2.5 SC',
    manufactureYear: 2022,
    priceRm: 268000,
    mileageKm: 19500,
    auctionGrade: '4.5',
    interiorGrade: 'A',
    transmission: 'Auto',
    body: 'MPV',
    exteriorColor: 'Pearl White',
    status: 'available',
    coverImageUrl: '/assets/alphard-z-example-v26.png',
    gallery: [{ url: '/assets/alphard-z-example-v26.png', visible: true }],
  };
  const zhCopy = generateFacebookPost(car, { name: 'Danny', phone: '60125686528' }, 'https://danny.stocklist.workers.dev', {
    lang: 'zh',
    tone: 'urgent',
    includeMonthly: true,
    finance: { rate: 3.0, tenure: 7, downPayment: 10 },
  });
  assert.match(zhCopy, /现车在售 FOR SALE \| TOYOTA ALPHARD 2\.5 SC/);
  assert.match(zhCopy, /月供约 RM/);

  const msCopy = generateFacebookPost(car, { name: 'Danny', phone: '60125686528' }, 'https://danny.stocklist.workers.dev', {
    lang: 'ms',
    includeMonthly: true,
  });
  assert.match(msCopy, /UNTUK DIJUAL \| READY STOCK/);

  const biCopy = generateFacebookPost(car, { name: 'Danny', phone: '60125686528' }, 'https://danny.stocklist.workers.dev', {
    lang: 'bi',
  });
  assert.match(biCopy, /Curated Unregistered Recond · 日本原装甄选进口现车/);

  const mp = buildMarketplaceListingFields(car, { name: 'Danny Ong', phone: '60125686528' });
  assert.equal(mp.title, '2022 Toyota Alphard 2.5 SC');
  assert.equal(mp.price, '268000');
  assert.equal(mp.mileageKm, '19500');

  const campaignData = buildFacebookAdCampaignData(car, { name: 'Danny Ong' }, 'https://danny.stocklist.workers.dev', {
    campaign: 'fb_whatsapp_ctwa',
  });
  assert.equal(campaignData.ctaLabel, 'WhatsApp Danny');
  assert.match(renderFacebookAdPreviewMarkup(campaignData, car, {}, 'feed'), /fb-mock-card is-feed/);
  assert.match(renderFacebookAdPreviewMarkup(campaignData, car, {}, 'reels'), /fb-mock-card is-reels/);
  assert.match(renderFacebookAdPreviewMarkup(campaignData, car, {}, 'marketplace'), /fb-mock-card is-marketplace/);
  assert.match(buildFacebookShareSharerUrl('https://danny.stocklist.workers.dev/?vehicle=alphard-sc', 'Alphard'), /sharer\.php/);
});

test('Meta Automotive Catalog feed, readiness diagnostics, and dynamic OpenGraph HTML injection', () => {
  const readyCar = {
    id: 'audi-s5',
    stockId: 'AUD-S5',
    make: 'Audi',
    model: 'S5',
    variant: '3.0 TFSI Sportback',
    manufactureYear: 2022,
    priceRm: 298000,
    mileageKm: 16200,
    auctionGrade: '4.5',
    interiorGrade: 'A',
    body: 'Coupe',
    transmission: 'Auto',
    fuelType: 'Petrol',
    status: 'available',
    coverImageUrl: '/assets/audi-s5/main-car-16x9.jpg',
    gallery: [
      { url: '/assets/audi-s5/main-car-16x9.jpg', visible: true },
      { url: '/assets/audi-s5/front-view.webp', visible: true },
      { url: '/assets/audi-s5/cockpit.webp', visible: true },
      { url: '/assets/audi-s5/rear-view.webp', visible: true },
    ],
  };
  const incompleteCar = {
    id: 'draft-unit',
    stockId: 'DRF-01',
    make: 'Honda',
    model: 'Civic',
    status: 'draft',
    gallery: [],
  };

  const readyDiag = diagnoseVehicleForFacebook(readyCar);
  assert.equal(readyDiag.ready, true);
  assert.equal(readyDiag.score, 100);

  const draftDiag = diagnoseVehicleForFacebook(incompleteCar);
  assert.equal(draftDiag.ready, false);
  assert.ok(draftDiag.issues.length >= 2);

  const doc = {
    vehicles: [readyCar, incompleteCar],
    profile: { name: 'Danny', location: 'Glenmarie, Shah Alam' },
    finance: { rate: 3.0, tenure: 7, downPayment: 10 },
  };
  const feed = buildFacebookCatalogFeed(doc, { origin: 'https://danny.stocklist.workers.dev' });
  assert.equal(feed.count, 1);
  assert.equal(feed.items[0].vehicle_id, 'AUD-S5');
  assert.equal(feed.items[0].price, '298000 MYR');
  assert.equal(feed.items[0].availability, 'in stock');
  assert.match(feed.csv, /id,vehicle_id,title,description/);
  assert.match(feed.csv, /298000 MYR/);

  const baseHtml = `<!doctype html><html><head><title>Danny Recond Select</title><meta name="description" content="Base"><meta property="og:type" content="website"><meta property="og:title" content="Base"><meta property="og:description" content="Base"><meta property="og:image" content="/default.png"><meta property="og:url" content="https://danny.stocklist.workers.dev/"></head><body></body></html>`;
  const rewritten = injectVehicleOpenGraphHtml(baseHtml, doc, 'https://danny.stocklist.workers.dev/?vehicle=audi-s5');
  assert.match(rewritten, /<meta property="og:type" content="product">/);
  assert.match(rewritten, /2022 Audi S5/);
  assert.match(rewritten, /product:price:amount" content="298000"/);
  assert.match(rewritten, /product:retailer_item_id" content="AUD-S5"/);
});

test('visitorAnalytics tracks Facebook Ad clicks and WhatsApp lead conversions', async () => {
  const db = new DatabaseSync(':memory:');
  const storage = {
    sql: {
      exec(query, ...params) {
        const statement = db.prepare(query);
        if (statement.columns().length) return statement.all(...params);
        statement.run(...params);
        return [];
      },
    },
  };
  const now = Date.parse('2026-10-24T12:00:00Z');
  const sessionId = '00000000-0000-4000-8000-000000000099';
  try {
    const visitRes = await visitorAnalytics(
      storage,
      new Request('https://site.test/api/analytics/visit', {
        method: 'POST',
        body: JSON.stringify({
          id: sessionId,
          country: 'MY',
          device: 'Mobile',
          s: 'facebook',
          c: 'fb_reels_ad',
          v: 'AUD-S5',
        }),
      }),
      now
    );
    assert.equal(visitRes.status, 200);

    const leadRes = await visitorAnalytics(
      storage,
      new Request('https://site.test/api/analytics/event', {
        method: 'POST',
        body: JSON.stringify({
          event: 'whatsapp_lead',
          id: sessionId,
          s: 'facebook',
          c: 'fb_reels_ad',
          v: 'AUD-S5',
        }),
      }),
      now
    );
    assert.equal(leadRes.status, 200);

    const summaryRes = await visitorAnalytics(
      storage,
      new Request('https://site.test/api/owner/analytics'),
      now
    );
    const summary = await summaryRes.json();
    assert.equal(summary.total, 1);
    assert.equal(summary.fbClicks, 1);
    assert.equal(summary.leadsTotal, 1);
    assert.equal(summary.fbLeads, 1);
    assert.equal(summary.campaigns[0].name, 'Facebook Reels Ad');
    assert.equal(summary.topAdVehicles[0].name, 'AUD-S5');
    assert.equal(summary.topLeadVehicles[0].name, 'AUD-S5');
  } finally {
    db.close();
  }
});

test('createGalleryPhotoCache caches resolved photo requests and evicts failures', async () => {
  let calls = 0;
  const cache = createGalleryPhotoCache(async (path) => {
    calls += 1;
    if (path === 'bad' && calls === 2) throw new Error('missing');
    return `blob:${path}`;
  }, () => ({decode: async () => {}}));
  const first = await cache.load('/a.webp');
  const second = await cache.load('/a.webp');
  assert.equal(first, 'blob:/a.webp');
  assert.equal(second, 'blob:/a.webp');
  assert.equal(calls, 1);
  await assert.rejects(() => cache.load('bad'), /missing/);
  assert.equal(await cache.load('bad'), 'blob:bad');
  assert.equal(calls, 3);
});

test('specification-editor roundtrips extra technical specs while preserving managed fields', () => {
  const vehicle = {
    engine: '2.4L Turbo Hybrid',
    transmission: 'Auto',
    specs: {
      Powertrain: [
        ['Engine', '2.4L Turbo Hybrid'],
        ['Drive', 'AWD'],
      ],
      Observed: [['Steering', 'RHD']],
    },
  };
  const editableText = extraSpecificationText(vehicle);
  assert.equal(editableText, 'Drive: AWD');
  const updated = updateExtraSpecifications(vehicle, 'Drive: E-Four AWD\nAudio: JBL 11-Speaker');
  assert.deepEqual(updated.Observed, [['Steering', 'RHD']]);
  assert.deepEqual(updated.Specifications, [
    ['Drive', 'E-Four AWD'],
    ['Audio', 'JBL 11-Speaker'],
  ]);
  assert.throws(() => updateExtraSpecifications(vehicle, 'Invalid Line Without Colon'), /Name: Value/);
});

test('public/workbench.mjs preserves VM extraction boundaries required by product-system tests', () => {
  const src = readFileSync(new URL('../../public/workbench.mjs', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
  assert.ok(src.match(/async function saveVehicle\([\s\S]*?(?=\nasync function upload\()/));
  assert.ok(src.match(/async function uploadStoryPhoto\([\s\S]*?(?=\nfunction render\()/));
  assert.ok(src.match(/async function exportUpdate\([\s\S]*?(?=\n\$\('#exportUpdate'\))/));
});

