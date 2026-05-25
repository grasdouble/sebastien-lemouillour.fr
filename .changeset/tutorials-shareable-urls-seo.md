---
'@grasdouble/slm_parcel_tutorials': minor
---

feat: add shareable URLs and dynamic SEO meta tags for tutorial detail pages

- URL sync via `?tutorial=<id>` query param on open/close
- Browser back button support via `popstate` listener
- New `useTutorialSeo` hook: updates `document.title`, `meta[description]` and Open Graph tags dynamically per tutorial
