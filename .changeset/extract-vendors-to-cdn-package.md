---
'@grasdouble/slm-vendors': major
'@grasdouble/slm-container': major
---

feat: extract vendor bundling into a dedicated @grasdouble/slm_vendors CDN package.

All shared dependencies (react-bundle, i18next, react-i18next, i18next-browser-languagedetector, @tanstack/react-router, clsx, mermaid) are now built and published as @grasdouble/slm_vendors. Vendor bundles are output at the package root (no dist/ subfolder) so CDN URLs are clean: cdn.sebastien-lemouillour.fr/@grasdouble/slm_vendors@VERSION/react-bundle.mjs. Cache busting is handled by the npm version in the CDN URL. In dev, vendors are served locally from the installed package via a Vite middleware.
