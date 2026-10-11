import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const baseUrl = 'http://localhost:3000';

console.log('🚀 Running Full Master Audit & Verification Suite for Car-Recond-Japan...\n');

// 1. Check Data Files
console.log('--- 1. Testing Data Architecture & Single Source of Truth ---');
const vehiclesFile = path.join(rootDir, 'assets', 'data', 'vehicles.json');
assert.ok(fs.existsSync(vehiclesFile), 'assets/data/vehicles.json must exist');
const vehicles = JSON.parse(fs.readFileSync(vehiclesFile, 'utf8'));
assert.equal(vehicles.length, 7, 'Must have 7 verified catalog vehicles');
console.log(`✓ assets/data/vehicles.json verified with ${vehicles.length} inventory cars.`);

const siteContentFile = path.join(rootDir, 'assets', 'data', 'site-content.json');
assert.ok(fs.existsSync(siteContentFile), 'assets/data/site-content.json must exist');
const siteContent = JSON.parse(fs.readFileSync(siteContentFile, 'utf8'));
assert.equal(siteContent.salesperson.name, 'Daniel Ong', 'Consultant name must be Daniel Ong');
assert.equal(siteContent.salesperson.pillars.length, 4, 'Must have 4 service pillars');
assert.equal(siteContent.deliveries.length, 3, 'Must have 3 customer delivery stories');
assert.equal(siteContent.buyerGuides.length, 3, 'Must have 3 buyer guides');
console.log('✓ assets/data/site-content.json verified (Daniel Ong personal brand, 4 pillars, deliveries, guides).');

// 2. Check Template Contamination Fixes
console.log('\n--- 2. Testing Template Contamination Fix (Issue 4) ---');
const alphardConfig = JSON.parse(fs.readFileSync(path.join(rootDir, 'assets', 'configs', 'alphard-z.json'), 'utf8'));
const alphardString = JSON.stringify(alphardConfig);
assert.ok(!alphardString.includes('V6 TFSI'), 'Alphard config must NOT contain Audi V6 TFSI');
assert.ok(!alphardString.includes('engine_forward.mp4'), 'Alphard config must NOT copy Audi engine video');
assert.ok(alphardString.includes('A25A-FXS') || alphardString.includes('Hybrid'), 'Alphard config must have genuine 2.5L Hybrid powertrain');
console.log('✓ Toyota Alphard Z configuration verified clean of cross-vehicle Audi contamination.');

// 3. Check HTML markup & Links
console.log('\n--- 3. Testing HTML Navigation, Security & Link Consistency ---');
const indexHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
assert.ok(indexHtml.includes('id="audi-tour"'), 'index.html must contain Audi tour teaser');
assert.ok(indexHtml.includes('id="consultant"'), 'index.html must contain Daniel Ong consultant section');
assert.ok(indexHtml.includes('id="deliveries"'), 'index.html must contain customer delivery stories');
assert.ok(indexHtml.includes('id="guides"'), 'index.html must contain buyer knowledge guides');
assert.ok(!indexHtml.includes('href="admin.html"'), 'index.html footer must NOT advertise public admin studio link');
assert.ok(indexHtml.includes('wa.me'), 'index.html must have direct WhatsApp consultation buttons');
console.log('✓ index.html structure verified with all 4 new sections and secured footer.');

const adminHtml = fs.readFileSync(path.join(rootDir, 'admin.html'), 'utf8');
assert.ok(!adminHtml.includes('href="/"'), 'admin.html must NOT contain root-relative href="/" (broke on GitHub Pages)');
assert.ok(adminHtml.includes('id="adminAuthGateModal"'), 'admin.html must contain Admin Security Gate modal');
assert.ok(adminHtml.includes('id="tabMediaBtn"'), 'admin.html must contain Media Library tab');
assert.ok(adminHtml.includes('id="exportVehiclesJsonBtn"'), 'admin.html must contain Export vehicles.json button');
console.log('✓ admin.html paths and features verified (zero broken root links, security gate present).');

const calcHtml = fs.readFileSync(path.join(rootDir, 'calculator.html'), 'utf8');
assert.ok(!calcHtml.includes('Live Bank Estimates'), 'calculator.html must NOT make fake Live Bank claims');
assert.ok(calcHtml.includes('Indicative Bank Estimate'), 'calculator.html must use honest Indicative Malaysian Bank label');
assert.ok(!calcHtml.includes('Admin Studio ⚙️'), 'calculator.html must NOT advertise admin studio in top nav');
console.log('✓ calculator.html financing disclosures verified.');

// 4. Test Live Server Endpoints
console.log('\n--- 4. Testing Live HTTP Server & Authentication Middleware ---');
try {
  // Public GET
  const vehRes = await fetch(`${baseUrl}/api/vehicles`);
  assert.equal(vehRes.status, 200, 'GET /api/vehicles must return 200');
  const vehData = await vehRes.json();
  assert.equal(vehData.length, 7, 'GET /api/vehicles must return 7 vehicles');
  console.log('✓ GET /api/vehicles -> 200 OK (Public)');

  const contentRes = await fetch(`${baseUrl}/api/site-content`);
  assert.equal(contentRes.status, 200, 'GET /api/site-content must return 200');
  console.log('✓ GET /api/site-content -> 200 OK (Public)');

  // Protected without token -> 401
  const leadsUnauth = await fetch(`${baseUrl}/api/leads`);
  assert.equal(leadsUnauth.status, 401, 'GET /api/leads without token must return 401');
  console.log('✓ GET /api/leads without token -> 401 Unauthorized (Security Gate Active)');

  const publishUnauth = await fetch(`${baseUrl}/api/publish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ vehicles: [] })
  });
  assert.equal(publishUnauth.status, 401, 'POST /api/publish without token must return 401');
  console.log('✓ POST /api/publish without token -> 401 Unauthorized');

  // Protected with token -> 200
  const leadsAuth = await fetch(`${baseUrl}/api/leads`, {
    headers: { 'x-admin-token': 'admin8888' }
  });
  assert.equal(leadsAuth.status, 200, 'GET /api/leads with token must return 200');
  const leadsData = await leadsAuth.json();
  assert.ok(leadsData.success, 'leads response must be success');
  console.log('✓ GET /api/leads with x-admin-token -> 200 OK (Authorized)');

  const mediaAuth = await fetch(`${baseUrl}/api/media`, {
    headers: { 'x-admin-token': 'admin8888' }
  });
  assert.equal(mediaAuth.status, 200, 'GET /api/media with token must return 200');
  console.log('✓ GET /api/media with x-admin-token -> 200 OK (Authorized)');

  // GitHub Pages route simulation
  const ghSimRes = await fetch(`${baseUrl}/Car-Recond-Japan/`);
  assert.equal(ghSimRes.status, 200, 'GitHub Pages subpath /Car-Recond-Japan/ must serve index.html');
  console.log('✓ GitHub Pages subpath simulation route /Car-Recond-Japan/ -> 200 OK');

} catch (err) {
  console.error('Server test error:', err.message);
  process.exit(1);
}

console.log('\n======================================================');
console.log('🎉 ALL MASTER PROMPT V3 VERIFICATION CHECKS PASSED!');
console.log('======================================================');
