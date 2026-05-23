---
"@grasdouble/slm_parcel_landing-page": patch
---

Fix SectionDivider wave color not updating on theme change

Add a MutationObserver on `document.documentElement` to detect `data-theme` and `data-mode` attribute changes and refresh the `--wave-line-color` CSS variable used by the canvas animation.
