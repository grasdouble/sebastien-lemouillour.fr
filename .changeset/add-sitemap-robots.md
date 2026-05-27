---
'@grasdouble/slm_plugin_vite_sitemap-generator': major
'@grasdouble/slm-container': patch
'@grasdouble/slm_parcel_learn': patch
'@grasdouble/slm_parcel_landing-page': patch
'@grasdouble/slm_parcel_professional-experience': patch
'@grasdouble/slm_parcel_header-bar': patch
---

feat: add decoupled sitemap architecture for all parcels — each parcel owns its routes and generates dist/sitemap.xml at build time via the new shared @grasdouble/slm_plugin_vite_sitemap-generator Vite plugin; container emits only a sitemapindex aggregating all parcels; Apache routes /<name>/sitemap.xml to a PHP proxy that reads the CDN importMap.json to resolve versions dynamically; robots.txt added; sitemap-core.xml removed.
