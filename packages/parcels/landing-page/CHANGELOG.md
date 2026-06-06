# @grasdouble/slm_parcel_landing-page

## 1.2.13

### Patch Changes

- e895eb0: fix: use `--max-warnings 0` param with eslint
- Updated dependencies [e895eb0]
  - @grasdouble/slm_shared@1.1.2

## 1.2.12

### Patch Changes

- d75fe82: chore: update dependencies
- Updated dependencies [d75fe82]
  - @grasdouble/slm_shared@1.1.1

## 1.2.11

### Patch Changes

- ca929d0: refactor: move CDN-provided deps from dependencies to peerDependencies.

  Packages loaded at runtime via import map (react, react-dom, i18next, react-i18next, i18next-browser-languagedetector, @grasdouble/lufa_design-system, @tanstack/react-router, mermaid) are now declared as peerDependencies, with devDependencies for local dev. Only truly bundled packages (react-markdown, remark-gfm, @grasdouble/slm_shared) remain in dependencies. Vite externalizeDeps config updated accordingly (peerDeps: true, deps: false). Unused clsx dependency removed from all parcels.

## 1.2.10

### Patch Changes

- f19544d: refactor: remove duplicate LangSwitcher and ThemeSelector components from landing-page.
  LangSwitcher was already in @grasdouble/slm_shared; ThemeSelector was dead code (unused in this parcel).
- f19544d: chore: bump lufa_design-system to 3.4.0 and lufa_design-system-themes to 1.1.7 in container and learn parcel.
- Updated dependencies [f19544d]
  - @grasdouble/slm_shared@1.1.0

## 1.2.9

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

## 1.2.8

### Patch Changes

- 0ad1255: fix: convert animation dynamic imports to static imports and defer HeroCanvas mount.

  **404 on CDN (root cause):** Dynamic `await import()` calls introduced in 1.2.7 generated separate chunk files (`floatingTokens-CUNWOPW8.js`, etc.). The CDN serves `home.mjs` as a flat file with no subdirectory, so chunk paths never resolved → 404 and broken animations. Replaced with static imports so all animation modules bundle directly into `home.mjs`.

  **Deferred mounting:** `HeroCanvas` is now mounted via `requestIdleCallback` (with `setTimeout(200ms)` fallback) in `HeroSection`. The canvas only appears after the browser is idle, letting the hero text and diorama image render immediately. The redundant `hasMounted` guard in `HeroCanvas` is removed.

## 1.2.7

### Patch Changes

- 6be21ce: perf: eliminate forced layout reflow and lazy-load hero canvas animations.

  Replace `canvas.offsetWidth`/`offsetHeight` reads in ResizeObserver callbacks with `entries[0].contentRect` (already computed by the browser) to avoid a second forced layout pass. Defer the initial canvas sizing to `requestAnimationFrame` so layout is not read synchronously after React's commit phase.

  Convert static imports of the three animation modules to dynamic imports: `floatingTokens` is loaded on mount (default animation), `particleNetwork` and `matrixRain` are only fetched when the user selects them. This reduces the initial bundle by ~10KB and creates 4 separate chunks.

## 1.2.6

### Patch Changes

- 6ac574a: perf: optimize hero image and reduce JS bundle size by 94%.

  Replace the 495KB diorama.webp with compressed, responsive variants (27KB desktop / 13KB mobile). Add `srcset` + `sizes` attributes for correct image resolution per viewport, `fetchPriority="high"` and `loading="eager"` for LCP prioritization. Disable the canvas background animation on mobile viewports to reduce TBT/INP.

## 1.2.5

### Patch Changes

- bd682ee: test: add Vitest configuration and unit tests to all parcels, vite plugins, and the container. Each package uses `mergeConfig(baseConfig, defineConfig({...}))` with local numeric thresholds. `test:coverage` is the quality gate (autoUpdate disabled). `test:coverage:update` refreshes thresholds using the base config formula (floor - 1 buffer).
- Updated dependencies [bd682ee]
- Updated dependencies [bd682ee]
  - @grasdouble/slm_shared@1.0.0

## 1.2.4

### Patch Changes

- 76a00fa: feat: add decoupled sitemap architecture for all parcels — each parcel owns its routes and generates dist/sitemap.xml at build time via the new shared @grasdouble/slm_plugin_vite_sitemap-generator Vite plugin; container emits only a sitemapindex aggregating all parcels; Apache routes /<name>/sitemap.xml to a PHP proxy that reads the CDN importMap.json to resolve versions dynamically; robots.txt added; sitemap-core.xml removed.
- Updated dependencies [76a00fa]
  - @grasdouble/slm_shared@0.3.0

## 1.2.3

### Patch Changes

- Updated dependencies [ea4f02c]
  - @grasdouble/slm_shared@0.2.0

## 1.2.2

### Patch Changes

- 6e48fb2: feat: add dynamic SEO (document.title, meta description, Open Graph) with i18n support, set Ocean as default theme, and upgrade DS to 3.3.0.
- Updated dependencies [6e48fb2]
  - @grasdouble/slm_shared@0.1.0

## 1.2.1

### Patch Changes

- 7aa6db9: fix: restore HeroCanvas animation on initial page load.

  `hasMounted` was missing from both `useEffect` dependency arrays. The animation effect ran before the canvas existed (returning early on null ref), and never re-ran once the canvas appeared because its deps were unchanged. Adding `hasMounted` to both the IntersectionObserver and animation effects ensures they fire once the canvas is in the DOM.

## 1.2.0

### Minor Changes

- 8d43c2d: feat: replace hero logo with diorama image and increase its display size.

## 1.1.0

### Minor Changes

- dbd1631: HeroSection: add animated canvas background (floating tokens, matrix rain, particle network) and refactor i18n `p3` with `<Trans>`.

## 1.0.5

### Patch Changes

- a60df4f: Fix SectionDivider wave color not updating on theme change

  Add a MutationObserver on `document.documentElement` to detect `data-theme` and `data-mode` attribute changes and refresh the `--wave-line-color` CSS variable used by the canvas animation.

## 1.0.4

### Patch Changes

- 825d041: Fix SectionDivider accessibility and performance issues
  - Add `aria-hidden="true"` on the canvas element (decorative content)
  - Respect `prefers-reduced-motion: reduce` — animation is skipped when active
  - Fix potential memory leak: initialize `animationId` to `-1` to ensure `cancelAnimationFrame` is always called with a valid value on unmount
  - Read `waveColor` once per resize instead of on every animation frame (`getComputedStyle` at 60fps)

## 1.0.3

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

## 1.0.2

### Patch Changes

- 0aa21ef: Fix translations not working in production and preview modes.

  In production, `i18next` is a shared singleton loaded from CDN via import map. Each parcel was calling `i18n.init()` independently, but i18next ignores subsequent `init()` calls once already initialized — causing the first parcel to win and others to lose their translations.

  **Architecture changes:**
  - Container now owns the i18next `init()` call (with `LanguageDetector`, `initReactI18next`, and the `lufa:lang-change` event listener)
  - Each parcel registers its own translations via `addResourceBundle()` instead of `init()`
  - Each parcel uses a dedicated i18next namespace (`header-bar`, `landing-page`, `professional-experience`) to avoid key collisions
  - Fallback `init()` is preserved in each parcel for dev mode, where each Vite dev server has its own i18next instance

## 1.0.1

### Patch Changes

- 5bb40da: Remove local LangSwitcher and ThemeSelector (now handled by header-bar parcel), and listen to lufa:lang-change custom event to sync language changes across parcels.
- 9f9d330: Update projects list: add sebastien-lemouillour.fr, replace Lufa with Lufa-Core, update i18n descriptions (fr/en)

## 1.0.0

### Major Changes

- 35c0ec5: chore: Move code from Lufa repository

### Patch Changes

- d8d30f8: fix: missing change in importmap
