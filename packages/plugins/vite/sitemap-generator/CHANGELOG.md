# Changelog

## 1.1.0

### Minor Changes

- 33ec143: feat: add dynamic sitemap for the learn parcel, filtered by publishedAt at request time.

  `sitemapPublishedAtFilterPlugin` (new named export) emits `sitemap-publishedAt-filter.json` at build time with all URLs and their `publishedAt` dates. The `sitemap-proxy.php` fetches this file at request time, filters entries where `publishedAt > today`, and generates the XML dynamically — falling back to the static `sitemap.xml` for parcels that don't provide a manifest. The container README documents the full proxy flow and file format.

- 33ec143: test: improve coverage.

## 1.0.4

### Patch Changes

- e895eb0: fix: use `--max-warnings 0` param with eslint

## 1.0.3

### Patch Changes

- d75fe82: chore: update dependencies

## 1.0.2

### Patch Changes

- ac334d9: chore: bump @grasdouble/lufa_config_vitest from ^1.0.1 to ^1.0.2

## 1.0.1

### Patch Changes

- bd682ee: test: add Vitest configuration and unit tests to all parcels, vite plugins, and the container. Each package uses `mergeConfig(baseConfig, defineConfig({...}))` with local numeric thresholds. `test:coverage` is the quality gate (autoUpdate disabled). `test:coverage:update` refreshes thresholds using the base config formula (floor - 1 buffer).

## 1.0.0

### Major Changes

- 76a00fa: feat: add decoupled sitemap architecture for all parcels — each parcel owns its routes and generates dist/sitemap.xml at build time via the new shared @grasdouble/slm_plugin_vite_sitemap-generator Vite plugin; container emits only a sitemapindex aggregating all parcels; Apache routes /<name>/sitemap.xml to a PHP proxy that reads the CDN importMap.json to resolve versions dynamically; robots.txt added; sitemap-core.xml removed.
