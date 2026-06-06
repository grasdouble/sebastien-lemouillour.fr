# @grasdouble/slm_parcel_learn

## 1.4.0

### Minor Changes

- e895eb0: feat: add subcategory field to catalogs for hierarchical organization.

  Added a new `subcategory` field to all catalog metadata (catalog.json files) with bilingual support (FR/EN). Subcategories represent a level within the parent category: "fondamentaux"/"fundamentals", "usage", "avancé"/"advanced", or "engineering".

  This change distinguishes catalog subcategories from guide tags:
  - **Catalog.subcategory** (string) — represents the catalog's level/purpose within its category
  - **Tutorial.tags** (string[]) — represents guide-specific topics/keywords

  Implementation includes:
  - Updated type definitions (Catalog, CatalogTranslations) with `subcategory: string` field
  - Added subcategory to all 16 catalogs across all categories (ia-llm, ia-llm-old, tooling, architecture)
  - Updated data parsing logic to extract subcategory from translations
  - Added comprehensive tests to ensure all catalogs have valid bilingual subcategories
  - Updated CatalogCard component to display subcategory as a green badge alongside the guide count

  Subcategories help users quickly identify the level and purpose of each catalog at a glance, while keeping the namespace separate from guide tags for future filtering features.

- e895eb0: feat: split single-catalog subcategories into multiple catalogs.

  Split 3 large catalogs with isolated subcategories into 6 balanced catalogs for better navigation:
  - `prompting` (12) → `prompting-fundamentals` (6) + `prompting-advanced` (6)
  - `agents-orchestration` (13) → `agents-fundamentals` (7) + `agents-orchestration-workflows` (6)
  - `fine-tuning-optimization` (11) → `model-training-alignment` (5) + `model-optimization-deployment` (6)

  This ensures every subcategory now has at least 2 catalogs, improving discoverability and organization.

### Patch Changes

- e895eb0: fix: use `--max-warnings 0` param with eslint
- 5c7f700: fix: move markdown rendering dependencies to peer/dev dependencies.

  Moved `react-markdown` and `remark-gfm` from direct dependencies to peerDependencies and devDependencies to reduce bundle size and clarify dependency relationships in the learn parcel.

- e895eb0: chore: remove obsolete cross-guide references after catalog reorganization. Cleaned up 27 guide files (18 FR + 9 EN) to remove references like "read the guide on X" or "the next guide" that became outdated after splitting catalogs. Guides are now fully autonomous without navigation assumptions.
- Updated dependencies [e895eb0]
  - @grasdouble/slm_shared@1.1.2

## 1.3.4

### Patch Changes

- d75fe82: chore: update dependencies
- Updated dependencies [d75fe82]
  - @grasdouble/slm_shared@1.1.1

## 1.3.3

### Patch Changes

- 4f5bacd: fix: human review of certain guides and update of the publication date
- 4f5bacd: fix: review all prompting catalog guides — factual accuracy, voice, and official doc links.
  fix: re-review common-prompting-mistakes, structure-of-a-good-prompt, structured-outputs — corrected provider URLs, Gemini API shape, and voice transitions.

## 1.3.2

### Patch Changes

- ca929d0: refactor: move CDN-provided deps from dependencies to peerDependencies.

  Packages loaded at runtime via import map (react, react-dom, i18next, react-i18next, i18next-browser-languagedetector, @grasdouble/lufa_design-system, @tanstack/react-router, mermaid) are now declared as peerDependencies, with devDependencies for local dev. Only truly bundled packages (react-markdown, remark-gfm, @grasdouble/slm_shared) remain in dependencies. Vite externalizeDeps config updated accordingly (peerDeps: true, deps: false). Unused clsx dependency removed from all parcels.

## 1.3.1

### Patch Changes

- 075bf2f: fix: resolve MermaidBlock 404 by externalizing mermaid and removing lazy split

  The CDN only serves each package's entry-point file; dynamic-import chunks placed
  in `dist/` are unreachable. `React.lazy()` caused Vite to emit `MermaidBlock-Dbc8qtv9.js`
  (and dozens of mermaid diagram chunks) as separate files that the CDN could never serve,
  producing a runtime 404 and a broken Mermaid rendering.

  Changes:
  - `MermaidBlock` is now imported statically in `LearnDetail` (no `React.lazy`/`Suspense`)
  - `mermaid` is removed from the `externalizeDeps` except-list so it is no longer bundled;
    it is instead served from `esm.sh` via a new entry in `importMapExternal.json`
  - The build now produces a single self-contained `learn.mjs` with zero chunk files

## 1.3.0

### Minor Changes

- 1a93f69: feat: add Mermaid diagram support and comparison table to learn parcel.
  - Install mermaid package and bundle it lazily via MermaidBlock component
  - Add MermaidBlock component with error state, cancellation guard, and strict security level
  - Lazy-load MermaidBlock in LearnDetail to avoid initial bundle impact
  - Add GFM table styles in LearnDetail.module.css with mobile overflow handling and centering
  - Center mermaid diagrams via a flex wrapper div
  - Add AI vs traditional software comparison table and AI/ML/DL hierarchy diagram to the "What is Artificial Intelligence" guide (EN + FR)
  - Integrate DS color tokens into Mermaid diagrams via the `base` theme and `themeVariables`
  - Add `getMermaidThemeVariables` to resolve DS CSS custom properties to hex at render time
  - Add `useDSThemeKey` hook to re-render diagrams on theme/mode switch (via `lufa-theme-ready` event and MutationObserver); handles `auto` mode via `matchMedia`
  - Dispatch `lufa-theme-ready` CustomEvent from slm-container after theme CSS has loaded

- 1a93f69: feat: add tables and Mermaid diagrams to 57 AI/LLM guides across all 6 categories.

  Improved 57 guides (114 files — EN + FR) in the `ia-llm` learn parcel with structured Markdown tables and Mermaid flow diagrams to make concepts easier to scan and understand:
  - **understanding-llms** (11 guides): temperature, top-k, top-p, generation-parameters, different-types-of-ai-models, open-source-vs-proprietary-models, human-evaluation-of-models, transformers, automated-llm-evaluation, ai-machine-learning-and-deep-learning, how-does-an-llm-generate-text
  - **agents-orchestration** (9 guides): agentic-rag, agentic-workflows, llm-workflows, prompt-chaining, tool-calling, mcp-model-context-protocol, multi-agent-architectures, model-routing, task-planning
  - **ai-engineering-production** (12 guides): agent-traces, ai-application-scalability, ai-cost-optimization, ai-engineering, ai-governance, ai-logs, ai-system-architecture, continuous-evaluation, cost-of-using-an-llm, guardrails, llm-monitoring, securing-ai-applications
  - **rag-vector-search** (12 guides): chunk-size, chunking, document-indexing, evaluating-a-rag-system, graph-rag, hybrid-search, long-context-vs-rag, multi-vector-rag, overlap, reranking, vector-databases, vector-search
  - **fine-tuning-optimization** (7 guides): dpo, fine-tuning, gpu-and-vram, inference, quantization, rlhf, serving
  - **prompting** (6 guides): common-prompting-mistakes, few-shot-prompting, output-validation, prompt-templates, structure-of-a-good-prompt, structured-outputs

## 1.2.0

### Minor Changes

- f19544d: feat: move LangSwitcher component to shared package for reuse across parcels.
  fix: update i18next plural keys to CLDR v4 format (key_one/key_other) in learn parcel.
  refactor: header-bar LangSwitcher is now a re-export from @grasdouble/slm_shared.
  feat: add LangSwitcher to LearnDetail modal header.
  fix: header-bar now listens to lufa:lang-change event so its language syncs when another parcel changes it.
- f19544d: feat: add AI and LLM Training catalog (4 catalogs, 101 guides — understanding-llms, building-with-llms, rag-vector-search, ai-engineering-production) with full bilingual EN/FR content.
  refactor: split ia-llm category from 4 catalogs into 6 — extract prompting, agents-orchestration, and fine-tuning-optimization from building-with-llms and ai-engineering-production; align, dpo, pre-training, rlhf and inference/serving moved to fine-tuning-optimization; agentic-rag moved to agents-orchestration.
  feat: add Copilot & AI Agents catalog with 6 bilingual guides covering Copilot setup, AGENTS.md best practices, skills, MCP, and custom agents.
  feat: add Modern Tooling catalog with 2 bilingual guides (pnpm workspaces, Vite).
  feat: add Front-end Architecture catalog with 1 bilingual guide (micro-frontends with React and single-spa).
  feat: highlight unpublished guide cards with a dashed border, reduced opacity, and a "Draft" badge.

### Patch Changes

- f19544d: fix: review all learn guides for factual accuracy, voice, and official doc links — catalogs: understanding-llms, building-with-llms, rag-vector-search, ai-engineering-production.
- f19544d: chore: bump lufa_design-system to 3.4.0 and lufa_design-system-themes to 1.1.7 in container and learn parcel.
- Updated dependencies [f19544d]
  - @grasdouble/slm_shared@1.1.0

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
