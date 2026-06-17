# Changelog

## 1.1.2

### Patch Changes

- 33ec143: test: improve coverage.

## 1.1.1

### Patch Changes

- 49b213a: chore: colocalize test files in `__tests__` at the same level as source.

  Test files are now organized according to the convention: tests are placed in a `__tests__` folder at the same directory level as the file being tested, not in a central location. This improves discoverability and follows standard JavaScript/TypeScript practices.

- 8334b31: fix: change default theme/mode for ocean light
- Updated dependencies [49b213a]
  - @grasdouble/slm_shared@1.1.3

## 1.1.0

### Minor Changes

- 5c7f700: feat: add AI chatbot parcel with browser-based LLM, conversation history, and navigation integration.

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

- f19544d: feat: move LangSwitcher component to shared package for reuse across parcels.
  fix: update i18next plural keys to CLDR v4 format (key_one/key_other) in learn parcel.
  refactor: header-bar LangSwitcher is now a re-export from @grasdouble/slm_shared.
  feat: add LangSwitcher to LearnDetail modal header.
  fix: header-bar now listens to lufa:lang-change event so its language syncs when another parcel changes it.
- f19544d: chore: bump lufa_design-system to 3.4.0 and lufa_design-system-themes to 1.1.7 in container and learn parcel.
- Updated dependencies [f19544d]
  - @grasdouble/slm_shared@1.1.0

## 1.0.7

### Patch Changes

- 95089ba: fix: upgrade deps
- ac334d9: fix: improve accessibility across parcels
  - header-bar: fix `window.location.pathname` evaluated during render (SSR/test hostile) → lazy initializer
  - header-bar: add `aria-label` to desktop and mobile `<nav>` elements
  - header-bar: add `aria-controls="mobile-menu"` to hamburger button; close mobile menu on Escape key
  - landing-page: make hero image decorative (`alt=""` + `aria-hidden="true"`) — name is in visible text
  - landing-page: replace hardcoded English aria-label on GitHub buttons with `t('projects.viewOnGithub', { title })`
  - learn: implement ARIA tabs roving tabindex keyboard navigation (ArrowLeft/ArrowRight) on view switcher

## 1.0.6

### Patch Changes

- bd682ee: test: add Vitest configuration and unit tests to all parcels, vite plugins, and the container. Each package uses `mergeConfig(baseConfig, defineConfig({...}))` with local numeric thresholds. `test:coverage` is the quality gate (autoUpdate disabled). `test:coverage:update` refreshes thresholds using the base config formula (floor - 1 buffer).

## 1.0.5

### Patch Changes

- 76a00fa: feat: add decoupled sitemap architecture for all parcels — each parcel owns its routes and generates dist/sitemap.xml at build time via the new shared @grasdouble/slm_plugin_vite_sitemap-generator Vite plugin; container emits only a sitemapindex aggregating all parcels; Apache routes /<name>/sitemap.xml to a PHP proxy that reads the CDN importMap.json to resolve versions dynamically; robots.txt added; sitemap-core.xml removed.

## 1.0.4

### Patch Changes

- 6e48fb2: feat: add Learn nav entry, rename route tutorials → learn, fix navigation centering, set Ocean as default theme, translate hamburger aria-labels, and upgrade DS to 3.3.0.

## 1.0.3

### Patch Changes

- de6aed1: Make the header bar sticky

  Apply `position: sticky; top: 0; z-index: 100` to the `#lufa-header` container element directly from the parcel's `mount`/`unmount` lifecycle hooks in `parcel.tsx`. This keeps the sticky positioning logic fully within the header-bar parcel. The visual styles (background and border) remain in `App.module.css`.

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

- 5bb40da: Create header-bar parcel: global navigation bar with NavBar (animated underline links, CSS Grid centering, mobile hamburger menu), ThemeSelector (11 themes managed via the design system `useTheme` hook — no custom event emitted), LangSwitcher (FR/EN), and a separator between controls. LangSwitcher dispatches a `lufa:lang-change` custom event for cross-parcel language synchronisation.
