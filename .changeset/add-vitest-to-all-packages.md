---
'@grasdouble/slm_parcel_header-bar': patch
'@grasdouble/slm_parcel_landing-page': patch
'@grasdouble/slm_parcel_learn': patch
'@grasdouble/slm_parcel_professional-experience': patch
'@grasdouble/slm_plugin_vite_import-map-injector': patch
'@grasdouble/slm_plugin_vite_react-preamble': patch
'@grasdouble/slm_plugin_vite_sitemap-generator': patch
'@grasdouble/slm-container': patch
'@grasdouble/slm_shared': patch
---

test: add Vitest configuration and unit tests to all parcels, vite plugins, and the container. Each package uses `mergeConfig(baseConfig, defineConfig({...}))` with local numeric thresholds. `test:coverage` is the quality gate (autoUpdate disabled). `test:coverage:update` refreshes thresholds using the base config formula (floor - 1 buffer).
