# @grasdouble/slm_parcel_learn

## 1.1.1

### Patch Changes

- 95089ba: fix: upgrade deps
- ac334d9: fix: improve accessibility across parcels
  - header-bar: fix `window.location.pathname` evaluated during render (SSR/test hostile) → lazy initializer
  - header-bar: add `aria-label` to desktop and mobile `<nav>` elements
  - header-bar: add `aria-controls="mobile-menu"` to hamburger button; close mobile menu on Escape key
  - landing-page: make hero image decorative (`alt=""` + `aria-hidden="true"`) — name is in visible text
  - landing-page: replace hardcoded English aria-label on GitHub buttons with `t('projects.viewOnGithub', { title })`
  - learn: implement ARIA tabs roving tabindex keyboard navigation (ArrowLeft/ArrowRight) on view switcher

- Updated dependencies [ac334d9]
  - @grasdouble/slm_shared@1.0.1

## 1.1.0

### Minor Changes

- dac262a: feat: replace query param navigation with real URL routing using TanStack Router in the learn parcel

  Adds TanStack Router (code-based, type-safe) in the learn parcel. Catalog and guide navigation now uses clean path-based URLs (`/learn/:catalogId` and `/learn/:catalogId/:guideId`) instead of query parameters (`?catalog=x&guide=y`). Navigation calls are fully type-safe — TypeScript validates route params at compile time. The container's `activeWhen` logic now supports prefix path matching so the parcel activates for all `/learn/*` routes. Sitemap URLs are updated to match the new URL format.

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
