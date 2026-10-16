# Exhibition upgrade review

The owner's final scope is a static GitHub Pages exhibition website with manual
stock editing. Database, Excel and login requirements from the uploaded prompt
were explicitly removed in chat.

## Delivered

- Direct-open /studio/, /admin/ and /admin.html workbench.
- Manual stock creation/editing; Auto/Manual; Available, Booked, Sold, Unavailable,
  Draft and Archived. Inline and bulk status changes, duplicate and safe archive/delete.
- Browser persistence; compressed multi-photo upload, progress, cover, ordering,
  replacement and removal. No image base64 or cloud storage.
- Explicit local preview and repository-ready ZIP export of JSON and new photos.
- Public filters/search/sort, compact cards, three-car comparison, grade guide,
  GPS and copy location, social logos, and vehicle-specific Danny video.
- Standard galleries/lightbox replace hotspot overlays. All 7 vehicle/stock IDs and
  original normal/feature photographs survive migration; 76 unused split text chunks
  (631,958 bytes) and old hotspot/local admin bundles are removed.
- Retained slider/chart calculator and JPJ estimator. Card estimates now match
  its effective-rate/flat-rate calculation. Defaults follow workbench settings.
- EN/ZH/MS public UI and workbench labels.

## Main source groups

- Templates: out/index.html, out/cms-vehicle.html, out/audi.html, out/workbench.html.
- Interface: public/exhibition.css, public/showroom.mjs, public/workbench.css,
  public/workbench.mjs, public/stock-icons.mjs, public/site-languages.js.
- Data: public/inventory-domain.mjs, public/browser-stock.mjs,
  lib/cms/contracts.mjs, data/public-site.json, data/inventory-workbench.json,
  lib/cms/seed.json.
- Retained calculator: public/cms-calculator-v26.js.
- Build: scripts/build-github-pages.mjs, scripts/prepare-exhibition.mjs,
  scripts/build-preview.mjs, scripts/preview-static.mjs, package scripts/lock.
- Framework routes now read static snapshots; legacy CMS write routes return 410.
- Small vendored ZIP writer with MIT license, no full dependency install required
  for the existing GitHub Pages workflow.

## Verification

- npm run build and npm run build:pages: passed.
- npm run build:preview: passed.
- npm run lint: passed with existing legacy-source warnings (0 errors).
- npm run test:inventory: 19 tests passed, including migration/visibility, grade
  parsing, calculator agreement, empty public inventory and GitHub subdirectory paths.
- Browser: added PREVIEW-ONLY test car, selected Manual, uploaded/resized two real
  test photos, changed cover, saved, refreshed, previewed the new car and exported ZIP.
- ZIP contents verified for both root and /Car-Recond-Japan/ mounts, including actual
  WebP files and canonical public/assets/uploads paths.
- Browser: Booked/Sold/Unavailable transitions and confirmation, three-car comparison,
  Chinese labels, original details/gallery/presenter, and mobile width inspected.
- 1440px desktop and 390px mobile review screenshots are in outputs/exhibition-upgrade/.
- Test-only browser stock changes were reset after verification.

## Use and publication

No login or cloud setup is needed. Open the workbench, save a car, then export the
GitHub update ZIP. Upload its data and public folders to the repository, preserving
paths. The existing Pages workflow publishes main. Local preview links use a static
shell so newly created unpublished vehicles can be previewed before a Pages build.
A browser save alone does not update the live website. Clearing browser data removes
local edits and photos, so retain exported ZIP backups. Public inventory JSON is
publicly accessible and must not contain customer contact details or secrets.

This branch is prepared for review. Production publication remains pending owner
approval, as required by the uploaded prompt. GitHub Pages provides static hosting;
no database or authentication service has been provisioned.
