---
purpose: Manage Danny's exhibition stock manually, with no cloud database or login.
domain: system
subject: vehicles with unique stock IDs
roles: [Danny]
home: [browser save state, status counts, searchable stock list, inline status actions]
modules: [Inventory, Add or edit vehicle, Website and profile]
writers: [owner-entered facts, browser-stored photos, derived stock counts]
cold_start: Add your first car and its photos.
excluded: [cloud database, Excel, login, hotspot editor, fabricated statistics]
deferred: [future authentication, production publication pending owner review]
visual: Navy personal brand, light stock surfaces, automotive blue actions, compact forms.
---

# Danny's exhibition stock workbench

The owner's latest clarification removes database, Excel and login requirements.
The workbench opens directly. Danny adds cars and photos manually and switches
Available, Unavailable, Booked, Sold, Draft or Archived, plus Auto or Manual.

## 给实现方

Keep the GitHub Pages website and calculator. Use browser storage for edits and
photo blobs; always label local saves honestly. An explicit preview URL applies
local changes only for Danny. Export a GitHub update ZIP containing repository-ready
inventory JSON and new photo files. Uploading those folders triggers the existing
Pages workflow. Never claim a browser save updated the public site.

Keep stable IDs, all normal photographs, presenter video and approved delivery
stories. Photo controls are accessible buttons, covers use 16:10, all mobile controls
are at least 44px, and archive/delete/bulk overwrite require confirmation.
