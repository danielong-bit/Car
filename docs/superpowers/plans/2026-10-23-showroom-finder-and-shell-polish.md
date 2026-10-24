# Danny Recon Select — Finder, Shell, and Owner Login Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Refine the public car finder, footer, detail pricing, language/theme controls, and owner login while preserving the current site behavior and authentication flow.

**Architecture:** Keep the public website's existing static templates and vanilla JavaScript behavior. Build the supplied React Bits Stepper and BorderGlow as a small React island, then mount them from the existing public modules. Keep the owner login as its current React application and change only its presentation.

**Tech Stack:** React 19, TypeScript, esbuild, existing Hugeicons dependencies, vanilla ES modules, CSS, Tailwind CSS v4 for owner login.

**Spec:** [2026-10-23-showroom-finder-and-shell-polish.md](../specs/2026-10-23-showroom-finder-and-shell-polish.md)

## Global Constraints

- Preserve all existing work in the shared worktree, including uncommitted loan/document, address, and workbench interaction changes. Do not reset or overwrite unrelated changes.
- Preserve car finder questions, translations, answer values, matching/ranking, result links, WhatsApp message generation, and restart behavior.
- Keep owner login authentication on `POST /api/owner/login`, including validation, pending/error states, session cookie behavior, and redirect to `/studio/`.
- Keep the existing EN/中文/BM choices and saved Day/Night preference. Maintain keyboard access, visible focus, mobile layouts, and reduced-motion support.
- Use blue `#245BC7` for Day price emphasis and `#81AAFF` for Night. Keep gold limited to vehicle status/spec badges.
- Keep the footer to the Danny / RECON SELECT wordmark and Owner Dashboard link, framed by restrained blue BorderGlow.
- Do not add new dependencies unless an existing build limitation requires it. Do not push to GitHub or deploy to Cloudflare.

## Review Focus

- Check that the Stepper reflects the current finder question, cannot skip unanswered steps, and hides on results.
- Check footer consistency on home, vehicle, services, and tools pages, including a working Owner Dashboard link.
- Check related vehicle prices remain prominent in Day and Night without changing other stock/status colors.
- Check the public language menu and theme control still work with mouse, keyboard, and touch.
- Check the login card at narrow and wide widths, in both themes, with valid, invalid, pending, and error states preserved.
- Run lint and the preview and Cloudflare-target builds, then inspect the generated pages and `git diff --check`. Do not add or run automated tests unless requested.

---

## Task 1: Build focused React Bits components for public pages

**Files:**
- Create `gemini-site/src/components/react-bits/Stepper.tsx` and `Stepper.css` from the supplied Stepper implementation, adapting its component props to the existing site.
- Create `gemini-site/src/components/react-bits/BorderGlow.tsx` and `BorderGlow.css` from the supplied BorderGlow implementation.
- Create `gemini-site/src/site-ui.tsx` as the public React island entry point.
- Modify `gemini-site/scripts/build-ui-islands.mjs` to emit `assets/site-ui.js` and its stylesheet for public builds.

- [x] Implement the Stepper and BorderGlow components with semantic controls, focus styles, and reduced-motion/touch behavior. Use the existing Hugeicons dependencies; do not install another icon package.
- [x] Export `renderFinderStepper(container, step, language)` and `renderMinimalFooter(container, dashboardHref)` from `site-ui.tsx`. Keep React roots keyed by container so updates reuse the root instead of creating duplicates.
- [x] Style the Stepper from the site's Day/Night tokens and brand blue. Configure BorderGlow with restrained blue colors, low intensity, and no intro sweep.
- [x] Extend the public island build to emit the JavaScript and CSS assets in every static build output, including preview, GitHub Pages, and Cloudflare output.
- [x] Build the public island and confirm its generated asset paths match the paths that templates and public modules will load.

## Task 2: Add Stepper progress to the existing four-question car finder

**Files:**
- Modify `gemini-site/public/car-finder.mjs`.
- Modify `gemini-site/public/stock-experience.css` or the public finder stylesheet that owns the modal layout.
- Modify `gemini-site/out/index.html` only if it needs a stylesheet or asset fallback reference.

- [x] Add a mount point for the Stepper in the current finder modal and dynamically import the public UI island so a mount failure does not prevent the existing finder from opening.
- [x] Map the four current questions to translated titles for English, Chinese, and Malay. Update progress from the existing answer/step state; disable indicator clicks so users cannot skip questions.
- [x] Hide progress when the finder displays its result state, restore it on “Start again”, and unmount or clean up on dialog close.
- [x] Retain a legible static progress fallback if the React island cannot load; do not couple vehicle matching or result rendering to React.
- [x] Adjust the modal for compact mobile widths and ensure labels do not overflow at any of the three supported languages.

## Task 3: Replace public footers with the compact BorderGlow footer

**Files:**
- Modify `gemini-site/public/showroom.mjs` where the dynamic homepage footer is rendered.
- Modify `gemini-site/out/index.html`, `audi.html`, `cms-vehicle.html`, `services.html`, and `tools.html` to provide consistent fallback mount markup and required styles.
- Modify `gemini-site/public/stock-experience.css` and/or `exhibition.css` to remove obsolete multi-column footer layout rules for the new minimal footer.

- [x] Render only the DANNY / RECON SELECT wordmark and an “Owner Dashboard” link pointing to `/studio/` inside the BorderGlow frame.
- [x] Use the same markup and component on the homepage and static customer-facing page templates; remove the previous footer navigation, social, contact, disclaimer, location, and copyright groups.
- [x] Keep a usable non-React fallback in template markup until the island mounts, and avoid duplicate links when `showroom.mjs` refreshes localized content.
- [x] Make the compact frame responsive, readable in Day and Night, and visually quiet on touch devices.

## Task 4: Refine language/theme controls and vehicle detail pricing

**Files:**
- Modify `gemini-site/public/site-shell.mjs` and `gemini-site/public/product-system.css` for language control rendering.
- Modify `gemini-site/public/site-theme.mjs` and `gemini-site/public/product-system.css` for the public Day/Night switch appearance.
- Modify `gemini-site/public/showroom.mjs` and its detail styles for disclaimer removal and related-car price color.

- [x] Remove the decorative `◎` from the language trigger and replace the text caret with a clean chevron icon; preserve the custom menu's accessible name, menu choices, keyboard behavior, and focus handling.
- [x] Restyle the existing theme button as a compact sun/moon slider based on the supplied reference. Keep a real button with an accurate accessible label and the existing persisted theme state; account for reduced motion.
- [x] Remove both selected disclaimer sentences below the vehicle financing tools without removing financing guidance, the original auction report link, or the document checklist.
- [x] Apply Day `#245BC7` and Night `#81AAFF` to the related-car price text with sufficient contrast and responsive consistency. Leave vehicle badge colors unchanged.

## Task 5: Simplify the owner login page

**Files:**
- Modify `gemini-site/owner-login/App.tsx`.
- Modify `gemini-site/owner-login/index.css`.
- Modify `gemini-site/scripts/build-owner-login.mjs` only if generated metadata or asset paths need adjustment.

- [x] Replace the split video-and-form layout with one centered, responsive login card inspired by the supplied Uiverse reference and the approved Danny Recon Select design tokens.
- [x] Keep the existing owner wordmark, language selection, Day/Night toggle, username/password inputs, password visibility control, submit/pending state, error message, and private-access note. Remove the hero video, signup/social controls, and layout-only content that does not support owner sign-in.
- [x] Use the site's blue action/focus color with a subtle glow, clear text contrast, and restrained borders in both themes. Do not copy the reference's unrelated orange/purple colors.
- [x] Verify the form still sends the same request and redirects on success; keep the page usable with reduced motion and keyboard navigation.

## Task 6: Verify the integrated result

**Files:**
- No additional source files unless a verified build issue requires a targeted fix.

- [x] Run `npm run lint` from `gemini-site/`.
- [x] Run `npm run build:preview` and `npm run build:cloudflare` from `gemini-site/`; confirm both include the public UI island, updated templates, and owner login assets where applicable.
- [x] Inspect the generated home, vehicle detail, services, tools, and owner login pages for asset path correctness and remaining legacy footer/disclaimer content.
- [x] Review the final diff, run `git diff --check`, and confirm unrelated pre-existing changes remain intact.
- [x] Summarize what changed and any remaining preview limitation. Leave GitHub and Cloudflare unchanged pending a separate explicit release request.

## Follow-up: Homepage fiber background (2026-10-24)

- [x] Compare the supplied PixelSnow and GhostFibers sources; select GhostFibers for the blue showroom palette.
- [x] Copy the supplied native WebGL2 component without adding dependencies.
- [x] Render it only behind the minimal homepage footer, with Day/Night palettes, smaller mobile settings, reduced-motion fallback, and near-viewport mounting/cleanup.
- [x] Check desktop and phone rendering, wordmark contrast, Dashboard link, and browser errors.

**Verification:** TypeScript (including owner login), preview and Cloudflare builds passed. Existing inventory and product-system suites: 38 + 18 passed. Desktop and mobile visual checks passed. The saved browser permission blocks the local Worker origin on port 8787, so successful sign-in was not automatically browser-tested; authentication regression checks passed and its endpoint/credentials behavior were preserved. No push or deployment.
