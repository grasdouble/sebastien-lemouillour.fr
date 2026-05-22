---
"@grasdouble/slm_parcel_header-bar": patch
"@grasdouble/slm_parcel_landing-page": patch
"@grasdouble/slm_parcel_professional-experience": patch
"@grasdouble/slm-container": patch
---

Fix translations not working in production and preview modes.

In production, `i18next` is a shared singleton loaded from CDN via import map. Each parcel was calling `i18n.init()` independently, but i18next ignores subsequent `init()` calls once already initialized — causing the first parcel to win and others to lose their translations.

**Architecture changes:**

- Container now owns the i18next `init()` call (with `LanguageDetector`, `initReactI18next`, and the `lufa:lang-change` event listener)
- Each parcel registers its own translations via `addResourceBundle()` instead of `init()`
- Each parcel uses a dedicated i18next namespace (`header-bar`, `landing-page`, `professional-experience`) to avoid key collisions
- Fallback `init()` is preserved in each parcel for dev mode, where each Vite dev server has its own i18next instance
