# Cloudflare deployment

The public website is built from `gemini-site/`, using the same inventory snapshot as GitHub Pages.

From the repository root:

```sh
node gemini-site/scripts/build-cloudflare.mjs
npx wrangler deploy --config wrangler.jsonc
```

The root Wrangler configuration builds and publishes only the static showroom assets to the existing `car-recond-japan` Worker. Vehicle details, services and `/studio/` are real static routes with a custom 404 page. The Cloudflare build uses `/` as its base path; GitHub Pages keeps `/Car-Recond-Japan/`.

For a Git-connected Cloudflare build, use `node gemini-site/scripts/build-cloudflare.mjs` as the build command and `npx wrangler deploy --config wrangler.jsonc` as the deploy command, with the repository root as the working directory.

Inventory edits and uploaded photographs in the workbench are stored in the browser for each website origin. Export a backup from the old address and import it at `/studio/` on the new address before continuing local edits. Publishing the saved inventory still requires exporting the site update and deploying the resulting files.
