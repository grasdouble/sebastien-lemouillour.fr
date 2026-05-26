---
'@grasdouble/slm_parcel_learn': major
---

feat: add learn parcel — filterable guides, catalogs, bilingual content, shareable URLs, and dynamic SEO.

- New parcel at `/learn` with guide cards grouped by category and difficulty badges
- Catalog view with category grouping and explicit ordering via `order` frontmatter field
- 9 guides across 2 catalogs: IA/LLM fundamentals and Applied LLMs (API patterns, RAG, agents, production)
- Guide prose rewritten with human voice, opinions, and narrative transitions (EN + FR)
- Full i18n: categories, aria-labels, SEO, and markdown content
- Shareable URLs via `?guide=<id>` and `?catalog=<id>` query params with browser history support
- Dynamic SEO: document.title, meta description, and Open Graph tags per guide/catalog
- FilterBar with search, tag multi-select, and difficulty multi-select
- Detail modal with keyboard navigation (Escape), focus management, and a11y compliance
- Code quality: i18n fallback chain, frontmatter validation, shared CSS module, error handling
- chore: upgrade @grasdouble/lufa-design-system to 3.3.0
