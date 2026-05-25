---
'@grasdouble/slm_parcel_learn': patch
---

fix: improve code quality and maintainability in learn parcel

- Harden i18n content fallback chain in `useLearn` (fr → en → empty string)
- Validate `difficulty` frontmatter value before casting in `parseFrontmatter`
- Add explanatory comment for magic number in duplicate-id detection
- Wrap all `history.pushState` calls in try/catch to prevent silent failures
- Remove redundant `aria-hidden="false"` on modal overlay (now `aria-hidden="true"`)
- Extract shared CSS module (`components/shared.module.css`) with `.learn-grid` and `.clickable-card` to eliminate duplication across `App`, `CatalogDetail`, `CatalogCard`, and `LearnCard`
