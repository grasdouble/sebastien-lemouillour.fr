---
"@grasdouble/slm_parcel_landing-page": patch
---

Fix SectionDivider accessibility and performance issues

- Add `aria-hidden="true"` on the canvas element (decorative content)
- Respect `prefers-reduced-motion: reduce` — animation is skipped when active
- Fix potential memory leak: initialize `animationId` to `-1` to ensure `cancelAnimationFrame` is always called with a valid value on unmount
- Read `waveColor` once per resize instead of on every animation frame (`getComputedStyle` at 60fps)
