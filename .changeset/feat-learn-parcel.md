---
'@grasdouble/slm_parcel_learn': minor
---

feat: add learn parcel with filterable guides, catalogs, bilingual content (EN/FR), shareable URLs, and dynamic SEO.

- New parcel at `/learn` with guide cards grouped by category and difficulty badges
- Catalog view to group guides around a common theme
- Full i18n: metadata, markdown content, categories, aria-labels and SEO description
- Shareable URLs via `?guide=<id>` and `?catalog=<id>` query params with browser back support
- Dynamic SEO: updates document.title, meta description and Open Graph tags per guide
- FilterBar with search, tag multi-select, and difficulty multi-select
- Detail modal with keyboard navigation (Escape to close) and focus management
- Dev-time integrity checks (orphan guides, dangling catalog refs, unknown categoryKey)
