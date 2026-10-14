# Danny Recon Select

Current source for the Danny Recon Select website: https://car-recond-japan.haloultraman3.chatgpt.site/

This repository now contains the current Vinext/React site at its root, including the inventory, vehicle detail experience, calculator, admin routes, design system, and public assets. The site uses the existing Sites runtime and Cloudflare bindings for server features such as authenticated admin access and stored content.

## Development

Install dependencies with npm install, start local development with npm run dev, and create a production build with npm run build.

Local use of the authenticated admin and storage features requires the existing runtime configuration. Secrets and local .dev.vars files are not included in this repository.

GitHub Pages cannot run the site's server routes or D1/R2-backed features. The published Sites website remains hosted on its existing Sites runtime.
