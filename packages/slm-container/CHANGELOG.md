# @grasdouble/slm-container

## 2.2.1

### Patch Changes

- 8334b31: fix: change default theme/mode for ocean light
- Updated dependencies [49b213a]
  - @grasdouble/slm_shared@1.1.3

## 2.2.0

### Minor Changes

- ec0af19: feat: add import map overrides for preview environment and migrate to environment-based configuration. Refactor container's import map injection to use environment-specific override files and remove plugin dependency.

## 2.1.1

### Patch Changes

- d765370: fix: bundle highlight.js with rehype-highlight and add importmap subpath routing to prevent module resolution errors in production.

## 2.1.0

### Minor Changes

- 5c7f700: feat: add AI chatbot parcel with browser-based LLM, conversation history, and navigation integration.

### Patch Changes

- e895eb0: fix: use `--max-warnings 0` param with eslint
- Updated dependencies [e895eb0]
  - @grasdouble/slm_shared@1.1.2

## 2.0.1

### Patch Changes

- 90e6f22: fix: pakage name slm-vendors

## 2.0.0

### Major Changes

- d75fe82: feat: extract vendor bundling into a dedicated @grasdouble/slm-vendors CDN package.

  All shared dependencies (react-bundle, i18next, react-i18next, i18next-browser-languagedetector, @tanstack/react-router, clsx, mermaid) are now built and published as @grasdouble/slm-vendors. Vendor bundles are output at the package root (no dist/ subfolder) so CDN URLs are clean: cdn.sebastien-lemouillour.fr/@grasdouble/slm-vendors@VERSION/react-bundle.mjs. Cache busting is handled by the npm version in the CDN URL. In dev, vendors are served locally from the installed package via a Vite middleware.

### Minor Changes

- d75fe82: feat: bundle all shared dependencies (react, react-dom, react/jsx-runtime, react-dom/client, i18next, react-i18next, i18next-browser-languagedetector, @tanstack/react-router, clsx, mermaid) into dist/vendor/\*.mjs at build time. Production import map now points to local /vendor/ files instead of esm.sh CDN, eliminating the risk of future duplicate-instance regressions. React family is combined into a single react-bundle.mjs using esbuild with explicit named exports.

  fix: replace CJS-only use-sync-external-store/shim (and /shim/with-selector) with ESM shims backed by React 18+'s native useSyncExternalStore. This prevents a runtime "Dynamic require of react is not supported" crash in react-i18next and @tanstack/react-router vendor bundles.

### Patch Changes

- Updated dependencies [d75fe82]
  - @grasdouble/slm_shared@1.1.1

## 1.2.7

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

## 1.2.6

### Patch Changes

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

## 1.2.5

### Patch Changes

- 0892931: fix: externalize @grasdouble/lufa_design-system to prevent CJS require("react") error in production.

  DS 3.4.0 introduced a react-dom dependency (createPortal). Bundling the DS into the container caused rolldown (Vite 8) to inline react-dom CJS, which generates a `require("react")` call that the browser ESM environment cannot execute. The DS is already served from the CDN via the production import map, so it should be treated as a peer dependency — not bundled.

## 1.2.4

### Patch Changes

- f19544d: chore: bump lufa_design-system to 3.4.0 and lufa_design-system-themes to 1.1.7 in container and learn parcel.
- Updated dependencies [f19544d]
  - @grasdouble/slm_shared@1.1.0

## 1.2.3

### Patch Changes

- ac334d9: chore: bump @grasdouble/lufa_config_vitest from ^1.0.1 to ^1.0.2
- 95089ba: fix: upgrade deps
- Updated dependencies [ac334d9]
  - @grasdouble/slm_shared@1.0.1

## 1.2.2

### Patch Changes

- 6be21ce: perf: load design system CSS asynchronously to eliminate render-blocking resource.

  Replace the render-blocking `<link rel="stylesheet">` with a non-blocking `<link rel="preload" as="style" onload="...">` pattern (estimated 410ms saving per Lighthouse). The `<noscript>` fallback is omitted — the app is 100% JS-dependent (import map + parcels), so loading the DS CSS without JS provides no value.

## 1.2.1

### Patch Changes

- 6ac574a: perf: add preconnect hints and lazy-load theme CSS.

  Add `<link rel="preconnect">` for cdn.sebastien-lemouillour.fr and esm.sh to eliminate connection setup time for the render-blocking design system CSS. Add `twitter:card` meta tags. Convert the 10 eagerly imported theme CSS files to dynamic imports — only the active theme loads at startup, all others are code-split and fetched on demand when the user switches themes.

## 1.2.0

### Minor Changes

- dac262a: feat: replace query param navigation with real URL routing using TanStack Router in the learn parcel

  Adds TanStack Router (code-based, type-safe) in the learn parcel. Catalog and guide navigation now uses clean path-based URLs (`/learn/:catalogId` and `/learn/:catalogId/:guideId`) instead of query parameters (`?catalog=x&guide=y`). Navigation calls are fully type-safe — TypeScript validates route params at compile time. The container's `activeWhen` logic now supports prefix path matching so the parcel activates for all `/learn/*` routes. Sitemap URLs are updated to match the new URL format.

## 1.1.7

### Patch Changes

- bd682ee: test: add Vitest configuration and unit tests to all parcels, vite plugins, and the container. Each package uses `mergeConfig(baseConfig, defineConfig({...}))` with local numeric thresholds. `test:coverage` is the quality gate (autoUpdate disabled). `test:coverage:update` refreshes thresholds using the base config formula (floor - 1 buffer).
- Updated dependencies [bd682ee]
- Updated dependencies [bd682ee]
  - @grasdouble/slm_shared@1.0.0

## 1.1.6

### Patch Changes

- 76a00fa: feat: add decoupled sitemap architecture for all parcels — each parcel owns its routes and generates dist/sitemap.xml at build time via the new shared @grasdouble/slm_plugin_vite_sitemap-generator Vite plugin; container emits only a sitemapindex aggregating all parcels; Apache routes /<name>/sitemap.xml to a PHP proxy that reads the CDN importMap.json to resolve versions dynamically; robots.txt added; sitemap-core.xml removed.
- Updated dependencies [76a00fa]
  - @grasdouble/slm_shared@0.3.0

## 1.1.5

### Patch Changes

- ea4f02c: feat: add optional Google Analytics initialization and shared pageview tracking.
- Updated dependencies [ea4f02c]
  - @grasdouble/slm_shared@0.2.0

## 1.1.4

### Patch Changes

- 8761394: fix: prevent stale cache on importMap.json and container main.js
  - Add `{ cache: 'no-cache' }` to the runtime `fetch` of `importMap.json` so the browser always revalidates instead of serving a stale import map after a parcel deployment
  - Change `entryFileNames` from `[name].js` to `[name].[hash].js` so the container entry bundle gets a unique content hash on every build, preventing the browser from serving an outdated `main.js`

## 1.1.3

### Patch Changes

- 6e48fb2: feat: add Open Graph meta tags to index.html, register learn parcel in routing and import maps, and upgrade DS to 3.3.0.

## 1.1.2

### Patch Changes

- 66985b0: Upgrade `@grasdouble/lufa_design-system` to 3.1.0 and fix DotNav scroll on Vivaldi/Chrome.

  ## DotNav — smooth scroll not working on Vivaldi/Chrome

  Native scroll APIs (`scrollIntoView`, `window.scrollTo({ behavior: 'smooth' })`) are silently ignored on some Chromium-based browsers when smooth scroll is disabled in OS or browser settings.

  **Fix:** upgrade to `@grasdouble/lufa_design-system@3.1.0`, which exposes `scrollTo` directly from `useScrollSpy`. The hook now handles `setActiveId`, `lockFor`, and a cross-browser `requestAnimationFrame` animation internally — independent of any browser or OS setting.

  ```tsx
  // Before — manual wiring, native scroll unreliable
  const { activeId, setActiveId, lockFor } = useScrollSpy({ ids });
  const handleSelect = (id) => {
    setActiveId(id);
    lockFor(700);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  // After — one line, cross-browser
  const { activeId, scrollTo } = useScrollSpy({ ids });
  <DotNav sections={sections} activeId={activeId} onSelect={scrollTo} />;
  ```

## 1.1.1

### Patch Changes

- 0aa21ef: Fix translations not working in production and preview modes.

  In production, `i18next` is a shared singleton loaded from CDN via import map. Each parcel was calling `i18n.init()` independently, but i18next ignores subsequent `init()` calls once already initialized — causing the first parcel to win and others to lose their translations.

  **Architecture changes:**
  - Container now owns the i18next `init()` call (with `LanguageDetector`, `initReactI18next`, and the `lufa:lang-change` event listener)
  - Each parcel registers its own translations via `addResourceBundle()` instead of `init()`
  - Each parcel uses a dedicated i18next namespace (`header-bar`, `landing-page`, `professional-experience`) to avoid key collisions
  - Fallback `init()` is preserved in each parcel for dev mode, where each Vite dev server has its own i18next instance

## 1.1.0

### Minor Changes

- 5bb40da: Register header-bar and professional-experience parcels, update import maps (dev/preview/prod), add pulsing dots loader between page transitions (single-spa lifecycle events), fix white flash on navigation via body background token, and add /loader preview route.

## 1.0.0

### Major Changes

- 35c0ec5: chore: Move code from Lufa repository

### Patch Changes

- d8d30f8: fix: missing change in importmap
