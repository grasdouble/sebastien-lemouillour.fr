# Changelog

## 1.0.5

### Patch Changes

- 76a00fa: feat: add decoupled sitemap architecture for all parcels — each parcel owns its routes and generates dist/sitemap.xml at build time via the new shared @grasdouble/slm_plugin_vite_sitemap-generator Vite plugin; container emits only a sitemapindex aggregating all parcels; Apache routes /<name>/sitemap.xml to a PHP proxy that reads the CDN importMap.json to resolve versions dynamically; robots.txt added; sitemap-core.xml removed.

## 1.0.4

### Patch Changes

- 6e48fb2: feat: add Learn nav entry, rename route tutorials → learn, fix navigation centering, set Ocean as default theme, translate hamburger aria-labels, and upgrade DS to 3.3.0.

## 1.0.3

### Patch Changes

- de6aed1: Make the header bar sticky

  Apply `position: sticky; top: 0; z-index: 100` to the `#lufa-header` container element directly from the parcel's `mount`/`unmount` lifecycle hooks in `parcel.tsx`. This keeps the sticky positioning logic fully within the header-bar parcel. The visual styles (background and border) remain in `App.module.css`.

## 1.0.2

### Patch Changes

- 66985b0: Upgrade `@grasdouble/lufa_design-system` to 3.1.0 and fix DotNav scroll on Vivaldi/Chrome.

  ## DotNav — smooth scroll not working on Vivaldi/Chrome

  Native scroll APIs (`scrollIntoView`, `window.scrollTo({ behavior: 'smooth' })`) are silently ignored on some Chromium-based browsers when smooth scroll is disabled in OS or browser settings.

  **Fix:** upgrade to `@grasdouble/lufa_design-system@3.1.0`, which exposes `scrollTo` directly from `useScrollSpy`. The hook now handles `setActiveId`, `lockFor`, and a cross-browser `requestAnimationFrame` animation internally — independent of any browser or OS setting.

  ```tsx
  // Before — manual wiring, native scroll unreliable
  const { activeId, setActiveId, lockFor } = useScrollSpy({ ids });
  const handleSelect = (id) => {
    setActiveId(id);
    lockFor(700);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  // After — one line, cross-browser
  const { activeId, scrollTo } = useScrollSpy({ ids });
  <DotNav sections={sections} activeId={activeId} onSelect={scrollTo} />;
  ```

## 1.0.1

### Patch Changes

- 0aa21ef: Fix translations not working in production and preview modes.

  In production, `i18next` is a shared singleton loaded from CDN via import map. Each parcel was calling `i18n.init()` independently, but i18next ignores subsequent `init()` calls once already initialized — causing the first parcel to win and others to lose their translations.

  **Architecture changes:**
  - Container now owns the i18next `init()` call (with `LanguageDetector`, `initReactI18next`, and the `lufa:lang-change` event listener)
  - Each parcel registers its own translations via `addResourceBundle()` instead of `init()`
  - Each parcel uses a dedicated i18next namespace (`header-bar`, `landing-page`, `professional-experience`) to avoid key collisions
  - Fallback `init()` is preserved in each parcel for dev mode, where each Vite dev server has its own i18next instance

## 1.0.0

### Major Changes

- 5bb40da: Create header-bar parcel: global navigation bar with NavBar (animated underline links, CSS Grid centering, mobile hamburger menu), ThemeSelector (11 themes managed via the design system `useTheme` hook — no custom event emitted), LangSwitcher (FR/EN), and a separator between controls. LangSwitcher dispatches a `lufa:lang-change` custom event for cross-parcel language synchronisation.
