---
"@grasdouble/slm_parcel_header-bar": patch
"@grasdouble/slm_parcel_landing-page": patch
"@grasdouble/slm_parcel_professional-experience": patch
"@grasdouble/slm-container": patch
---

Fix translations in production and DotNav scroll/selection bugs.

## i18n — shared singleton in production

In production, `i18next` is a shared singleton loaded from CDN via import map. Each parcel was calling `i18n.init()` independently, but i18next silently ignores subsequent `init()` calls once already initialized — causing only the first parcel to register its translations.

**Architecture changes:**
- Container now owns the i18next `init()` call (with `LanguageDetector`, `initReactI18next`, and the `lufa:lang-change` event listener)
- Each parcel registers its translations via `addResourceBundle()` instead of `init()`
- Each parcel uses a dedicated namespace (`header-bar`, `landing-page`, `professional-experience`) to avoid key collisions
- Fallback `init()` is preserved in parcels for dev mode, where each Vite dev server has its own i18next instance

## DotNav — wrong active item and smooth scroll on Vivaldi/Chrome

The `onSelect` handler was calling `scrollIntoView()` but not using `setActiveId` or `lockFor` from `useScrollSpy`. This caused two bugs on Vivaldi and Chrome:

1. The active dot did not update immediately on click
2. During the scroll animation, the IntersectionObserver fired on intermediate sections, making the wrong dot appear selected
3. Native `scrollIntoView({ behavior: 'smooth' })` was silently ignored on some Chromium-based browsers

**Fix:** upgrade to `@grasdouble/lufa_design-system@3.1.0` which exposes `scrollTo` directly from `useScrollSpy`. The hook now handles `setActiveId`, `lockFor`, and a cross-browser `requestAnimationFrame` animation internally:

```tsx
const { activeId, scrollTo } = useScrollSpy({ ids: sectionIds });
<DotNav sections={sections} activeId={activeId} onSelect={scrollTo} />
```

