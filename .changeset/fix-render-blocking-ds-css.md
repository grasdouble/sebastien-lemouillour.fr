---
'@grasdouble/slm-container': patch
---

perf: load design system CSS asynchronously to eliminate render-blocking resource.

Replace the render-blocking `<link rel="stylesheet">` with a non-blocking `<link rel="preload" as="style" onload="...">` pattern (estimated 410ms saving per Lighthouse). The `<noscript>` fallback is omitted — the app is 100% JS-dependent (import map + parcels), so loading the DS CSS without JS provides no value.
