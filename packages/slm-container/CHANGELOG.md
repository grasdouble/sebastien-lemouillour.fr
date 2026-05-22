# @grasdouble/slm-container

## 1.1.1

### Patch Changes

- 0aa21ef: Fix translations not working in production and preview modes.

  In production, `i18next` is a shared singleton loaded from CDN via import map. Each parcel was calling `i18n.init()` independently, but i18next ignores subsequent `init()` calls once already initialized — causing the first parcel to win and others to lose their translations.

  **Architecture changes:**
  - Container now owns the i18next `init()` call (with `LanguageDetector`, `initReactI18next`, and the `lufa:lang-change` event listener)
  - Each parcel registers its own translations via `addResourceBundle()` instead of `init()`
  - Each parcel uses a dedicated i18next namespace (`header-bar`, `landing-page`, `professional-experience`) to avoid key collisions
  - Fallback `init()` is preserved in each parcel for dev mode, where each Vite dev server has its own i18next instance

## 1.1.0

### Minor Changes

- 5bb40da: Register header-bar and professional-experience parcels, update import maps (dev/preview/prod), add pulsing dots loader between page transitions (single-spa lifecycle events), fix white flash on navigation via body background token, and add /loader preview route.

## 1.0.0

### Major Changes

- 35c0ec5: chore: Move code from Lufa repository

### Patch Changes

- d8d30f8: fix: missing change in importmap
