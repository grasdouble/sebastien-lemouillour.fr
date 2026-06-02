---
'@grasdouble/slm-container': minor
---

fix: add ?external=react,react-dom,i18next to react-i18next and ?external=i18next to i18next-browser-languagedetector in importMapExternal.json to prevent bundled duplicate React instances causing useContext null crash in production.

feat: bundle all shared dependencies (react, react-dom, react/jsx-runtime, react-dom/client, i18next, react-i18next, i18next-browser-languagedetector, @tanstack/react-router, clsx, mermaid) into dist/vendor/*.mjs at build time. Production import map now points to local /vendor/ files instead of esm.sh CDN, eliminating the risk of future duplicate-instance regressions. React family is combined into a single react-bundle.mjs using esbuild with explicit named exports.

fix: replace CJS-only use-sync-external-store/shim (and /shim/with-selector) with ESM shims backed by React 18+'s native useSyncExternalStore. This prevents a runtime "Dynamic require of react is not supported" crash in react-i18next and @tanstack/react-router vendor bundles.
