---
'@grasdouble/slm_parcel_learn': minor
'@grasdouble/slm-container': minor
---

feat: replace query param navigation with real URL routing using TanStack Router in the learn parcel

Adds TanStack Router (code-based, type-safe) in the learn parcel. Catalog and guide navigation now uses clean path-based URLs (`/learn/:catalogId` and `/learn/:catalogId/:guideId`) instead of query parameters (`?catalog=x&guide=y`). Navigation calls are fully type-safe — TypeScript validates route params at compile time. The container's `activeWhen` logic now supports prefix path matching so the parcel activates for all `/learn/*` routes. Sitemap URLs are updated to match the new URL format.
