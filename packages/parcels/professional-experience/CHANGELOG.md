# Changelog

## 1.0.12

### Patch Changes

- 49b213a: chore: colocalize test files in `__tests__` at the same level as source.

  Test files are now organized according to the convention: tests are placed in a `__tests__` folder at the same directory level as the file being tested, not in a central location. This improves discoverability and follows standard JavaScript/TypeScript practices.

- Updated dependencies [49b213a]
  - @grasdouble/slm_shared@1.1.3

## 1.0.11

### Patch Changes

- e895eb0: fix: use `--max-warnings 0` param with eslint
- Updated dependencies [e895eb0]
  - @grasdouble/slm_shared@1.1.2

## 1.0.10

### Patch Changes

- d75fe82: chore: update dependencies
- Updated dependencies [d75fe82]
  - @grasdouble/slm_shared@1.1.1

## 1.0.9

### Patch Changes

- ca929d0: refactor: move CDN-provided deps from dependencies to peerDependencies.

  Packages loaded at runtime via import map (react, react-dom, i18next, react-i18next, i18next-browser-languagedetector, @grasdouble/lufa_design-system, @tanstack/react-router, mermaid) are now declared as peerDependencies, with devDependencies for local dev. Only truly bundled packages (react-markdown, remark-gfm, @grasdouble/slm_shared) remain in dependencies. Vite externalizeDeps config updated accordingly (peerDeps: true, deps: false). Unused clsx dependency removed from all parcels.

## 1.0.8

### Patch Changes

- f19544d: chore: bump lufa_design-system to 3.4.0 and lufa_design-system-themes to 1.1.7 in container and learn parcel.
- Updated dependencies [f19544d]
  - @grasdouble/slm_shared@1.1.0

## 1.0.7

### Patch Changes

- ac334d9: chore: bump @grasdouble/lufa_config_vitest from ^1.0.1 to ^1.0.2
- 95089ba: fix: upgrade deps
- Updated dependencies [ac334d9]
  - @grasdouble/slm_shared@1.0.1

## 1.0.6

### Patch Changes

- bd682ee: test: add Vitest configuration and unit tests to all parcels, vite plugins, and the container. Each package uses `mergeConfig(baseConfig, defineConfig({...}))` with local numeric thresholds. `test:coverage` is the quality gate (autoUpdate disabled). `test:coverage:update` refreshes thresholds using the base config formula (floor - 1 buffer).
- Updated dependencies [bd682ee]
- Updated dependencies [bd682ee]
  - @grasdouble/slm_shared@1.0.0

## 1.0.5

### Patch Changes

- 76a00fa: feat: add decoupled sitemap architecture for all parcels — each parcel owns its routes and generates dist/sitemap.xml at build time via the new shared @grasdouble/slm_plugin_vite_sitemap-generator Vite plugin; container emits only a sitemapindex aggregating all parcels; Apache routes /<name>/sitemap.xml to a PHP proxy that reads the CDN importMap.json to resolve versions dynamically; robots.txt added; sitemap-core.xml removed.
- Updated dependencies [76a00fa]
  - @grasdouble/slm_shared@0.3.0

## 1.0.4

### Patch Changes

- Updated dependencies [ea4f02c]
  - @grasdouble/slm_shared@0.2.0

## 1.0.3

### Patch Changes

- 6e48fb2: feat: add dynamic SEO (document.title, meta description, Open Graph) with i18n support and upgrade DS to 3.3.0.
- Updated dependencies [6e48fb2]
  - @grasdouble/slm_shared@0.1.0

## 1.0.2

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

## 1.0.1

### Patch Changes

- 0aa21ef: Fix translations not working in production and preview modes.

  In production, `i18next` is a shared singleton loaded from CDN via import map. Each parcel was calling `i18n.init()` independently, but i18next ignores subsequent `init()` calls once already initialized — causing the first parcel to win and others to lose their translations.

  **Architecture changes:**
  - Container now owns the i18next `init()` call (with `LanguageDetector`, `initReactI18next`, and the `lufa:lang-change` event listener)
  - Each parcel registers its own translations via `addResourceBundle()` instead of `init()`
  - Each parcel uses a dedicated i18next namespace (`header-bar`, `landing-page`, `professional-experience`) to avoid key collisions
  - Fallback `init()` is preserved in each parcel for dev mode, where each Vite dev server has its own i18next instance

## 1.0.0

### Major Changes

- 5bb40da: Create professional experience parcel: displays 8 positions (Qlik, Talend x2, INFOTEL, Steria x3, IM'INFO) with ExperienceCard components, mobile-responsive layout, full FR/EN i18n including translated job titles (roleKey), and skills badges.
