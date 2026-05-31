---
'@grasdouble/slm_parcel_learn': patch
'@grasdouble/slm-container': patch
---

fix: resolve MermaidBlock 404 by externalizing mermaid and removing lazy split

The CDN only serves each package's entry-point file; dynamic-import chunks placed
in `dist/` are unreachable. `React.lazy()` caused Vite to emit `MermaidBlock-Dbc8qtv9.js`
(and dozens of mermaid diagram chunks) as separate files that the CDN could never serve,
producing a runtime 404 and a broken Mermaid rendering.

Changes:
- `MermaidBlock` is now imported statically in `LearnDetail` (no `React.lazy`/`Suspense`)
- `mermaid` is removed from the `externalizeDeps` except-list so it is no longer bundled;
  it is instead served from `esm.sh` via a new entry in `importMapExternal.json`
- The build now produces a single self-contained `learn.mjs` with zero chunk files
