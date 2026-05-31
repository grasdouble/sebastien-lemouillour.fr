---
'@grasdouble/slm-container': patch
---

fix: externalize @grasdouble/lufa_design-system to prevent CJS require("react") error in production.

DS 3.4.0 introduced a react-dom dependency (createPortal). Bundling the DS into the container caused rolldown (Vite 8) to inline react-dom CJS, which generates a `require("react")` call that the browser ESM environment cannot execute. The DS is already served from the CDN via the production import map, so it should be treated as a peer dependency — not bundled.
