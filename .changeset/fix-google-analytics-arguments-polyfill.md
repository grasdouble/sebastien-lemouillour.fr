---
'@grasdouble/slm_shared': major
---

fix: use traditional function with `arguments` for GA4 gtag polyfill.

GA4's `gtag.js` checks `Object.prototype.toString.call(entry) === "[object Arguments]"` to identify queued gtag commands in the dataLayer. The previous polyfill used an arrow function with rest params (`...args`), which pushed a real `Array` — silently ignored by GA4, causing no events (page views, custom events) to ever reach Google Analytics.
