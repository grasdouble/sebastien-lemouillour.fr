# @grasdouble/slm_shared

## 1.1.3

### Patch Changes

- 49b213a: chore: colocalize test files in `__tests__` at the same level as source.

  Test files are now organized according to the convention: tests are placed in a `__tests__` folder at the same directory level as the file being tested, not in a central location. This improves discoverability and follows standard JavaScript/TypeScript practices.

## 1.1.2

### Patch Changes

- e895eb0: fix: use `--max-warnings 0` param with eslint

## 1.1.1

### Patch Changes

- d75fe82: chore: update dependencies

## 1.1.0

### Minor Changes

- f19544d: feat: move LangSwitcher component to shared package for reuse across parcels.
  fix: update i18next plural keys to CLDR v4 format (key_one/key_other) in learn parcel.
  refactor: header-bar LangSwitcher is now a re-export from @grasdouble/slm_shared.
  feat: add LangSwitcher to LearnDetail modal header.
  fix: header-bar now listens to lufa:lang-change event so its language syncs when another parcel changes it.

## 1.0.1

### Patch Changes

- ac334d9: chore: bump @grasdouble/lufa_config_vitest from ^1.0.1 to ^1.0.2

## 1.0.0

### Major Changes

- bd682ee: fix: use traditional function with `arguments` for GA4 gtag polyfill.

  GA4's `gtag.js` checks `Object.prototype.toString.call(entry) === "[object Arguments]"` to identify queued gtag commands in the dataLayer. The previous polyfill used an arrow function with rest params (`...args`), which pushed a real `Array` — silently ignored by GA4, causing no events (page views, custom events) to ever reach Google Analytics.

### Patch Changes

- bd682ee: test: add Vitest configuration and unit tests to all parcels, vite plugins, and the container. Each package uses `mergeConfig(baseConfig, defineConfig({...}))` with local numeric thresholds. `test:coverage` is the quality gate (autoUpdate disabled). `test:coverage:update` refreshes thresholds using the base config formula (floor - 1 buffer).

## 0.3.0

### Minor Changes

- 76a00fa: feat: expose `trackGoogleAnalyticsEvent` to allow parcels to send custom GA4 events.
  docs: add README documenting the Google Analytics integration, `usePageSeo` options, and available API.

## 0.2.0

### Minor Changes

- ea4f02c: feat: add optional Google Analytics initialization and shared pageview tracking.

## 0.1.0

### Minor Changes

- 6e48fb2: feat: introduce shared package with `usePageSeo` hook for dynamic SEO (document.title, meta description, and Open Graph tags) consumed across all parcels.
