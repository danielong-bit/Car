# Danny Recon Select

Live website: https://danielong-bit.github.io/Car-Recond-Japan/

The customer-facing website is built and hosted by GitHub Pages. It does not need ChatGPT Sites or a server runtime to display the inventory, vehicle pages, Audi photo tour, language selector, or payment calculator.

## Publish

The GitHub Actions workflow builds the static site whenever a change reaches `main` and deploys it to GitHub Pages. In repository Settings → Pages, the publishing source must be set to **GitHub Actions**.

To build the Pages files locally, use Node.js 22.13 or later and run `npm run build:pages`. The output is written to `dist-pages/`.

## Update public content

The site reads its published vehicle and profile data from `data/public-site.json`. `/studio/` and `/admin/` open the showroom dashboard without a login for now. Dashboard edits are saved only in that browser and do not update the public website; export a backup before clearing browser data. To publish changes, edit `data/public-site.json` in GitHub and save to `main` to start a new Pages deployment. Login protection can be added later with a backend.

This file contains only the public site snapshot. Do not put passwords, customer enquiries, or private customer records in the repository.

## Contact and bookings

WhatsApp links open Danny's number with an enquiry already filled in. The showroom form opens WhatsApp with the selected car, requested date, and customer contact details. GitHub Pages does not save bookings or track vehicle views in a server database.
