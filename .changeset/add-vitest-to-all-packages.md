---
'@grasdouble/slm_config_vitest': patch
'@grasdouble/slm_parcel_header-bar': patch
'@grasdouble/slm_parcel_landing-page': patch
'@grasdouble/slm_parcel_learn': patch
'@grasdouble/slm_parcel_professional-experience': patch
'@grasdouble/slm_plugin_vite_react-preamble': patch
'@grasdouble/slm_plugin_vite_sitemap-generator': patch
'@grasdouble/slm-container': patch
---

test: add Vitest configuration and unit tests to all parcels, vite plugins, and the container. Each package uses `mergeConfig(baseConfig, defineConfig({...}))` with local numeric thresholds. `test:coverage` is the quality gate (autoUpdate disabled). `test:coverage:update` refreshes thresholds using the base config formula (floor - 1 buffer). Shared base config centralises `include: src/**/*.{ts,tsx}`, and universal excludes (`vite-env.d.ts`, `*.module.css.d.ts`, `parcel.tsx`, barrel indexes, i18n, test files) so per-package configs only declare thresholds and package-specific excludes.
