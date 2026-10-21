# Product refinement — 21 October 2026

## Audit
1. Separate theme preferences, fonts and accent colors break continuity.
2. Owner edits stop at browser storage; the export workflow prevents practical publishing.
3. Four columns at tablet widths and giant mobile footer reduce readability.

## Decisions
Use midnight navy, warm white, royal blue and one local sans family with Chinese/system fallbacks. Green is reserved for WhatsApp. Manual theme choice wins; otherwise follow the system. Readable two-column tablet cards replace tiny metadata. Keep genuine photography, inventory comparison, vehicle gallery and tint-only services. No invented analytics, review counts, warranty or auction grades.

## Implementation
- Shared initial theme script, design tokens and accessible header controls across public site, login, owner tools.
- Compact responsive footer; safe-area-aware floating contact control.
- Owner overview, vehicles, media, homepage, deliveries, tools/settings, advanced backup; no fake enquiry inbox.
- Authenticated persistent content drafts, media and explicit publish with version conflict protection and rollback.
- Homepage content controls and photo reorder/crop; preserve existing advanced editors.
- Standalone calculator and JPJ tool using the existing finance engine and explicit applicability.
- Automated logic/security checks plus browser desktop/mobile workflow checks.

## Verification
Record actual results in REFINEMENT-VERIFICATION.md. Unavailable integrations must be stated explicitly.
