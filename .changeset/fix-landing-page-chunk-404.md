---
'@grasdouble/slm_parcel_landing-page': patch
---

fix: convert animation dynamic imports to static imports and defer HeroCanvas mount.

**404 on CDN (root cause):** Dynamic `await import()` calls introduced in 1.2.7 generated separate chunk files (`floatingTokens-CUNWOPW8.js`, etc.). The CDN serves `home.mjs` as a flat file with no subdirectory, so chunk paths never resolved → 404 and broken animations. Replaced with static imports so all animation modules bundle directly into `home.mjs`.

**Deferred mounting:** `HeroCanvas` is now mounted via `requestIdleCallback` (with `setTimeout(200ms)` fallback) in `HeroSection`. The canvas only appears after the browser is idle, letting the hero text and diorama image render immediately. The redundant `hasMounted` guard in `HeroCanvas` is removed.
