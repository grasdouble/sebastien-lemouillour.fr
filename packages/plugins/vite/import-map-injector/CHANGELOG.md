# @grasdouble/slm_plugin_vite_import-map-injector

## 2.0.1

### Patch Changes

- e895eb0: fix: use `--max-warnings 0` param with eslint

## 2.0.0

### Major Changes

- d75fe82: feat: remove extImportMap option — external dependencies are now managed through the standard import maps (prodImportMap, devImportMap, previewImportMap). This eliminates the concept of a separate "external" import map and simplifies the plugin API.

  BREAKING CHANGE: The extImportMap parameter has been removed. If you were using extImportMap, merge those entries into your main import maps instead.

## 1.0.3

### Patch Changes

- ac334d9: chore: bump @grasdouble/lufa_config_vitest from ^1.0.1 to ^1.0.2

## 1.0.2

### Patch Changes

- bd682ee: test: add Vitest configuration and unit tests to all parcels, vite plugins, and the container. Each package uses `mergeConfig(baseConfig, defineConfig({...}))` with local numeric thresholds. `test:coverage` is the quality gate (autoUpdate disabled). `test:coverage:update` refreshes thresholds using the base config formula (floor - 1 buffer).
- bd682ee: fix: production build now correctly injects the overridable import map script.

  test: add Vitest configuration and unit tests for the import map injector plugin.

## 1.0.1

### Patch Changes

- 6e48fb2: chore: upgrade lufa_config_eslint to 0.1.8, lufa_config_prettier to 0.1.5, and lufa_config_tsconfig to 0.1.4.

## 1.0.0

### Major Changes

- 35c0ec5: chore: Move code from Lufa repository
