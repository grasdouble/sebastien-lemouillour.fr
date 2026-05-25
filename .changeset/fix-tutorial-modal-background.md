---
'@grasdouble/slm_parcel_learn': patch
---

fix: correct CSS variable name for modal and filter bar backgrounds

`--lufa-semantic-ui-background-surface` was undefined — the correct token is `--lufa-semantic-ui-background-surface-default`. This caused the tutorial detail modal and filter bar to render with a transparent background, making page content bleed through.
