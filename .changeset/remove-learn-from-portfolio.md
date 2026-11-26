---
'@grasdouble/slm-container': major
'@grasdouble/slm_parcel_header-bar': patch
'@grasdouble/slm-vendors': major
---

feat: remove the Learn section from the portfolio now that Handbook is independently hosted.

Remove the `/learn` routes without redirects, the menu entry, the sitemap entry, and the import map mappings. The vendor bundle no longer exports Mermaid or TanStack Router, which were only used by Learn.
