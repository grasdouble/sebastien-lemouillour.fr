---
"@grasdouble/slm_parcel_header-bar": patch
"@grasdouble/slm_parcel_landing-page": patch
"@grasdouble/slm_parcel_professional-experience": patch
"@grasdouble/slm-container": patch
---

Upgrade `@grasdouble/lufa_design-system` to 3.1.0 and fix DotNav scroll on Vivaldi/Chrome.

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
<DotNav sections={sections} activeId={activeId} onSelect={scrollTo} />
```


