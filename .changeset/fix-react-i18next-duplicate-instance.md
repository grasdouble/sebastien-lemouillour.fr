---
'@grasdouble/slm-container': patch
---

fix: add ?external=react,react-dom,i18next to react-i18next and ?external=i18next to i18next-browser-languagedetector in importMapExternal.json to prevent bundled duplicate React instances causing useContext null crash in production.
