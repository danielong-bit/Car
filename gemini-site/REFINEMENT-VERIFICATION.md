# Refinement verification — 21 October 2026

## Scope and decisions
The showroom, vehicle pages, buying tools, owner login and workbench share navy/white/royal-blue tokens and local sans typography. User-selected appearance persists across pages and tabs; system preference is used until a manual selection. Tablet inventory uses two columns to preserve readable metadata. Mobile footer link groups collapse. The old footer video was removed to reduce weight and keep both themes consistent.

The dashboard prioritizes real inventory and everyday tasks. It has Overview, Vehicles, Media Library, Homepage Editor, Deliveries, Tint Packages, Calculator & JPJ, Settings and Advanced Studio. It deliberately contains no invented revenue charts, customer counts, tracking map or fake enquiry inbox. Customer conversations remain in WhatsApp; the site does not store those messages.

## Automated checks
`node --test gemini-site/tests/cms/*.test.mjs gemini-site/tests/refinement/*.test.mjs`

Result: **45 passed, 0 failed**. Includes existing inventory/finance/gallery tests and new content-storage, theme, private-field projection, media access, publication/rollback, revision-conflict, session tampering, CSRF, failed-login and rate-limit checks.

Module syntax checks and static Cloudflare build passed. GitHub Pages output retains its mount path and redirects owner routes to Cloudflare.

## Browser checks (local Worker runtime)
| Area | Evidence |
| --- | --- |
| Homepage themes | Light and Dark toggles update actual computed surface/text colors. |
| Dashboard themes | The public preference is retained on entry; Light overview and Dark overview both inspected. |
| Login themes | Light and Dark mode switch; Malay login title follows the saved language. |
| Persistence | Theme survives route changes. A saved homepage headline survives reload and reopening the editor. |
| Desktop | Public inventory, tools and owner overview inspected. |
| Tablet/mobile | Owner workspace overflow corrected; 390px viewport and 864px layout checked. |
| Footer | Native link groups expand/collapse; collapsed mobile footer ~371px. Copyright bottom 745px, floating contact top 782px in the checked view. |
| Floating contact | Official icon restored in mobile header; safe-area spacing retained; comparison bar shifts contact button upward. |
| Languages | EN, Chinese and Malay checked on public/tools routes. Owner UI translations expanded; login language selector provided. |
| Vehicle edit/publish | Local test vehicle price changed, saved to cloud draft, published, then read through a newly opened public vehicle route. |
| Photos | A real local image uploaded to server media; set as cover, framing adjusted, saved and seen in the published gallery (12 photos). |
| Homepage editor | Headline edited and cloud draft saved; reload retained it. |
| Loan/JPJ | Tool uses the same configured loan method as vehicle estimates. 1,998cc AB returns RM379; boundary cases tested. |
| Comparison | Two mobile checkboxes selected and the comparison dialog opened with two vehicle columns. Old mobile disabling logic removed. |
| Authentication | Owner login/logout and legacy admin route protection checked; mobile logout remains accessible. |

All test prices, images and headlines above were used only in the isolated local content store. They are not the production inventory.

## JPJ source
Official JPJ schedule, sections 1.1.2–1.1.4:
https://www.jpj.gov.my/wp-content/uploads/2022/11/Garis-Panduan-Pengiraan-LKM-Bajet-20092.pdf

The tool explicitly limits applicability to Peninsular private petrol/diesel vehicle classes AB/AC/AD/AE. It does not apply those rates to EVs, East Malaysia, islands or other classes. Financing remains an estimate rather than a bank offer.

## Implementation limits
- New live content publication targets the existing Cloudflare website. The legacy GitHub Pages front end can read published public content, and its owner routes redirect to Cloudflare.
- Drafts, publications and uploaded media use a SQLite-backed Durable Object. A one-version publication rollback and ZIP backup are provided. Original uploaded images remain intact; cover framing is non-destructive.
- Large video files are linked through the existing video fields; the media upload endpoint accepts JPG/PNG/WebP/PDF up to 10 MB.
- No customer-message inbox is invented, and no customer chat history is stored.
- Original example photographs and grades remain explicitly marked until Danny supplies verified material. Automatic helpers no longer invent grades, equipment, condition claims or warranty promises.

## Deployment
Cloudflare deployment succeeded: Worker version `b65991ed-42b0-4cd1-8b9e-728f62b19f59`. Live inventory rendered seven vehicles with original prices and photography. Light/Dark and the revised navigation were inspected on the live site. The original owner credentials still log in, and a same-content homepage draft was saved to the production content store and survived reload. Production public inventory was not republished from browser-local drafts; the owner retains that explicit review-and-publish step.
