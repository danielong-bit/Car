# Japan Recon Car Gallery

An interactive demo showroom based on the latest Gemini build. All inventory, prices, specifications, photos and videos are demonstration content, not verified stock. No enquiry, booking or payment is submitted.

## GitHub Pages

Open `index.html` for a compact photo-only inventory gallery and `audi.html` for the interactive Audi tour. The homepage has no car hotspots, video playback, or zoom. Share the dedicated `audi.html` URL directly with customers. On phones, the photo stays clear of hotspot and text overlays; large part buttons below the photo open each view. Optional part specifications are collapsed. Pages are static; the demo editor saves changes in the current browser only. Shared uploads and settings require the Node server. The editor is linked as **Manage demo** in the footer.

## Run locally

```bash
npm install
npm start
```

Open http://localhost:3000/. The server provides `/audi`, `/admin`, config persistence and uploads. Runtime files and dependencies are ignored by Git. The editor APIs are intended for a local demo and are not authenticated; add access control before hosting that backend publicly.

## Improvements

- Search by make/model and filter by body, year, mileage and power; clear empty-result filters in one click.
- Mobile navigation, UI UX Pro Max showroom styling, self-hosted fonts, and system light/dark themes. Dedicated tours retain feature shortcuts, zoom buttons, and cancellable viewer transitions.
- Loading feedback and photo fallback for video failures; gallery arrows and keyboard navigation.
- Original image dimensions retained in high-quality JPEGs; videos use browser-compatible H.264 with fast-start playback. Clips load on demand.

## Verification

`npm test` checks JavaScript syntax and referenced local assets. Browser regression checks in `tests/browser-smoke.cjs` cover searching, comparisons, media cancellation/recovery, gallery navigation and mobile layout. `tests/phone-tour.cjs` checks real touch taps, unobscured media, nearby 60px part controls and returning to the car on five small-screen widths.

## Current hosted Site source

The current full-stack Sites version is preserved in [sites-source-v26](sites-source-v26/README.md). The repository root remains the separate GitHub Pages demo, so this source snapshot does not change that page. The Sites app uses server routes and the existing Sites storage bindings; GitHub Pages alone cannot run those features.
