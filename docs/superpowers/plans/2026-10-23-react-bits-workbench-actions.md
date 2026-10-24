# React Bits Workbench Actions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add reversible archive, touch-row shortcuts, and swipe-dismissible feedback to the owner vehicle dashboard using the supplied React Bits components.

**Architecture:** Bundle the three React Bits components into the existing owner React island. Keep vehicle state, persistence, and rollback in `public/workbench.mjs`; connect the island through typed window callbacks/custom events. Mount swipe roots around existing vehicle-row markup, and mount FuseButton in the existing row menu.

**Tech Stack:** React 19, TypeScript, `motion`, `@hugeicons/react`, `@hugeicons/core-free-icons`, esbuild, existing workbench CSS/theme tokens.

**Spec:** `docs/superpowers/specs/2026-10-23-react-bits-workbench-actions.md`

## Global Constraints

- Preserve the supplied component behavior, adapting JSX to the existing TypeScript React island.
- Use `fullSwipe={false}`; swipe actions are Edit and Photos only.
- Archive commits after a 4-second undo window; Delete remains behind the existing confirmation dialog.
- Vehicle state and all saves continue through `public/workbench.mjs` and its existing cloud/local persistence path.
- Preserve Day/Night themes, keyboard access, reduced-motion behavior, and desktop controls.
- Keep the change local; do not push or deploy.
- Do not add or run automated tests in this task; verify with the static build and the local dashboard interaction flow.

## Review Focus

- A swipe gesture over a nested checkbox, select, or button must not trigger an unintended vehicle action; verify nested controls on touch and keyboard.
- Archive Undo and Escape must cancel the pending archive; the archive event may fire only after the four-second fuse ends.
- If a cloud save fails after archive or status change, restore the correct prior state and show an error without a stale settled button.
- Re-rendering filters, rows, or views must unmount stale React roots and must not duplicate toast or row handlers.
- Day/Night contrast and reduced-motion settings must remain usable on the dashboard; verify both themes and the preference.

---

### Task 1: Add the React Bits components and bundle their styles

**Files:**
- Create: `gemini-site/src/components/react-bits/FuseButton.tsx`
- Create: `gemini-site/src/components/react-bits/FuseButton.css`
- Create: `gemini-site/src/components/react-bits/SwipeRow.tsx`
- Create: `gemini-site/src/components/react-bits/SwipeRow.css`
- Create: `gemini-site/src/components/react-bits/SwipeToast.tsx`
- Create: `gemini-site/src/components/react-bits/SwipeToast.css`
- Modify: `gemini-site/package.json`
- Modify: `gemini-site/package-lock.json`
- Modify: `gemini-site/scripts/build-ui-islands.mjs`

**Interfaces:**
- Consumes: the three source implementations and prop definitions supplied in the user attachments.
- Produces: typed React components importable by `src/workbench-ui.tsx`; generated `assets/workbench-ui.css` contains the existing owner CSS followed by the three component styles.

- [x] Add `@hugeicons/react` and `@hugeicons/core-free-icons`; retain the installed `motion` dependency.
- [x] Port the supplied components to `.tsx` with their documented props and lifecycle behavior.
- [x] Update the island asset builder to append all three component CSS files to `assets/workbench-ui.css` after the existing owner styles.
- [x] Compile each component with esbuild and run `npm run build:preview --prefix gemini-site`; both builds succeeded.

### Task 2: Mount swipe rows, archive controls, and toast notifications

**Files:**
- Modify: `gemini-site/src/workbench-ui.tsx`
- Modify: `gemini-site/src/workbench-ui.css`
- Modify: `gemini-site/public/workbench.mjs`

**Interfaces:**
- Consumes: the components from Task 1 and current vehicle-row markup.
- Produces: `window.dannyWorkbenchShowToast({title, description?, actionLabel?, onAction?, variant?})`; `danny:workbench-archive-request` with `{id}`; `danny:workbench-row-action` with `{id, action: "edit" | "photos"}`.

- [x] Add a swipe host around each existing vehicle row; have the React island mount `SwipeRow` with the original row content as its child, `fullSwipe={false}`, and Edit/Photos actions that dispatch the row-action event.
- [x] Keep touch controls usable by preventing swipe start from nested interactive elements; set the row action colors and styles from the current workbench theme.
- [x] Replace the Archive menu button with a FuseButton mount using `undoWindow={4000}`, `commitOn="fuseEnd"`, `settle="stay"`, and an archive-request event; leave Delete unchanged.
- [x] Mount SwipeToast notifications in the React island and expose the typed `dannyWorkbenchShowToast` callback; retain the current static toast as a startup fallback.
- [x] Ensure observer cleanup removes roots for replaced rows and the toast surface handles close/action lifecycle without duplicate listeners.

### Task 3: Connect undoable status changes and archive to existing persistence

**Files:**
- Modify: `gemini-site/public/workbench.mjs`

**Interfaces:**
- Consumes: the row-action/archive events and toast callback from Task 2.
- Produces: existing `persist()`-backed archive and inline status workflows; toast Undo restores only the prior status for that vehicle.

- [x] Listen for row-action events and invoke the existing Edit and Photos controls for the matching vehicle ID.
- [x] Listen for archive requests, set status to archived, save through `persist()`, re-render on success or failure, and report errors through the shared toast callback.
- [x] On inline status change, include an Undo action that checks the current value still matches the just-saved value, restores the old value, and persists it through the same path.
- [x] Ensure notification failures fall back to the existing live region; archive/delete and status failure paths restore the intended data and controls.

### Task 4: Verify the local dashboard experience

**Files:**
- No new files.

**Interfaces:**
- Consumes: the built local preview.
- Produces: verified local-only dashboard changes; no GitHub or Cloudflare release.

- [x] Build with `npm run build:preview --prefix gemini-site` and check `git diff --check`.
- [ ] Open `/studio/` in the local preview; verify touch-sized swipe reveals Edit/Photos, full swipe never archives, and existing desktop actions still work.
- [ ] Verify FuseButton Undo/Escape cancels and archive happens only after the fuse expires; verify Delete still asks for confirmation.
- [ ] Change status, use the toast Undo, and verify the prior status is saved; simulate or inspect save failure handling.
- [ ] Check Day and Night themes, keyboard focus, reduced motion, row re-render cleanup, and absence of console errors.

**Verification note:** `npm run lint --prefix gemini-site`, `npm run build:preview --prefix gemini-site`, `npm run build:cloudflare --prefix gemini-site`, and `git diff --check` passed. Browser-based local dashboard checks are pending because the browser's saved permission setting blocked access to `127.0.0.1:8787`; the local origin will not be retried through another surface.
