# Danny Recond Select — Sitewide UI and Interaction Design

**Status:** Design direction approved in chat; written specification pending owner review.
**Date:** 2026-10-22

## Goal

Make Danny Recond Select easier to recognize as a Japanese reconditioned-car showroom and easier to use across customer pages and the owner workbench. Use shadcn/ui for consistent, accessible interaction controls and React Bits source components selectively for clear, lightweight feedback. Improve the overall visual system while preserving the current brand, vehicle photography, Day/Night choice, data, authentication, and publishing behavior.

## Existing system and source of truth

- `gemini-site/` is the production site source. It generates static pages and uses HTML, CSS, and JavaScript modules for most page behavior.
- The customer showroom has a React island for the mobile inventory filter. The owner login is also a standalone React page, built separately with Tailwind and Motion.
- The owner workbench itself is generated for the authenticated Cloudflare Worker and currently uses existing JavaScript modules and owner APIs.
- The confirmed workbench behavior is documented in `.workbench/spec-owner-refinement.md`. It supersedes the older `.workbench/spec.md` statements that there is no login or live publication.
- The root Next.js app and its `components.json` are not the production showroom. New work belongs in `gemini-site/` unless an implementation step explicitly proves otherwise. The empty `gemini-site/src/App.tsx` entry is not a live showroom page.

## Product boundaries

The work has two related surfaces and should be delivered in reviewable slices:

1. **Customer showroom:** homepage, inventory, vehicle details, services and tint, calculator and JPJ tools, delivery stories, contact, and footer.
2. **Owner experience:** React login, then the authenticated workbench with overview, vehicles and editing, website content and deliveries, services and tint, settings, and advanced/recovery tools.

Use a shared visual foundation, but tune information density and motion to each surface's job. Do not migrate the entire site to React. Keep static rendering, current route generation, and existing JavaScript business logic. Add React islands only where a real interaction benefits from the shared components; bridge them to existing page state through explicit interfaces rather than duplicating business rules.

## Visual system

- **Day:** warm white and quiet cool-neutral surfaces, deep navy text, and one consistent automotive blue for primary actions and active navigation.
- **Night:** deep navy surfaces with accessible light text and the same blue action color.
- Reserve WhatsApp green for WhatsApp actions. Use amber, red, and green elsewhere only as meaningful status colors.
- Remove conflicting decorative color combinations and hard-coded dark panels that appear inside Day mode. Use the existing Day/Night choice consistently in the header, page sections, dialogs, forms, footer, and workbench.
- Make the Danny wordmark more substantial. Use a restrained light treatment in Night mode while retaining its existing wording and identity.
- Keep actual vehicle and delivery photos at natural color. Avoid placing essential text over photos; use clear separation or a readable scrim when overlay is necessary.
- Use clear type hierarchy, intentional spacing, and distinct content groups instead of repeating oversized gaps or same-looking card grids.
- Keep a dark navy footer band with readable brand, navigation, social, and contact groups, following the supplied reference structure.

## Component responsibilities

### shadcn/ui

Treat shadcn/ui as the owned source for common interactive controls, not a default visual theme to paste over the site. Reuse or add components from `gemini-site/src/components/ui/` for patterns that materially benefit from consistent accessibility and behavior, such as:

- mobile filter Sheet and appropriate desktop filter menus;
- language menu, selects, and toggles;
- compare and photo dialogs;
- specification disclosures and tabs where they improve navigation;
- dashboard filters, confirmation dialogs, and editor controls.

Style these controls from the shared site tokens. Keep existing native page controls until the equivalent React island is ready; avoid maintaining two competing versions of the same interaction on one surface.

### React Bits

Use selected components as project-owned source, adapted to the site palette and typography. Prefer the existing Motion dependency where a React Bits effect needs it; do not add heavy animation dependencies without a concrete user benefit. Apply motion only when it explains a state change or gives useful feedback, for example a short save-success state, filter change, or gallery transition. Do not add animated backgrounds, autoplay motion, decorative cursor effects, or movement that makes vehicle rows jump or delays a user's action. Respect `prefers-reduced-motion`; the final interface must remain complete and understandable without animation.

## Customer showroom behavior

- The first screen makes the offer clear: Japanese reconditioned cars selected by Danny, with obvious ways to browse current stock or contact him.
- Inventory controls keep search easy to find and make status, make, sort, featured, and result count easy to understand. The responsive filter Sheet remains available on smaller screens.
- Vehicle cards make the vehicle name, year, mileage, grade, price, and availability easy to scan. Preserve existing badge and sold/booked behavior, including the photo's natural colors and sold-price treatment. Preserve card and compact view modes while improving their responsive density.
- Vehicle detail content groups the gallery, key facts, condition information, enquiry actions, and finance tools. Keep the calculator out of the main header; retain its existing detail/tools entry points.
- Keep **Services & Tint** in the main navigation. Package selection, comparison, price-sheet viewing, and enquiry actions should be clear and usable without adding a new publishing or booking backend.
- Keep delivery stories and contact/social channels. Contact text must not collide with its photo. Use clear keyboard-accessible gallery and contact actions.

## Owner login and workbench behavior

- Restyle the existing React login page to the shared Day/Night visual system. Preserve the current `/api/owner/login` request, error messaging, password visibility control, language choice, and successful route to `/studio/`.
- Do not add third-party login providers or alter credentials, session, or access-control rules.

- Reorganize the workbench around real owner tasks: overview, vehicle search/edit, website content and deliveries, services and tint, settings, and advanced/recovery actions.
- Overview may show only real stock counts, confirmed save/publication state, real issues, and real recently edited items. Do not invent revenue, leads, or analytics.
- Make the main edit action explicit: **Save and go live**. **Save as draft** and **Preview** remain secondary. Preserve single-item publication, owner authentication, revision/conflict checks, media visibility, error recovery, and rollback.
- Keep draft/local/saved/published states distinct and truthful. If a save or publication fails, retain the owner's entered work and clearly show that the public site did not update.
- Keep Day mode light across every workbench panel and editor. Keep photos in their original colors. Make navigation, forms, photo actions, and saving usable on mobile with touch targets of at least 44px.
- Use motion for short confirmation and status feedback only; never hide a save error or publication state behind animation.

## Accessibility, responsiveness, and performance

- Preserve keyboard navigation, visible focus, semantic labels, dialog focus management, and screen-reader status announcements.
- Maintain readable contrast in both themes and all button states.
- Support English, Simplified Chinese, and Bahasa Melayu labels in site components.
- Ensure all core showroom and workbench actions work at mobile, tablet, and desktop widths. Do not remove owner functionality at smaller widths.
- Keep current data behavior and static-site performance. Load React islands only on pages that mount them; avoid bringing animation or component code to pages that do not use it.
- Provide a no-motion state for all introduced animations.

## Data and publishing constraints

- Do not change vehicle, service, delivery, contact, or theme data schemas as part of this design.
- Do not change login/session behavior or Cloudflare owner APIs.
- Do not publish automatically on field edits. Preserve explicit save, draft, preview, single-item publication, conflict, and rollback semantics from the confirmed workbench brief.
- The local preview is for review only. No GitHub push or Cloudflare deployment is included in this design approval.

## Delivery slices

1. **Shared foundation:** bridge existing CSS theme tokens into React islands; document component and motion conventions; preserve Day/Night and reduced-motion behavior.
2. **Customer showroom:** improve home, inventory/filter/card scanning, detail/gallery/tools, services, contact, and footer, preserving current data and routes.
3. **Owner workbench:** apply the same component and visual language to overview, vehicle work, content/delivery, services, settings, and recovery while preserving all owner flows.
4. **Review:** inspect each route in both themes and at mobile/tablet/desktop widths; verify keyboard, reduced-motion, loading, empty, error, save, and publication states before asking to publish.

## Acceptance criteria

1. A new visitor can tell immediately that the site sells Japanese reconditioned cars and can find stock or contact Danny without hunting.
2. Customer controls and owner controls behave consistently, while public and owner information remain distinct.
3. Day and Night themes are coherent across every page and overlay; no light-theme panel has unreadable text or unintended black backgrounds.
4. shadcn controls use the site's own visual tokens; React Bits motion is purposeful, brief, and fully optional under reduced-motion settings.
5. Existing routes, vehicle/media content, owner permissions, draft storage, single-item publishing, failure handling, and rollback continue to work.
6. The owner workbench retains its full core functionality on mobile and all interactive targets are at least 44px.
7. Local preview is built and reviewable without a Git push or Cloudflare deployment.

## Out of scope

- A full rewrite of the site or owner workbench as a React/Next.js application.
- Changes to Cloudflare authentication, storage, APIs, data schemas, or deployment configuration.
- New fake business metrics, enquiry inboxes, AI navigation, automatic publication, or animated background effects.
- Pushing to GitHub or deploying to Cloudflare without a separate explicit request.
