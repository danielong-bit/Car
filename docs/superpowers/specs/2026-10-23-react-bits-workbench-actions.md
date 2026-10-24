# React Bits Workbench Actions — Design

## Intent

Add the supplied React Bits `FuseButton`, `SwipeRow`, and `SwipeToast` interactions to Danny's owner dashboard so routine inventory actions are quicker, reversible where possible, and clearer on touch devices.

## Current context

The owner dashboard is served at `/studio/`. Vehicle rows, archive/delete actions, and persistence are currently managed by `public/workbench.mjs`; `src/workbench-ui.tsx` is an existing React island for shared dialogs and counts. React and `motion` are already dependencies. The supplied components also depend on Hugeicons, which will be added if their source is integrated unchanged. Existing Day/Night theme tokens and cloud/local save behavior remain authoritative.

## Goals

- On touch-sized vehicle inventory, provide swipe-revealed **Edit** and **Photos** shortcuts. Disable full-swipe commits so a gesture cannot archive or delete a car.
- Replace the immediate Archive confirmation action with a four-second `FuseButton` Undo window. Commit archive only when the fuse ends; Escape or Undo cancels it. Keep permanent Delete behind the existing confirmation dialog.
- Use `SwipeToast` for workbench feedback. A successful inline status change includes an Undo action that restores only that vehicle's previous status and saves it through the existing persistence path.
- Preserve desktop row actions, selection, filters, keyboard access, reduced-motion behavior, light/dark theming, and the current persistence/rollback semantics.

## Non-goals

- No changes to public showroom UI, database/API shape, owner permissions, publishing rules, or production deployment.
- No destructive full-row swipe, permanent-delete gesture, or changes to customer data handling.

## Approaches considered

1. **React Bits through the existing React island (chosen).** Reuse the provided React components and `motion`, add the requested Hugeicons dependencies, and bridge their callbacks to the existing workbench state/save functions. This keeps the supplied interactions intact while leaving business data ownership in the current dashboard script.
2. **Recreate the interactions in the existing vanilla workbench.** This would avoid React integration and new dependencies, but would duplicate the supplied component behavior and be harder to keep consistent with it.

The user selected approach 1. The existing `workbench.mjs` remains the source of truth for vehicle state and persistence; React components only render interactions and call back into those operations.

## Interaction details

- SwipeRow appears only as an enhancement to touch-sized inventory rows; its drawer actions open the existing editor or photo view. `fullSwipe` is false. Desktop controls remain as they are.
- FuseButton arms on Archive, shows Undo for four seconds, and archives only after the window expires. Save failures restore the previous document state and show an error.
- SwipeToast presents status-change Undo; Undo restores the one prior status and persists it. Other workbench notices use the same toast surface without an action.
- Component colors use the existing workbench theme variables. Motion honors `prefers-reduced-motion` as supported by the supplied components.

## Verification and release

Build the local static preview and check the dashboard in Day and Night themes, including touch swipe shortcuts, archive/undo timing, status Undo, save failure feedback, desktop controls, and reduced-motion styling. Do not push to GitHub or publish to Cloudflare as part of this change.
