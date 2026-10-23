# Showroom hierarchy and first-view release

## Changes

- Restored readable footer headings in both themes and an explicit Owner dashboard entry.
- Left-aligned the hero and reduced its competing actions.
- Fixed the nested owner metric grid and its self-observing animation updates.
- Strengthened sidebar task labels while keeping supporting labels secondary.
- Fixed phone contact controls, selected tint-brand contrast and owner tint-editor overflow.
- Generated vehicle photos, price and facts in the initial HTML; refreshed public data without blocking rendering or resetting customer input.
- Read current published vehicle data on the Worker, bypassed obsolete static validators and returned 404 for unknown/removed vehicles.
- Added the dependency-install step needed by the GitHub Pages component build.

## Verification

- All 38 CMS tests passed, including first-response markup, escaping, dynamic validators and removed/unknown vehicle routes.
- GitHub Pages and Cloudflare builds passed; Wrangler deployment dry run bundled successfully.
- Browser review at 390×844 and 1254×884: home, footer, vehicle detail, Services & Tint, buying tools, and owner workspace sections.
- Verified equal-width overview metrics, readable Day/Night colors, phone navigation and no page overflow in reviewed sections.
- Anonymous `/studio/` returned 303 to login; `/api/owner/content` returned 401.
- Vehicle HTML contained real photos/title/price without the loading placeholder; static Pages asset prefixes were correct.
- Independent review findings about dynamic caching, wrong fallback vehicles and reset forms were fixed and re-reviewed.

Owner save/publish and rollback were not exercised against production data during this visual release.
