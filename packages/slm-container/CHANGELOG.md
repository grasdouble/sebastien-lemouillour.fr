# @grasdouble/slm-container

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
