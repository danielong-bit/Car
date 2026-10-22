# Owner Login and Workbench UI Implementation Plan

> For agentic workers: REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make Danny’s login and authenticated workbench easier to scan and use while preserving the current access controls, owner APIs, saving, single-item publishing, drafts, conflicts, and rollback.

**Architecture:** Keep the workbench’s existing HTML template and JavaScript data flows. Consume the shared palette from the customer UI plan, use a shadcn AlertDialog island for high-impact confirmations, and use React Bits CountUp only for real overview counts; keep the existing owner login React entry and its login request.

**Tech Stack:** Cloudflare Worker and local Durable Object preview, static HTML/CSS/ES modules, React 19 islands, Tailwind CSS 4, radix-ui-backed shadcn components, Motion, React Bits source components, esbuild, Wrangler.

**Spec:** docs/superpowers/specs/2026-10-22-sitewide-shadcn-react-bits-design.md; .workbench/spec-owner-refinement.md

## Global Constraints

- The workbench continues to use the authenticated Cloudflare owner APIs in gemini-site/owner-worker.mjs and gemini-site/content-store.mjs.
- Do not change credentials, login/session behavior, Cloudflare APIs, storage, or data schemas.
- Preserve explicit save, draft, preview, single-item publication, revision/conflict checks, media visibility, failure handling, and rollback.
- Overview displays only real stock counts, confirmed save/publication state, real issues, and actual recently edited records.
- Day mode stays light across workbench panels; Night mode uses deep navy; photos retain original colors; interactive targets remain at least 44px.
- Every introduced motion has a complete no-motion behavior under prefers-reduced-motion.
- Local review uses local-only Cloudflare bindings and credentials; no production bindings, GitHub push, or deployment.

## Review Focus

- Missing local credentials or an expired owner session: owner pages remain protected and failed login is clear. Manual review in Tasks 1 and 5.
- Save draft, save-and-go-live, single-item publish, and an unrelated pending draft: only the selected item is published; status remains truthful. Manual review in Tasks 2 and 5.
- API timeout, 401, 409 conflict, 400 invalid content, and 503 storage failure: input remains available and the UI never claims the live site changed. Manual review in Tasks 2, 3, and 5.
- Day/Night and English, Simplified Chinese, and Bahasa Melayu on phone, tablet, and desktop: forms, navigation, dialog, photos, and save bar remain readable and operable. Manual review in Tasks 1, 3, and 5.
- Keyboard, screen reader status, and prefers-reduced-motion: confirmation, count display, saving feedback, and route changes remain understandable without animation. Manual review in Tasks 2 and 5.

---

### Task 1: Shared Workbench Shell and Login

**Files:**
- Modify: gemini-site/out/workbench.html
- Modify: gemini-site/public/workbench.css
- Modify: gemini-site/public/workbench-theme.css
- Modify: gemini-site/public/product-system.css after Task 1 of the Customer Showroom plan
- Modify: gemini-site/public/workbench.mjs
- Modify: gemini-site/owner-login/App.tsx and gemini-site/owner-login/index.css

**Interfaces:**
- Consumes: shared Day/Night palette and component tokens from the Customer Showroom and Shared UI Foundation plan; owner navigation and real publication status from .workbench/spec-owner-refinement.md.
- Produces: the same data-nav routes, save-state nodes, owner-login request, and owner data APIs with clearer section hierarchy.

- [ ] Step 1: Group the sidebar into Daily management, Website content, and Administration, with Overview, Vehicles, Homepage, Deliveries, Media, Services & Tint, Settings, and Advanced in the confirmed task order.
- [ ] Step 2: Reorganize the overview into confirmed live status, real stock counts, real issues, and recently edited vehicles only when existing data provides an edit timestamp; otherwise show a clear empty state. Remove any decorative metric or unsupported analytics.
- [ ] Step 3: Refine workbench panels, editor forms, photo controls, confirmation styles, and sticky save controls to consume the shared Day/Night tokens; keep Day surfaces light and image colors natural.
- [ ] Step 4: Restyle the current Owner Log In screen for the shared palette and wordmark; preserve username/password inputs, password visibility, three languages, error/loading states, theme control, and successful redirect to /studio/.
- [ ] Step 5: Build the Cloudflare output and manually review workbench shell and login in both themes at mobile and desktop widths.

### Task 2: shadcn Confirmations and React Bits Owner Metrics

**Files:**
- Create: gemini-site/src/components/ui/alert-dialog.tsx
- Create: gemini-site/src/workbench-ui.tsx
- Create: gemini-site/src/workbench-ui.css
- Create: gemini-site/src/workbench-counts.tsx
- Modify: gemini-site/out/workbench.html
- Modify: gemini-site/public/workbench.mjs
- Modify: gemini-site/scripts/build-ui-islands.mjs and gemini-site/scripts/build-github-pages.mjs
- Reuse: gemini-site/src/components/react-bits/count-up.tsx and CountUpNumber from the Customer Showroom plan

**Interfaces:**
- Produces: window.dannyConfirmAction(options:{title:string; description:string; confirmLabel?:string; destructive?:boolean}):Promise<boolean>; workbench.mjs confirmAction delegates to it and retains a safe native fallback if the island is unavailable.
- Produces: owner KPI count mounts containing values derived directly from the current document; no invented business metric or separate data source.

- [ ] Step 1: Add the source-owned shadcn AlertDialog component and style it with the shared background, foreground, primary, border, and focus tokens.
- [ ] Step 2: Mount WorkbenchUI in the existing template and expose the typed promise-based confirmation function; connect it to confirmAction without changing which actions require confirmation.
- [ ] Step 3: Replace the dashboard’s decorative KPI number rendering with the React Bits CountUpNumber using only counts derived from doc.vehicles; announce the final counts immediately to assistive technology and show final values immediately for reduced motion.
- [ ] Step 4: Extend build-ui-islands.mjs to emit the owner island bundle and include its script only in the authenticated workbench template.
- [ ] Step 5: Build the Cloudflare output and manually review publish, rollback, delete, and cancel confirmations; ensure focus returns to the trigger and reduced-motion mode shows the same final information.

### Task 3: Editor Task Hierarchy and Truthful Save Feedback

**Files:**
- Modify: gemini-site/public/workbench.mjs
- Modify: gemini-site/public/workbench.css and gemini-site/public/workbench-theme.css
- Modify: gemini-site/out/workbench.html only where the shell needs new mount points

**Interfaces:**
- Consumes: existing persist(), publishItem(), publishWebsite(), rollback, preview, media upload, conflict, and toast flows.
- Produces: clear and distinct labels for unsaved/local draft/cloud draft/published states; no new API calls or altered publish scope.

- [ ] Step 1: Group vehicle, homepage, delivery, Services & Tint, settings, and advanced editors into the task order defined in .workbench/spec-owner-refinement.md; keep large forms collapsed or focused on one item where the current design allows it.
- [ ] Step 2: Make Save and go live the primary action, with Save as draft and Preview as secondary actions; keep single-item publish scope and only show success after the corresponding API response succeeds.
- [ ] Step 3: Preserve the current form values and show a clear failure state for offline/API errors and 400, 401, 409, or 503 responses; do not falsely mark local draft changes as live.
- [ ] Step 4: Apply 44px minimum targets and responsive navigation/editor/photo grids at 375px, 768px, and desktop widths; keep every owner action available on mobile.
- [ ] Step 5: Build the Cloudflare output and manually review draft, live, conflict, disconnected, validation, upload, and rollback states using local data.

### Task 4: Safe Local Authenticated Workbench Preview Setup

**Files:**
- Review: wrangler.jsonc, gemini-site/scripts/build-cloudflare.mjs, gemini-site/owner-worker.mjs, and .gitignore
- Create locally only: ignored .dev.vars values and .local-studio/state

**Interfaces:**
- Consumes: the existing authenticated worker and generated public snapshot; local Durable Object and Rate Limiting bindings only.
- Produces: an authenticated local Worker session using local-only credentials, local Durable Object data, and no production bindings.

- [ ] Step 1: Build with npm run build:cloudflare and run Wrangler in local mode with persistence isolated to .local-studio/state; do not use remote bindings or production credentials.
- [ ] Step 2: Generate disposable local-only OWNER_SESSION_SECRET and OWNER_PASSWORD_HASH values in the ignored .dev.vars file; do not copy the owner’s password, production session secret, or any Cloudflare token into source.
- [ ] Step 3: Sign in through the real owner login endpoint and confirm the workbench loads from the generated public snapshot while its API changes are stored only in the local Durable Object.

### Task 5: Owner Flow Review and Local Preview Handoff

**Files:**
- Review: gemini-site/owner-login/App.tsx, gemini-site/out/workbench.html, and gemini-site/public/workbench.mjs
- Review: local Worker output and local Durable Object storage only

**Interfaces:**
- Consumes: the completed workbench UI and local-only Worker preview from Tasks 1–4.
- Produces: a reviewable authenticated owner preview; no live site changes.

- [ ] Step 1: Manually confirm the local site serves public pages and authenticated /studio/, while unauthenticated /studio/ redirects to login.
- [ ] Step 2: Review real login, save, draft, scoped publish, conflict, error, rollback, keyboard, reduced-motion, and mobile behavior using local data.
- [ ] Step 3: Confirm local save/publish changes stay in local Durable Object storage and no production URLs or bindings are contacted.
- [ ] Step 4: Leave local preview running for Danny to review; report the local URL and clearly state that no live site was changed.
- [ ] Step 5: Commit only completed owner UI files as a local checkpoint; do not push or deploy.

### Completion Check

Danny can use the workbench in Day and Night themes, understand what is live versus draft, find common tasks quickly, confirm high-impact actions clearly, and review changes locally with real authentication and isolated local storage. All current owner permissions and publication semantics remain intact.
