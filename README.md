# Danny Recon Select

Public website: https://danielong-bit.github.io/Car-Recond-Japan/

This is a GitHub Pages exhibition website. The owner explicitly chose manual
inventory editing with **no cloud database, Excel workflow or login**.

## Preview locally

Use Node.js 22.13+:

```sh
npm ci --ignore-scripts
npm run build:preview
npm run preview:local
```

Open http://127.0.0.1:4173/ and http://127.0.0.1:4173/studio/.
`/admin/` and `/admin.html` also open the same workbench.

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
