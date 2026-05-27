---
'@grasdouble/slm_config_vitest': major
---

feat: initial release — exports `baseConfig` for direct use with `mergeConfig(baseConfig, defineConfig({...}))`. Includes `autoUpdate: (n) => Math.floor(n - 1)` for a 1-point buffer below actual coverage when updating thresholds.
