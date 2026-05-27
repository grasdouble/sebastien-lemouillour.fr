---
'@grasdouble/slm-container': patch
---

perf: add preconnect hints and lazy-load theme CSS.

Add `<link rel="preconnect">` for cdn.sebastien-lemouillour.fr and esm.sh to eliminate connection setup time for the render-blocking design system CSS. Add `twitter:card` meta tags. Convert the 10 eagerly imported theme CSS files to dynamic imports — only the active theme loads at startup, all others are code-split and fetched on demand when the user switches themes.
