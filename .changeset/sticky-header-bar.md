---
'@grasdouble/slm_parcel_header-bar': patch
---

Make the header bar sticky

Apply `position: sticky; top: 0; z-index: 100` to the `#lufa-header` container element directly from the parcel's `mount`/`unmount` lifecycle hooks in `parcel.tsx`. This keeps the sticky positioning logic fully within the header-bar parcel. The visual styles (background and border) remain in `App.module.css`.
