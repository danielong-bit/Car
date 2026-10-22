# Owner workflow refinement — 22 October 2026

## Implemented
- Approved finesse-brief architecture retained in `.workbench/spec-owner-refinement.md`.
- Public header: Home / Inventory / Services & Tint / Contact. Calculator remains in vehicle details and the footer.
- Theme-aware accessible language picker: English, Simplified Chinese, Malay, keyboard arrows, Escape and focus return.
- Day footer text, delivery cards, cover upload button, photos, reports and tint editor surfaces use the shared theme.
- Grouped owner navigation and one-at-a-time delivery editors replace the wall of simultaneous forms.
- Vehicle, handover, homepage, tint package and settings save actions can publish their own content directly. Private drafts remain available; full publication is under Advanced.
- Server merges scoped changes into the last published snapshot or committed public baseline. Unrelated drafts remain private, including after reload. Existing public delivery consent is retained during first publication.
- Concurrent vehicle navigation/save is blocked and the clicked vehicle ID is captured before awaiting storage.
- Versioned asset URLs prevent old CSS from being combined with new markup; theme bootstrap no longer gets overwritten by the bundled content theme.

## Verification
- 51 automated tests pass, including authenticated publication/readback, private draft isolation, baseline preservation, conflicts, media, rollback and delayed-save target isolation.
- Cloudflare and GitHub Pages static builds pass.
- On the live Cloudflare owner page, delivery card surface measured white with navy text in Day, and RGB(18,31,50) with near-white text in Night. Cover upload action measured white/navy in Day.
- Live public footer branding/group headings measured RGB(20,35,59) in Day. Services & Tint is present in the header and Calculator & JPJ is present in the footer.
- Language selection changed public navigation to Chinese and back; ArrowDown opened the picker and Escape closed it with focus returned to the trigger.
- Public 390px layout checked without horizontal overflow; mobile navigation exposes the four intended links.
- Owner delivery list also checked at 390px: document scroll width 375px, with the secondary navigation scrolling inside its own row. Narrow-screen section heading/actions now stack.
- Browser policy denied the localhost preview origin. It was not bypassed. Publication behavior was exercised by in-process Worker tests, while visual/interaction checks used the existing authorized production origin. No test price/photo changes were published to production.
- Independent review identified baseline handover metadata, pending-draft status, footer link replacement and a delayed-save race. These were fixed and reviewed again with no remaining important findings.

## Scope
Content saves use the existing Cloudflare storage and are read by the GitHub Pages public frontend. This does not create independent GitHub hosting/backend infrastructure if Cloudflare is discontinued. Destructive operations and publication of all drafts retain their explicit review steps. Existing owner authentication remains in place.

Cloudflare release: `d792fd17-cb57-4aca-9c38-b931f9106287`. Final asset revision: `owner-20261022c`.
