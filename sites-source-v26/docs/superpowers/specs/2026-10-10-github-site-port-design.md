# GitHub showroom port to GPT Site

## Goal

Replace the current GPT Site experience with the latest version of `danielong-bit/Car-Recond-Japan` at commit `fc48b15363d48c25c783bf142eca556813a59a1a`. The GitHub version is the product and visual source of truth. The current custom Audi hotspot flow and earlier feature discussions are out of scope unless they are present in that commit.

## User-facing experience

- Bring over the GitHub public inventory gallery, dedicated Audi experience, calculator page, admin studio, styles, and local assets.
- Preserve the repository's visible demo/sample inventory notices. The sample vehicles, prices, photos, and specifications are not verified stock, and the experience must not imply that enquiries, bookings, or payments are submitted.
- Preserve the interfaces and editor capabilities present in the pinned commit, including its updated admin studio and multi-vehicle configuration behavior. Do not add earlier requested features that are absent from the source snapshot.
- Keep the existing GPT Site project, public audience, and URL.

## Hosting and data architecture

The GitHub project is an Express app that persists configuration and uploaded media to local files. GPT Sites runs the app on Cloudflare Workers, where the process cannot rely on a writable local filesystem. Keep the GitHub interface and adapt its runtime boundary:

- Serve the public pages and admin assets through the existing Vinext/Cloudflare Worker build.
- Store editable vehicle configurations and admin-managed records in the Site's D1 database. Seed demo vehicle/configuration records from the pinned GitHub snapshot idempotently; do not seed synthetic customer leads.
- Store uploaded media in the Site's R2 bucket and serve it through a validated media route.
- Replace the GitHub Express endpoints with Worker-compatible routes. Admin reads/writes and upload operations must use the Site's existing owner authentication. Public read routes expose only published demo content needed by the pages.
- Preserve JSON import/export behavior supported by the GitHub admin UI. Validate imported data and uploads on the server; return accurate success/error responses so the editor never presents a failed write as saved.

## Scope boundaries

- Do not retain the current site's custom homepage, existing Audi hotspot interface, or current admin interface where they differ from the pinned GitHub snapshot.
- Do not import or expose synthetic customer records from repository fixtures.
- Do not add real booking, payment, messaging, or business inventory workflows. The source repository describes a demo showroom.
- Do not change the current site's audience or create a second Site.

## Migration and failure behavior

- Initial D1 seeding is repeat-safe and must not overwrite admin edits on subsequent deployments.
- D1/R2 bindings remain the only durable source for shared edits made through the deployed admin.
- Reject malformed configuration, unsupported upload content types, and oversized media with actionable errors; never silently fall back to browser-only state when the deployed server write fails.
- If the owner session is absent, protect the admin and all mutation endpoints while leaving public demo pages available.

## Acceptance criteria

1. The existing public Site URL presents the pinned GitHub experience and its demo disclosures.
2. Public gallery, Audi page, calculator, and admin screens are reachable at their expected paths.
3. Admin access and every mutation/upload route require the Site owner session.
4. Vehicle/configuration edits and uploaded media survive a page reload and a new request through D1/R2.
5. Failed writes show an error and do not show a saved/success state.
6. A fresh deployment seeds demo content once without replacing later admin edits or creating synthetic customer leads.
7. The current Site identity, public audience, and URL remain unchanged.

## Verification

Use the Sites build/package workflow and inspect the deployed public pages and protected admin flow where the authenticated browser session permits. Verify the D1 migration/seed is repeat-safe, public reads work, and unauthenticated writes are rejected. Deployment is complete only when the existing Site reports a successful published version.
