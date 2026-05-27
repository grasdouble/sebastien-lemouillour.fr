---
'@grasdouble/slm_parcel_landing-page': patch
---

perf: optimize hero image and reduce JS bundle size by 94%.

Replace the 495KB diorama.webp with compressed, responsive variants (27KB desktop / 13KB mobile). Add `srcset` + `sizes` attributes for correct image resolution per viewport, `fetchPriority="high"` and `loading="eager"` for LCP prioritization. Disable the canvas background animation on mobile viewports to reduce TBT/INP.
