# Cloudflare deployment

The public website is built from `gemini-site/`, using the same inventory snapshot as GitHub Pages.

From the repository root:

```sh
node gemini-site/scripts/build-cloudflare.mjs
npx wrangler deploy --config wrangler.jsonc
```

The root Wrangler configuration publishes static showroom assets plus the owner authentication Worker to the existing `car-recond-japan` Worker. Vehicle details and services remain public. `/studio/` and legacy admin routes require the owner session before an asset is served. The Cloudflare build uses `/` as its base path; GitHub Pages keeps `/Car-Recond-Japan/`.

For a Git-connected Cloudflare build, use `node gemini-site/scripts/build-cloudflare.mjs` as the build command and `npx wrangler deploy --config wrangler.jsonc` as the deploy command, with the repository root as the working directory.

Inventory edits and uploaded photographs in the workbench are stored in the browser for each website origin. Export a backup from the old address and import it at `/studio/` on the new address before continuing local edits. Publishing the saved inventory still requires exporting the site update and deploying the resulting files.

## Owner login

The React login frontend is in `owner-login/App.tsx` and `owner-login/index.css`, bundled with React, Motion, Lucide and Tailwind v4 by `scripts/build-owner-login.mjs`. It is built only for Cloudflare. GitHub Pages workbench routes redirect to the Cloudflare workbench.

`owner-worker.mjs` verifies the single owner name, a PBKDF2-SHA256 password hash (100,000 iterations), and an HMAC-signed session cookie (8 hours, HttpOnly, Secure, SameSite=Strict). Login and logout require same-origin POST requests. Login attempts use a Cloudflare rate limit binding (5/minute per IP at each location). Protected responses are private and not cacheable.

The deployed Worker requires two Cloudflare secrets, managed outside the repository:
- `OWNER_PASSWORD_HASH`: base64url salt + `:` + base64url 32-byte PBKDF2 hash.
- `OWNER_SESSION_SECRET`: a cryptographically random signing secret, at least 32 bytes.

Do not put passwords, hashes or session signing keys in frontend code or commit them. Rotating the session secret invalidates all sessions. Use the existing authenticated Wrangler secret commands to rotate credentials. The workbench sidebar includes a logout form. Inventory edits remain browser-local; authentication does not add cross-device inventory sync.

Cloudflare routing reference: https://developers.cloudflare.com/workers/static-assets/routing/worker-script/
