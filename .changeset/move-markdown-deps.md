---
'@grasdouble/slm_parcel_learn': patch
---

fix: move markdown rendering dependencies to peer/dev dependencies.

Moved `react-markdown` and `remark-gfm` from direct dependencies to peerDependencies and devDependencies to reduce bundle size and clarify dependency relationships in the learn parcel.
