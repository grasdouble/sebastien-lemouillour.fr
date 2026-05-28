---
'@grasdouble/slm_parcel_landing-page': patch
---

perf: eliminate forced layout reflow and lazy-load hero canvas animations.

Replace `canvas.offsetWidth`/`offsetHeight` reads in ResizeObserver callbacks with `entries[0].contentRect` (already computed by the browser) to avoid a second forced layout pass. Defer the initial canvas sizing to `requestAnimationFrame` so layout is not read synchronously after React's commit phase.

Convert static imports of the three animation modules to dynamic imports: `floatingTokens` is loaded on mount (default animation), `particleNetwork` and `matrixRain` are only fetched when the user selects them. This reduces the initial bundle by ~10KB and creates 4 separate chunks.
