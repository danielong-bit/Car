# Danny Recon Site source snapshot (v26)

This folder contains the complete source snapshot for the current Danny Recon Site published at https://car-recond-japan.haloultraman3.chatgpt.site/.

- Source commit: a77feb10f0611b5df8663762dbd8983f14a0d1a8
- Snapshot date: 2026-10-12
- Stack: Vinext / React, built for the existing Sites runtime and its Cloudflare bindings.
- app/ and lib/ contain the routes and server behavior; public/ contains the browser assets; out/ contains the page templates used by the Site.
- .openai/hosting.json keeps the existing Site project and storage binding names. Runtime credentials and .dev.vars are not included in this snapshot.

To work with the app, open this folder and run npm install, then npm run dev. Build with npm run build. Local development of authenticated CMS and storage features also needs the existing runtime configuration; the public GitHub repository does not contain those secrets.

The repository root keeps its existing GitHub Pages demo intact. This subfolder is the full-stack Sites source; GitHub Pages cannot run its server routes or D1/R2-backed admin tools by itself.
