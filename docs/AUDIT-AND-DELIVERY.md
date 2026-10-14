# Danny Recon upgrade — audit and delivery record

## 1. Current website audit

Baseline: GitHub `fc48b15363d48c25c783bf142eca556813a59a1a`; Sites v18 `523ca3eee030c2b0e7372b3a90c11d56c0da2b9d`. Sites has the newer presentation and supplied customer photos. The old static source and assets remain in `out`; replaced framework routes are backed up in `docs/legacy-v18`. Previous Sites version is available for deployment rollback.

| Area | Baseline | Upgrade |
|---|---|---|
| Public showroom, filters, compare, Audi photo tour | Working, illustration data | Retained; shared published inventory |
| Old browser-only editor and local demo server | Demo only / no shared secure publication | Replaced by authenticated server CMS |
| Stock photos/specifications | Unverified; several mismatched generic images | Mismatched covers replaced by named photo placeholders; illustration data retained |
| Uploads | Browser/local previews | Stable private R2 uploads; published references become public |
| Save versus publish | Mixed browser-local behavior | Separate shared draft and public document, revision conflict detection |
| Appointments | Demo/local behavior | Private database records, requested status; no false confirmation |
| Analytics | Browser-local/demo | Actual aggregated page/detail views, not unique people |
| Financing | Flat-rate defaults and unsupported bank/insurance claims | Effective-rate reducing balance; explicit legacy comparison; manual insurance quote |
| Customer delivery gallery | Supplied photos publicly presented | Originals retained; consent status gates publication |

## 2. Changes implemented

Server-backed owner studio, multi-vehicle CRUD/status, permanent image/video library, upload progress and file validation, replace/reorder/cover/category/visibility, nondestructive framing, watermark copies, draft preview, publish validation, content versions, undo/redo, content backup, CSV/XLSX import, private cost planner, profile/homepage/theme editor, photo-hotspot editing/layout duplication, delivery consent, buyer knowledge drafts, private viewing requests and actual view counts.

New shared vehicle detail and financing routes. WhatsApp messages include vehicle, stock ID, price and page URL. Photo-only Audi experience remains. Public source excludes archived/draft cars and internal acquisition costs. Staff login uses Sites-provided trusted identity and the existing approved ADMIN_EMAIL; no public password or browser storage grants access.

## 3. Visual design improvements

White/slate/crimson default with shared theme tokens, stronger hierarchy, consistent controls and cards. Showcase photos sit above text, preserving car visibility. Car-first section order; delivery stories and salesperson trust content follow inventory. Calculator uses a paired input/result layout, saved comparisons and expandable schedule. Customer pages respond to smaller screens; the admin is designed primarily for computers.

## 4. Dashboard improvements

Overview shows total available inventory value (draft workspace, explicitly including samples), active viewing requests and public revision. D3 scale-based SVG charts show inventory values and actual 30-day model view counts. No fabricated traffic. Navigation separates vehicles, media, homepage, tours, requests, stories, brand, financing, articles, versions and advanced tools.

## 5. Data & publishing

D1 stores content, history, private requests, media metadata and daily aggregate views. R2 stores originals. Uploaded URLs do not depend on browser Blob URLs. Public pages and APIs use the published snapshot; staff previews use the draft. Same-origin checks protect mutations; unauthenticated draft access is denied. Media archiving retains originals and refuses published references. No legacy local demo write endpoints remain active.

## 6. Tests and verification

11 unit checks passed: authorization, stable URLs, public/private projection, duplicate stock IDs, publishing requirements, consent, unsafe markup, JPJ band examples, zero-interest repayment, reducing-balance reconciliation, legacy comparison and invalid inputs. TypeScript check passed. Production build passed during implementation; final build/public deployment results must be recorded separately.

Local integration passed with a dedicated test vehicle: three uploaded JPEGs private before publication; draft absent publicly; reordered cover/mobile framing/new price visible to a separate unauthenticated HTTP session; public costs excluded; revision conflict returns 409; viewing request stored as requested; private request endpoint returns 401; archived detail and media return 404; original illustration catalogue restored. This is local shared-backend verification, not a claim of testing two physical devices or hosted owner login.

Browser checks observed protected staff sign-in, owner overview charts, vehicle editor, actual file-chooser upload with permanent success status, detail page and calculator saved-comparison/amortization interaction. Hosted tests and responsive results are recorded after publication. No lender API, actual WhatsApp send or email notification was tested or sent.

## 7. Photo request checklist

| Content | Existing suitability | Needed |
|---|---|---|
| Audi exterior / part photos | Good demonstration of viewer; facts and origin unverified | Exact stock photographs and documented specs |
| Alphard, RX, GT-R, Civic, Crown, LM covers | Neutral photo placeholders; old mismatched illustrations preserved outside live catalogue | Add each named real vehicle’s own cover |
| Each real stock gallery | Incomplete | Front/rear three-quarter, sides, dashboard, seats, boot, engine, wheels, notable features |
| Danny portrait | Supplied casual photo retained | Bright showroom portrait and horizontal salesperson-with-car photograph |
| Delivery photos 1–6 | Suitable authentic collection-day material supplied by owner | Actual customer permission, correct vehicle model, optional date; no invented reviews |
| Videos | Optional, none automatically added | Real walkaround MP4; customer interview only with permission |

Shoot level, in consistent daylight, without text over the car. Keep faces and vehicle in frame. Do not reuse delivery vehicles as available stock without checking ownership/availability. Avoid exposing identity/registration documents. Upload originals; arrange exterior first, then interior and details; set separate mobile focal point.

## 8. Simple owner instructions

See `OWNER-GUIDE.md` for the 12 daily tasks and recovery steps. The key workflow is Edit → Save draft → Preview → Publish. A saved draft does not change the public site.

## 9. Remaining issues / scope limits

- Existing catalogue is illustrative, not independently verified business stock; genuine vehicle records/photos are required from Danny.
- Supplied delivery images start pending consent; factual approval is an owner task.
- JPJ automatic estimate supports Peninsular private petrol/diesel AB/AC/AD/AE only. EV, other regions and special classes use confirmed quotes. Sources: [JPJ current guidance](https://www.jpj.gov.my/pusat-media-3/informasi-perkhidmatan-jpj/kenderaan/panduan-pengiraan-kadar-lkm/) and its linked petrol/diesel schedule, sections 1.1.2–1.1.4. No engine-size inference or generic company multiplier.
- [SKP 2026 reform notice](https://www.skp.gov.my/en/news/media-releases/hire-purchase-amendment-act-2026-to-take-effect-on-1-june-2026) supports the reducing-balance/effective-rate method and provider transition caveat. No live lender quotes, approvals or insurance tariffs.
- Appointment notifications, multi-staff roles, advanced CRM notes/reminders, bot protection beyond basic submission throttling, automated image derivatives and richer tour presets are future additions. MP4 plays on demand; video transcoding/streaming optimization is not included.
- Version restore restores content into draft. Media archive is recoverable storage, but there is no owner-facing bulk media purge. Backup export contains content/URLs, not a copy of all R2 originals.
- CSV and modern XLSX first-sheet import supported; old XLS and macros unsupported.

## 10. Recommended next phase

Populate and review real inventory; record delivery permissions; confirm staff login on the hosted site; add secure enquiry notifications and a proper staff role/CRM workflow if needed. Then media optimization, richer SEO/structured vehicle data and analytics with bot filtering. Advanced recommendation/matching features remain optional, after reliable daily publishing is established.

## Publication compatibility repair

Sites v19 failed before switching the live Worker because legacy `vehicle_media` already existed. The failed, unrecorded hosted migration is repaired in the next source version with schema-only `IF NOT EXISTS` statements, preserving old tables and any partially created CMS tables. No DROP, table reset or customer data deletion. Local replay of the repaired migration checks compatibility with already existing tables. Original failed SQL is retained in `docs/legacy-v18/failed-v19-migration.sql.txt`.
