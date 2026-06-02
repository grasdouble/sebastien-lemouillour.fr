---
'@grasdouble/slm_plugin_vite_import-map-injector': major
---

feat: remove extImportMap option — external dependencies are now managed through the standard import maps (prodImportMap, devImportMap, previewImportMap). This eliminates the concept of a separate "external" import map and simplifies the plugin API.

BREAKING CHANGE: The extImportMap parameter has been removed. If you were using extImportMap, merge those entries into your main import maps instead.
