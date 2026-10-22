# Customer Showroom and Shared UI Foundation Implementation Plan

> For agentic workers: REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Give the customer-facing showroom one clear, accessible visual system and make browsing stock, services, vehicle details, and contact feel easier.

**Architecture:** Keep the existing static HTML and JavaScript page generation. Extend the existing Day/Night tokens, use the existing shadcn Sheet for inventory filtering, and add a small React Bits CountUp source component for real inventory counts; do not migrate the site to React. Keep all vehicle and contact data in the existing public snapshot.

**Tech Stack:** Static HTML/CSS/ES modules, React 19 islands, Tailwind CSS 4, radix-ui-backed shadcn source components, Motion, lucide-react, esbuild.

**Spec:** docs/superpowers/specs/2026-10-22-sitewide-shadcn-react-bits-design.md

## Global Constraints

- Production source is gemini-site; generated static pages and existing route generation remain in place.
- Day uses warm white and quiet cool-neutral surfaces, deep navy text, and automotive blue for primary actions and active navigation.
- Night uses deep navy surfaces with accessible light text and the same blue action color.
- Reserve WhatsApp green for WhatsApp actions. Use amber, red, and green elsewhere only as meaningful status colors.
- Keep actual vehicle and delivery photos at natural color.
- Keep Services & Tint in the main navigation. Keep the calculator out of the main header; retain its existing detail/tools entry points.
- Support English, Simplified Chinese, and Bahasa Melayu labels in site components.
- Preserve existing vehicle, service, delivery, contact, and theme data schemas, routes, and business logic.
- Support a no-motion state for all introduced animations.
- No GitHub push or Cloudflare deployment is included.

## Review Focus

- Day/Night toggling and refresh across showroom, detail, services, and tools pages: all surfaces, text, footer groups, and dialogs remain legible. Manual review is in Tasks 1, 2, and 5.
- English, 简体中文, and Bahasa Melayu labels in navigation, filters, and common actions: content and accessible names remain correct. Manual review is in Tasks 2, 3, and 5.
- Mobile widths around 375px and tablet width around 768px: no horizontal overflow; core targets remain at least 44px; contact text does not overlap photography. Manual review is in Tasks 2, 4, and 5.
- Available, booked, sold, no-match, and low-mileage stock combinations in card and compact modes: actual photos stay natural, status behavior remains correct, and filters still produce the existing result set. Manual review is in Tasks 2, 3, and 5.
- Keyboard use and prefers-reduced-motion: the filter Sheet, dialogs, focus return, and count display remain complete and understandable without animation. Manual review is in Tasks 2, 3, and 5.

---

### Task 1: Shared Day/Night Tokens and Brand Shell

**Files:**
- Modify: gemini-site/public/product-system.css
- Modify: shared header and footer markup in gemini-site/out/index.html, gemini-site/out/cms-vehicle.html, gemini-site/out/services.html, and gemini-site/out/tools.html

**Interfaces:**
- Consumes: the existing light/dark theme key in document.documentElement.dataset.theme and existing persisted theme helpers.
- Produces: shared CSS variables for public pages and aliases for shadcn CSS variables; the same theme value remains available to existing page scripts.

- [ ] Step 1: Define the palette tokens in product-system.css: warm Day page/surface colors, navy text, one automotive-blue action color, deep-navy Night surfaces, accessible light Night text, and theme aliases for background, foreground, primary, border, and ring.
- [ ] Step 2: Remove conflicting active overrides that make Day panels dark or switch accent colors between page sections; retain unrelated legacy styles only where the templates still load them.
- [ ] Step 3: Update the shared header and footer markup to the approved site structure: DANNY wordmark, Home, Inventory, Services & Tint, Contact, compact language/theme controls, and a readable dark-navy footer with brand, Navigate, Social, and Contact groups.
- [ ] Step 4: Keep Calculator & JPJ reachable from the tools/detail/footer paths without placing it in the main header; keep social and contact destinations unchanged.
- [ ] Step 5: Run the preview build and manually review the shared header/footer in Day and Night at desktop and mobile widths.

### Task 2: Inventory Filters, Cards, and Count Feedback

**Files:**
- Modify: gemini-site/out/index.html and gemini-site/out/tools.html
- Modify: gemini-site/public/showroom.mjs and gemini-site/public/showroom.css
- Modify: gemini-site/src/mobile-filter-sheet.tsx and gemini-site/src/components/ui/sheet.tsx only if the existing Sheet needs palette or interaction adjustments
- Create: gemini-site/src/components/react-bits/count-up.tsx
- Create: gemini-site/src/inventory-count.tsx
- Create: gemini-site/scripts/build-ui-islands.mjs
- Modify: gemini-site/scripts/build-github-pages.mjs

**Interfaces:**
- Consumes: existing inventory filter state and custom events in showroom.mjs; existing mobileFilterSheetMount and Sheet implementation.
- Produces: CountUpNumber with value:number, durationMs?:number, and className?:string; a result-count island listening for danny:inventory-counts with detail {available:number;sold:number}, rendering final values immediately for reduced motion and screen readers.

- [ ] Step 1: Inspect the existing filter state and current uncommitted Sheet implementation; keep search, status, make, sort, featured, reset, and apply semantics unchanged.
- [ ] Step 2: Adapt the React Bits Count Up source as CountUpNumber in components/react-bits/count-up.tsx; ensure it uses only supplied real values, reserves a stable number width, and shows final values immediately when reduced motion is requested.
- [ ] Step 3: Add an inventory count mount while retaining the existing live region; have showroom.mjs dispatch available and sold totals after each render, and have inventory-count.tsx render a decorative animated value beside the immediate accessible announcement.
- [ ] Step 4: Build the existing filter Sheet and count island into output assets with build-ui-islands.mjs; update build-github-pages.mjs to call the shared island builder without changing the Pages or Cloudflare output destinations.
- [ ] Step 5: Apply the shared tokens to filter controls, badges, card and compact layouts, sold/booked states, and empty results; preserve the existing card modes, data, and status logic.
- [ ] Step 6: Refine the homepage hero using existing localized content and photos so it clearly says Danny selects Japanese reconditioned cars and presents obvious Browse stock and WhatsApp actions.
- [ ] Step 7: Run the preview build and manually check filters, count feedback, keyboard focus, reduced motion, card/compact modes, and status/photo treatment at mobile, tablet, and desktop widths.

### Task 3: Vehicle Details, Finance Tools, and Services & Tint

**Files:**
- Modify: gemini-site/public/showroom.mjs
- Modify: gemini-site/public/detail-polish.css
- Modify: gemini-site/public/vehicle-tools.css
- Modify: gemini-site/public/service-care.css
- Modify: gemini-site/out/cms-vehicle.html, gemini-site/out/services.html, and gemini-site/out/tools.html

**Interfaces:**
- Consumes: existing detail route data, gallery/media handlers, finance calculations, service package data, and WhatsApp enquiry URLs.
- Produces: clearer page groups for gallery, key facts, condition, enquiry, finance, services, and package enquiries; no new API or data contract.

- [ ] Step 1: Reorder and style vehicle details into gallery, key facts, condition information, enquiry actions, and finance tools; keep the main selling facts visible before secondary specifications.
- [ ] Step 2: Refine gallery and comparison dialogs using existing handlers; retain native photos and video behavior, keyboard close/navigation, and focus return.
- [ ] Step 3: Group calculator and JPJ tools under the existing tools/detail entry points with clear labels and concise helper text; do not add new calculators or calculations.
- [ ] Step 4: Refine Services & Tint package selection, comparison, price-sheet viewing, and enquiry actions without adding booking or publishing backends.
- [ ] Step 5: Run the preview build and manually review a vehicle detail, tools page, and services page in both themes and at mobile and desktop widths.

### Task 4: Contact and Footer Layout

**Files:**
- Modify: gemini-site/out/index.html, gemini-site/out/cms-vehicle.html, gemini-site/out/services.html, and gemini-site/out/tools.html
- Modify: gemini-site/public/showroom.css and gemini-site/public/product-system.css

**Interfaces:**
- Consumes: current contact/profile data and generated page routes.
- Produces: separated readable contact/photo layout and matching footer structure on each public route; no new contact or data behavior.

- [ ] Step 1: Refine the contact area so the profile photo has its own column or block and the contact text, WhatsApp, phone, location, and social actions never overlap it.
- [ ] Step 2: Confirm shared footer labels and links appear in all four public templates and remain legible in Day and Night.
- [ ] Step 3: Run the preview build and manually review contact text, photo separation, and social actions in both themes at mobile and desktop widths.

### Task 5: Final Public Preview Review

**Files:**
- Review: gemini-site/scripts/build-preview.mjs and gemini-site/scripts/preview-static.mjs
- Review: all customer page templates and public CSS/modules changed in Tasks 1–4

**Interfaces:**
- Consumes: completed shared shell, customer interactions, and generated routes.
- Produces: a reviewable public preview in dist-preview; no production publish action.

- [ ] Step 1: Run npm run build:preview from gemini-site and open the local preview using the existing preview server; check the home, inventory, one vehicle detail, services, and tools routes.
- [ ] Step 2: Check 375px, 768px, and 1440px layouts; keyboard navigation; all three languages; and reduced-motion behavior. Record any remaining mismatch before asking to publish.
- [ ] Step 3: Commit only the completed public UI files as a local checkpoint; do not push or deploy.

### Completion Check

The customer showroom clearly presents Japanese reconditioned vehicles selected by Danny, offers obvious stock and contact paths, keeps all current public routes and data behavior, and has coherent readable Day and Night themes. The review occurs from a local build only.
