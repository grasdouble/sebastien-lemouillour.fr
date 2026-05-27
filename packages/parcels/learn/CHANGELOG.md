# @grasdouble/slm_parcel_learn

## 1.0.3

### Patch Changes

- bd682ee: test: add Vitest configuration and unit tests to all parcels, vite plugins, and the container. Each package uses `mergeConfig(baseConfig, defineConfig({...}))` with local numeric thresholds. `test:coverage` is the quality gate (autoUpdate disabled). `test:coverage:update` refreshes thresholds using the base config formula (floor - 1 buffer).
- Updated dependencies [bd682ee]
- Updated dependencies [bd682ee]
  - @grasdouble/slm_shared@1.0.0

## 1.0.2

### Patch Changes

- 76a00fa: feat: add decoupled sitemap architecture for all parcels — each parcel owns its routes and generates dist/sitemap.xml at build time via the new shared @grasdouble/slm_plugin_vite_sitemap-generator Vite plugin; container emits only a sitemapindex aggregating all parcels; Apache routes /<name>/sitemap.xml to a PHP proxy that reads the CDN importMap.json to resolve versions dynamically; robots.txt added; sitemap-core.xml removed.
- Updated dependencies [76a00fa]
  - @grasdouble/slm_shared@0.3.0

## 1.0.1

### Patch Changes

- Updated dependencies [ea4f02c]
  - @grasdouble/slm_shared@0.2.0

## 1.0.0

### Major Changes

- 6e48fb2: feat: add learn parcel — filterable guides, catalogs, bilingual content, shareable URLs, and dynamic SEO.
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

### Patch Changes

- Updated dependencies [6e48fb2]
  - @grasdouble/slm_shared@0.1.0
