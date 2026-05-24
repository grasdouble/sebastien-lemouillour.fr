---
'@grasdouble/slm_parcel_landing-page': patch
---

fix: restore HeroCanvas animation on initial page load.

`hasMounted` was missing from both `useEffect` dependency arrays. The animation effect ran before the canvas existed (returning early on null ref), and never re-ran once the canvas appeared because its deps were unchanged. Adding `hasMounted` to both the IntersectionObserver and animation effects ensures they fire once the canvas is in the DOM.
