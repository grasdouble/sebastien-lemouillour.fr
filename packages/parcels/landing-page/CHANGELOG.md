# @grasdouble/slm_parcel_landing-page

## 1.2.0

### Minor Changes

- 8d43c2d: feat: replace hero logo with diorama image and increase its display size.

## 1.1.0

### Minor Changes

- dbd1631: HeroSection: add animated canvas background (floating tokens, matrix rain, particle network) and refactor i18n `p3` with `<Trans>`.

## 1.0.5

### Patch Changes

- a60df4f: Fix SectionDivider wave color not updating on theme change

  Add a MutationObserver on `document.documentElement` to detect `data-theme` and `data-mode` attribute changes and refresh the `--wave-line-color` CSS variable used by the canvas animation.

## 1.0.4

### Patch Changes

- 825d041: Fix SectionDivider accessibility and performance issues
  - Add `aria-hidden="true"` on the canvas element (decorative content)
  - Respect `prefers-reduced-motion: reduce` — animation is skipped when active
  - Fix potential memory leak: initialize `animationId` to `-1` to ensure `cancelAnimationFrame` is always called with a valid value on unmount
  - Read `waveColor` once per resize instead of on every animation frame (`getComputedStyle` at 60fps)

## 1.0.3

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

## 1.0.2

### Patch Changes

- 0aa21ef: Fix translations not working in production and preview modes.

  In production, `i18next` is a shared singleton loaded from CDN via import map. Each parcel was calling `i18n.init()` independently, but i18next ignores subsequent `init()` calls once already initialized — causing the first parcel to win and others to lose their translations.

  **Architecture changes:**
  - Container now owns the i18next `init()` call (with `LanguageDetector`, `initReactI18next`, and the `lufa:lang-change` event listener)
  - Each parcel registers its own translations via `addResourceBundle()` instead of `init()`
  - Each parcel uses a dedicated i18next namespace (`header-bar`, `landing-page`, `professional-experience`) to avoid key collisions
  - Fallback `init()` is preserved in each parcel for dev mode, where each Vite dev server has its own i18next instance

## 1.0.1

### Patch Changes

- 5bb40da: Remove local LangSwitcher and ThemeSelector (now handled by header-bar parcel), and listen to lufa:lang-change custom event to sync language changes across parcels.
- 9f9d330: Update projects list: add sebastien-lemouillour.fr, replace Lufa with Lufa-Core, update i18n descriptions (fr/en)

## 1.0.0

### Major Changes

- 35c0ec5: chore: Move code from Lufa repository

### Patch Changes

- d8d30f8: fix: missing change in importmap
