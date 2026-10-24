# Danny Recon Select — Finder, Shell, and Owner Login Polish

## Intent

Refine the existing customer-facing website and owner login so prices, language/theme controls, and the footer are easier to understand and the login screen feels simpler and more consistent with Danny Recon Select. Add the supplied React Bits Stepper to the current four-question “Find Your Car” flow and BorderGlow to the minimal footer.

## What Exists Today

- The public site is built from static HTML templates in `gemini-site/out/`, vanilla modules in `gemini-site/public/`, and generated assets from `scripts/build-github-pages.mjs`.
- `public/car-finder.mjs` already implements a four-question modal: budget, body type, transmission, and priority. It uses existing vehicle data and matching rules, and the Find Your Car button opens this flow.
- `public/showroom.mjs` renders homepage inventory and replaces the homepage footer with translated, data-driven markup. Vehicle, services, and tools templates have their own static footer markup.
- `public/site-shell.mjs` enhances the native language selector and currently inserts `◎` plus a text caret. The public theme button uses the existing `.theme-control` element and shared Day/Night state.
- Vehicle detail markup includes two disclaimer paragraphs below the financing tools. The related-car price color is affected by overlapping theme CSS.
- The owner login is a React page in `owner-login/App.tsx`. Its authentication request and redirect are separate from its current two-column presentation.

## Supplied References

- The complete Stepper and BorderGlow JavaScript/JSX and CSS sources are included in the user's current request.
- The Uiverse login-card CSS is in the attached `Pasted text.txt` (`santhosh_2608`).
- The Uiverse moon/sun switch CSS is included in Browser Comment 5. These are visual references to adapt to the existing theme tokens, not colors to copy unchanged.

## Goals

1. Use the provided React Bits Stepper for visual progress in the existing four-step car finder. Preserve all questions, answers, matching, result ranking, vehicle links, WhatsApp enquiry text, and translations.
2. Use the provided React Bits BorderGlow around a compact public footer that contains only the Danny / RECON SELECT wordmark and an Owner Dashboard link.
3. Remove the two selected vehicle-detail disclaimer lines.
4. Make listed vehicle prices prominent in the established blue accent: `#245BC7` in Day and a readable lighter blue in Night. Keep gold for RS/RF and other special-status badges.
5. Remove the stray circle glyph from the language trigger and use a clean chevron while preserving the existing accessible custom menu, keyboard support, and EN/中文/BM choices.
6. Replace the public Day/Night switch appearance with a restrained sun/moon toggle inspired by the supplied Uiverse CSS. Keep it a keyboard-operable button tied to the existing theme state.
7. Simplify owner login to one centered, responsive login card inspired by the supplied Uiverse design. Use brand tokens in Day and Night, with subtle blue focus/glow effects; omit unrelated sign-up or social-login controls.
8. Preserve owner authentication, language preference, theme preference, website data, route behavior, mobile layout, focus visibility, and reduced-motion support.

## Non-Goals

- No changes to vehicle matching logic, stock data, calculator/loan behavior, or financing document collection.
- No account creation, password reset, social login, or authentication/API changes.
- No changes to the main site navigation or contact section.
- No GitHub push, Cloudflare deployment, or production content changes.

## Design Calls

- Keep the current vanilla public-site behavior and bundle focused React islands for the supplied Stepper and BorderGlow components. Do not rewrite the finder or the public site in React.
- The Stepper is a controlled progress/header component; answer selection in the existing wizard advances it. Step indicators are not clickable, preventing unanswered questions from being skipped. On the results screen the progress header is hidden.
- Use the current Day/Night tokens for component surfaces and ink. Use the blue accent for price emphasis and action/progress states; use the special gold only for vehicle badges.
- Adapt the Uiverse login card to the site palette instead of copying its orange/purple glow. Keep the existing owner name/password form, validation, pending/error states, API call, and redirect.
- BorderGlow uses low-intensity blue gradients, no autoplay sweep, and no hover-only information. On touch devices, the border stays visually quiet. Respect reduced motion.
- Update the homepage's dynamic footer and all customer-facing static footer templates so they remain consistent across inventory, details, services, and tools pages.

## Approaches Considered

1. **Focused React islands over the current public site — selected.** Keeps matching, translations, and site data in their existing modules while integrating the two requested React Bits components. Smallest behavioral change and lowest regression risk.
2. **Rewrite the entire car finder and footer as React.** Could make component ownership more uniform, but it replaces working vanilla flows and adds risk without improving the requested user outcome.

## Constraints and Acceptance

- Use the repository's existing React 19/esbuild build path and Hugeicons dependencies; do not add a new UI framework.
- Stepper must display all four stages and remain legible in English, Chinese, and Malay at mobile and desktop widths.
- The current result list and “Start again” behavior continue to work after using the Stepper.
- Footer has exactly the brand wordmark and Owner Dashboard link in a compact glow-framed surface; no social/contact/nav/disclaimer/copyright blocks remain there.
- The language trigger shows only the selected language and chevron; its menu remains keyboard and screen-reader operable.
- The theme control continues to update the same saved Day/Night preference as before.
- The login page remains connected to `/api/owner/login` and does not reveal or alter credentials.
- Verify TypeScript/lint, preview and Cloudflare-target builds, output/template consistency, and `git diff --check`. Do not push or deploy.

## Likely Touch Points

- `gemini-site/src/` for React Bits components and a public UI island.
- `gemini-site/scripts/build-ui-islands.mjs` for building the public component island and its CSS.
- `gemini-site/public/car-finder.mjs`, `site-shell.mjs`, `site-theme.mjs`, `showroom.mjs`, `detail-polish.css`, and `product-system.css`.
- `gemini-site/out/index.html`, `audi.html`, `cms-vehicle.html`, `services.html`, and `tools.html` for public template script/style/footer wiring.
- `gemini-site/owner-login/App.tsx` and `index.css` for the single-card login presentation.
- `gemini-site/scripts/build-github-pages.mjs` and login build output only if required to keep preview and Cloudflare build paths aligned.

## User-directed follow-up — 2026-10-24

The user supplied PixelSnow and GhostFibers and delegated the choice and color adjustment for the bottom of the homepage. Use GhostFibers behind the existing minimal footer: pale blue/lavender in Day, cool luminous blue in Night. Preserve the wordmark and Owner Dashboard link. Keep other page footers unchanged. Reduce particle work on phones, mount only near the viewport, stop when away, and use a quiet static surface for reduced motion.

## User-directed login background — 2026-10-24

Use the supplied React Bits Galaxy source as the owner login background. Follow Day/Night colors with a blue palette, preserve the opaque readable login card, disable click warp, reduce layers/DPR on phones, and freeze motion for reduced-motion preferences. Authentication remains on the existing owner endpoint. The login builder merges component CSS into login.css.
