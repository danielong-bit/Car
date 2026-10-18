---
name: Danny Recond Select — Simple Inventory Workbench V2
domain: system
subject: Vehicle inventory records (one unique Stock ID per vehicle)
purpose: Let Danny quickly add vehicles, organize photos, update pricing and status, and reliably export local browser updates to the existing GitHub Pages website.
owner: Danny Recond Select
surface: desktop
mobile: responsive-web
structure:
  primary: registry
  secondary: operation
moment: Opened whenever new stock arrives, photos are updated, prices change, or a vehicle is booked or sold.
---

# Danny Recond Select — Simple Inventory Workbench V2 (`.workbench/spec.md`)

## 1. Architecture & Storage Truth
- **Public Source of Truth**: `data/public-site.json` (published GitHub Pages snapshot)
- **Workbench Initial Source**: `data/inventory-workbench.json` (loaded when no local browser draft exists)
- **Local Draft Storage**: `IndexedDB` (`public/browser-stock.mjs`) storing `{ document, updatedAt, exportFingerprint, exportGeneratedAt }` and compressed `/assets/uploads/*` media blobs
- **Publication Workflow**: Download GitHub update ZIP (`Export GitHub update`) → manually upload & commit `data/` and `public/` to GitHub → live site updates after GitHub Pages deployment completes.

## 2. Navigation & Views (`/studio/`)
- **Focused 2-Item Sidebar**:
  1. `Inventory` (`sidebar-primary`) — Live Stock Pulse hook bar, 4 primary status KPIs (`Available`, `Booked`, `Sold`, `Draft`), embedded `Stock Attention` bar, search/filter toolbar (`More Filters` for `Unavailable`, `Archived`, `Year`, and `Stock Check`), and inline status table/card registry.
  2. `Website Settings` (`sidebar-secondary`) — Collapsible `<details>` groups for Brand & Contact, Showroom Display & Calculator Defaults, Recent Deliveries (Photos & Videos), Export/Backup/Reset to Website Stock, and Showroom Architecture & Feature Roadmap.
- **3-Step Vehicle Editor (`+ Add vehicle` / `Edit`)**:
  - `01 Basic Information` (open by default — includes Stock ID, Make, Model, Variant, Year, Price, Mileage, Status, Location, Transmission, Body, Condition `Recond / Pre-owned / Consignment`, and optional `RS / RF / LOW KM` card badges).
  - `02 Vehicle Photos` (open by default — drag-and-drop 1920px WebP compression, cover photo, 1/N order, category tags).
  - `03 Advanced Details` (collapsed by default — auction grade, interior grade, original auction report upload with privacy warning, engine, colours, features, and Danny's TikTok/Facebook walkthrough links; new vehicles default `conditionExample: false`).
