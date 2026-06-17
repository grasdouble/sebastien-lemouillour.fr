---
'@grasdouble/slm_plugin_vite_sitemap-generator': minor
'@grasdouble/slm_parcel_learn': minor
'@grasdouble/slm-container': patch
---

feat: add dynamic sitemap for the learn parcel, filtered by publishedAt at request time.

`sitemapPublishedAtFilterPlugin` (new named export) emits `sitemap-publishedAt-filter.json` at build time with all URLs and their `publishedAt` dates. The `sitemap-proxy.php` fetches this file at request time, filters entries where `publishedAt > today`, and generates the XML dynamically — falling back to the static `sitemap.xml` for parcels that don't provide a manifest. The container README documents the full proxy flow and file format.
