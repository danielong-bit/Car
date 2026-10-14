# Danny Recon CMS Implementation Plan

**Goal:** Preserve Sites v18 and deliver shared, authenticated vehicle/media/content management.
**Architecture:** Existing static showroom plus Vinext API routes on the same origin; Sites D1 stores draft/published content, immutable revisions and private enquiries; R2 stores media. Existing platform sign-in and ADMIN_EMAIL enforce authorization.
**Spec:** User Master Prompt V3, reconciled with approved photo-only Audi, desktop-first admin and current Sites source.

## Constraints
- Latest GitHub HEAD fc48b15363d48c25c783bf142eca556813a59a1a; Sites v18 is the newer presentation baseline.
- Preserve original assets, photo hotspots, calculator comparison and contact information.
- No real stock claims for existing sample inventory; no copied car-specific data on duplication.
- Keep draft media private until referenced by published content.
- Preserve existing ADMIN_EMAIL; never grant arbitrary signed-in users management rights.
- Version 18 remains the production rollback snapshot.

## Tasks
- [ ] Audit source/public files and record feature status.
- [ ] Add failing regression tests for schema validation, safe media URLs, publication projection and owner authorization.
- [ ] Implement D1 schema, migrations, R2 media validation, owner-only CMS API, optimistic revision checks, versions and enquiries.
- [ ] Port retained HTML through authenticated draft/public data bridge; replace local configuration as source of truth.
- [ ] Build desktop CMS navigation, shared overview, vehicle workflow, media reorder/framing, homepage/profile/delivery/finance editing and history.
- [ ] Add photo/detail routes, linked WhatsApp, honest appointment requests and published section rendering.
- [ ] Test APIs, browser workflows, public visibility, paths, mobile layout and security. Record blocked checks honestly.
- [ ] Build, publish, verify and provide owner guide/asset checklist.

## Review Focus
- Two editors: stale save/publish returns conflict, never silently overwrites.
- Unauthorized/anonymous users: every mutation, private media and enquiries denied.
- Script injection: plain text validated and encoded for legacy template rendering.
- Broken/temporary media: publishing rejects blob/data URLs and missing media references.
- No real inventory: sample data remains marked illustration; sold/unpublished excluded from active stock.
