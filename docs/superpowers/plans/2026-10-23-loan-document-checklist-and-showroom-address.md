# Loan Documents and Showroom Address Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add Danny’s supplied business address to the showroom contact experience and show a multilingual, privacy-conscious financing document checklist beside the loan calculator.

**Architecture:** Reuse the existing profile location value for contact and map destinations. Add the checklist to the shared vehicle-detail calculator markup and link to it from the enquiry section without creating a document-upload flow.

**Tech Stack:** Existing static HTML template strings, JavaScript modules, CSS, and JSON content.

**Spec:** `docs/superpowers/specs/2026-10-23-loan-document-checklist-and-showroom-address.md`

## Global Constraints

- Use the exact address supplied by Danny.
- Keep the checklist in English, Chinese, and Malay.
- Make clear that requirements vary by bank.
- Do not collect or transmit customer identity or financial documents.
- Do not alter cloud drafts, publish, or deploy.

## Review Focus

- Address must be escaped in visible text and encoded in map URLs.
- The disclosure must work with keyboard and touch through native `<details>` / `<summary>`.
- All language versions must say the same requirements and privacy guidance.
- Existing vehicle location facts must remain distinct from the business address.
- The address change must not add clutter to inventory cards.

---

### Task 1: Set and expose the full business address

**Files:**
- Modify: `gemini-site/data/inventory-workbench.json`
- Modify: `gemini-site/data/public-site.json`
- Modify: `gemini-site/public/workbench.mjs`
- Modify: `gemini-site/public/showroom.mjs`

- [ ] Set the profile location to `U8, Metropolitan Business Park, 4, Jalan Para U8/103, Bukit Jelutong, 40150 Shah Alam, Selangor` in both checked-in content documents.
- [ ] Rename the owner settings field to “Full business / showroom address”.
- [ ] Use the profile address in the customer-facing showroom contact and vehicle-viewing map link; leave per-vehicle area/location metadata unchanged.

### Task 2: Add the financing document checklist

**Files:**
- Modify: `gemini-site/public/vehicle-tools.mjs`
- Modify: `gemini-site/public/vehicle-tools.css`

- [ ] Add an expandable checklist to the shared calculator markup in English, Chinese, and Malay.
- [ ] Include IC/MyKad or accepted ID, driving licence, 3–6 months of payslips, 3–6 months of bank statements, EPF statement, and latest income tax filing/statement.
- [ ] Explain bank requirements vary and tell customers to ask Danny for a private submission method; add no upload control.
- [ ] Style the disclosure with existing site tokens, readable spacing, visible focus, and mobile wrapping.

### Task 3: Build and inspect local preview

**Files:** None.

- [ ] Run the project’s local preview build.
- [ ] Inspect the vehicle detail page and confirm address text/map destination and the collapsed/expanded checklist in all three languages.
- [ ] Confirm no external enquiry is submitted and no live content or deployment is changed.
