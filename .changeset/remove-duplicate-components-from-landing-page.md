---
'@grasdouble/slm_parcel_landing-page': patch
---

refactor: remove duplicate LangSwitcher and ThemeSelector components from landing-page.
LangSwitcher was already in @grasdouble/slm_shared; ThemeSelector was dead code (unused in this parcel).
