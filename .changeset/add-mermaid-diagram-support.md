---
'@grasdouble/slm-container': patch
'@grasdouble/slm_parcel_learn': minor
---

feat: add Mermaid diagram support and comparison table to learn parcel.

- Install mermaid package and bundle it lazily via MermaidBlock component
- Add MermaidBlock component with error state, cancellation guard, and strict security level
- Lazy-load MermaidBlock in LearnDetail to avoid initial bundle impact
- Add GFM table styles in LearnDetail.module.css with mobile overflow handling and centering
- Center mermaid diagrams via a flex wrapper div
- Add AI vs traditional software comparison table and AI/ML/DL hierarchy diagram to the "What is Artificial Intelligence" guide (EN + FR)
- Integrate DS color tokens into Mermaid diagrams via the `base` theme and `themeVariables`
- Add `getMermaidThemeVariables` to resolve DS CSS custom properties to hex at render time
- Add `useDSThemeKey` hook to re-render diagrams on theme/mode switch (via `lufa-theme-ready` event and MutationObserver); handles `auto` mode via `matchMedia`
- Dispatch `lufa-theme-ready` CustomEvent from slm-container after theme CSS has loaded
