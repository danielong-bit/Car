# Danny Recond Select — Showroom & Simple Inventory Workbench V2

Public website: https://danielong-bit.github.io/Car-Recond-Japan/

The production website and protected dashboard run on [Cloudflare](https://car-recond-japan.dannyreconstocklist.workers.dev/). GitHub Pages remains a public showroom and sends owner access to Cloudflare.

## Gemini AI Studio and local preview

Use Node.js 22.13 or later. You can start from the repository root or from `gemini-site/`:

```sh
npm ci --ignore-scripts
npm run dev
```

The preview server listens on `PORT` (default 3000), supports `--port`, and binds to `0.0.0.0` for Gemini AI Studio. From the repository root, the launcher installs the active project's dependencies if needed. The build finishes before the preview starts serving pages.

Open `/studio/` in the preview to edit vehicles, prices, photos, homepage content and tint packages directly. `/owner-login/`, `/admin/` and `/admin.html` also open this preview editor without redirecting to Cloudflare.

**This is a browser draft workspace, not a connection to the production account.** The editor uses a separate IndexedDB/localStorage namespace. Preview changes never publish to the live site. Use **Preview showroom** to view your saved changes on the same origin. Clearing browser data or moving to another preview URL loses access to those browser drafts, so download a backup first. Live visitor counts require the Cloudflare dashboard.

For production publication, download a site backup, sign in to the Cloudflare dashboard, import the backup under Website settings, then review and publish there. The preview cannot log in to, save to, or publish to the production account.

`npm run build:preview` creates `dist-preview/` with the editor. `npm run build:pages` keeps the GitHub Pages redirect. `npm run build:cloudflare` retains the protected production dashboard. Preview mode is rejected for any build directory other than `dist-preview/`.

## Manage stock

Open Inventory workbench from the website footer. Add a car, upload JPG/PNG/WebP
photos, select a cover and reorder with the arrow buttons. Photos are resized to
1920px at WebP quality 0.82 and stored as blobs in this browser, without base64.
Edit Auto/Manual and Available, Booked, Sold or Unavailable directly. Draft and
Archived vehicles are hidden from the public listing. Sold visibility is optional.
Prices may be empty, displaying Enquire. Auction grades are optional, never invented.
In Auction sheet & detailed specs, attach an original report as JPG, PNG, WebP or
PDF (maximum 10 MB). Reports are saved locally with the car and included in the
GitHub update ZIP. Report images keep their original resolution and bytes. Missing grades and reports are labelled as not provided.

**Save vehicle saves only in this browser.** It survives refreshes but cannot update
another visitor's browser or GitHub by itself. Preview showroom opens an explicitly
labelled local preview. Ordinary site visitors continue seeing the published snapshot.
Clearing browser data removes local edits/photos, so export your changes regularly.

## Put manual changes on GitHub

1. Click **Export GitHub update** in the workbench.
2. Extract the ZIP. It contains `data/public-site.json`,
   `data/inventory-workbench.json`, and any new `public/assets/uploads/` photos/reports.
3. Upload those folders to this repository, preserving their paths, and commit.
4. The existing GitHub Pages workflow rebuilds and publishes when `main` changes.

The ZIP is also a photo backup. Restore its `inventory-workbench.json` in Website &
profile; uploaded photos must be in the matching website folder, or retained in the
same browser. Do not put passwords, customer contact records or other private data
in this public repository or workbench. There is no server-side editing endpoint.
The small ZIP writer and its MIT license are included, so GitHub Pages can build without installing the full framework dependencies.

## Source and build

- `data/public-site.json`: published public snapshot.
- `data/inventory-workbench.json`: editable exhibition stock (including hidden statuses).
- `public/inventory-domain.mjs`: compatible old/new vehicle model and price estimate.
- `public/workbench.mjs` and `public/browser-stock.mjs`: manual browser workbench/storage.
- `public/showroom.mjs`: public filters, cards, galleries, video and comparison.
- `out/`: maintained HTML templates; the Audi page is now a normal gallery.
- `scripts/build-github-pages.mjs`: base-path-safe Pages builder.
- `public/vehicle-tools.mjs` and `public/vehicle-tools.css`: inline payment calculator
  and per-car grades/report panels. The former `/calculator/` and `/calculator.html`
  URLs redirect to the selected vehicle's calculator; there is no separate calculator UI.

The inline calculator uses the current car's stored price and the owner's fixed
example rate. Customers adjust deposit in 5% steps (with cash amount and presets)
and choose 5, 7 or 9 years. Only the estimated monthly payment is displayed.
Defaults come from Website & profile settings (7 years initially).
The rate uses the saved finance method (EIR by default). Insurance,
road tax, other costs, charts and repayment breakdowns are omitted from this UI.

Car galleries support categories, previous/next buttons, keyboard arrows, touch
swipes and enlargement. The workbench edits each photo's category. Sample stock
shows explicitly labelled example 4.5/B grades and a demonstration report; entering
real grades or uploading a report turns example mode off.

`npm run build:pages` writes `dist-pages/` at `/Car-Recond-Japan/`.
`npm run build:preview` writes `dist-preview/` at `/`.
`npm run lint`, `npm run build`, and `npm run test:inventory` run the required checks.
Generated output and third-party bundles are excluded from source lint.

## Customer enquiries

WhatsApp is prefilled with stock ID, car details, price and a link. Book a showroom
viewing opens WhatsApp with the customer-entered details; this site does not retain
customer enquiries or appointments. Danny confirms availability and viewing times.
Danny's specific Audi S5 Avant explanation stays inside its vehicle page. Public
cards preserve example-photo labels through their provenance note; no fabricated
customer quotes, grades or verified-condition claims are added.

## Window tint packages

Standalone `/services/` contains only XPEL/3M window tint packages, reached via the
Tinted navigation link. No workshop profile, maintenance, repairs or mileage form.
Six supplied XPEL posters are preserved as-is. The 3M tint price sheet is rendered
from page 2 of the supplied PDF; unrelated PDF offerings are not published.
`public/tint-packages.mjs` holds exact source prices by vehicle category.
Customers switch brand/category, enlarge source artwork, and open a car-category
and package-specific WhatsApp draft to Danny. Final arrangements remain with Danny.
