# Changelog

## 1.0.0

### Major Changes

- 76a00fa: feat: add decoupled sitemap architecture for all parcels — each parcel owns its routes and generates dist/sitemap.xml at build time via the new shared @grasdouble/slm_plugin_vite_sitemap-generator Vite plugin; container emits only a sitemapindex aggregating all parcels; Apache routes /<name>/sitemap.xml to a PHP proxy that reads the CDN importMap.json to resolve versions dynamically; robots.txt added; sitemap-core.xml removed.
