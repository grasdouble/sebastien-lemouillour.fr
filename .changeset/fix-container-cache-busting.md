---
'@grasdouble/slm-container': patch
---

fix: prevent stale cache on importMap.json and container main.js

- Add `{ cache: 'no-cache' }` to the runtime `fetch` of `importMap.json` so the browser always revalidates instead of serving a stale import map after a parcel deployment
- Change `entryFileNames` from `[name].js` to `[name].[hash].js` so the container entry bundle gets a unique content hash on every build, preventing the browser from serving an outdated `main.js`
