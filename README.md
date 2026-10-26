# Danny Recon Select

Live website: https://danny.stocklist.workers.dev/

The active website source is in `gemini-site/`. GitHub Pages builds that project and publishes `gemini-site/dist-pages/`. See [the project README](gemini-site/README.md) for local preview and inventory workbench instructions.

The previous root-level source files remain in the repository as a rollback reference. They are not used by the current Pages deployment. One sample lead file from the supplied archive was omitted because it contained customer names and phone numbers.

## Gemini AI Studio preview

Run `npm run dev` from the repository root. It opens the active `gemini-site/` showroom and its browser draft editor at `/studio/`. The default port is 3000, or use `PORT` / `--port`. This preview does not publish changes to the production account. See the project README for backups and publication.
