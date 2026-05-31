---
'@grasdouble/slm_parcel_header-bar': patch
'@grasdouble/slm_parcel_landing-page': patch
'@grasdouble/slm_parcel_professional-experience': patch
'@grasdouble/slm_parcel_learn': patch
---

refactor: move CDN-provided deps from dependencies to peerDependencies.

Packages loaded at runtime via import map (react, react-dom, i18next, react-i18next, i18next-browser-languagedetector, @grasdouble/lufa_design-system, @tanstack/react-router, mermaid) are now declared as peerDependencies, with devDependencies for local dev. Only truly bundled packages (react-markdown, remark-gfm, @grasdouble/slm_shared) remain in dependencies. Vite externalizeDeps config updated accordingly (peerDeps: true, deps: false). Unused clsx dependency removed from all parcels.
