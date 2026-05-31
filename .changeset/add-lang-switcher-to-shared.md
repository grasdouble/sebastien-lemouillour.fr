---
'@grasdouble/slm_shared': minor
'@grasdouble/slm_parcel_header-bar': patch
'@grasdouble/slm_parcel_learn': minor
---

feat: move LangSwitcher component to shared package for reuse across parcels.
fix: update i18next plural keys to CLDR v4 format (key_one/key_other) in learn parcel.
refactor: header-bar LangSwitcher is now a re-export from @grasdouble/slm_shared.
feat: add LangSwitcher to LearnDetail modal header.
fix: header-bar now listens to lufa:lang-change event so its language syncs when another parcel changes it.
