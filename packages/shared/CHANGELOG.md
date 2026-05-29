# @grasdouble/slm_shared

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
