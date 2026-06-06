# @grasdouble/slm-vendors

## 1.0.2

### Patch Changes

- 5c7f700: fix: configure ESLint and TypeScript properly to lint all source files without disabling safety rules.

## 1.0.1

### Patch Changes

- 90e6f22: fix: pakage name slm-vendors

## 1.0.0

### Major Changes

- d75fe82: feat: extract vendor bundling into a dedicated @grasdouble/slm-vendors CDN package.

  All shared dependencies (react-bundle, i18next, react-i18next, i18next-browser-languagedetector, @tanstack/react-router, clsx, mermaid) are now built and published as @grasdouble/slm-vendors. Vendor bundles are output at the package root (no dist/ subfolder) so CDN URLs are clean: cdn.sebastien-lemouillour.fr/@grasdouble/slm-vendors@VERSION/react-bundle.mjs. Cache busting is handled by the npm version in the CDN URL. In dev, vendors are served locally from the installed package via a Vite middleware.
