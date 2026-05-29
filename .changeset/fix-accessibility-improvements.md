---
'@grasdouble/slm_parcel_header-bar': patch
'@grasdouble/slm_parcel_landing-page': patch
'@grasdouble/slm_parcel_learn': patch
---

fix: improve accessibility across parcels

- header-bar: fix `window.location.pathname` evaluated during render (SSR/test hostile) → lazy initializer
- header-bar: add `aria-label` to desktop and mobile `<nav>` elements
- header-bar: add `aria-controls="mobile-menu"` to hamburger button; close mobile menu on Escape key
- landing-page: make hero image decorative (`alt=""` + `aria-hidden="true"`) — name is in visible text
- landing-page: replace hardcoded English aria-label on GitHub buttons with `t('projects.viewOnGithub', { title })`
- learn: implement ARIA tabs roving tabindex keyboard navigation (ArrowLeft/ArrowRight) on view switcher
