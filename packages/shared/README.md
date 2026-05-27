# @grasdouble/slm_shared

Shared hooks and utilities for `sebastien-lemouillour.fr` parcels.

## Installation

This package is consumed as a workspace dependency:

```json
"@grasdouble/slm_shared": "workspace:*"
```

---

## API

### `usePageSeo`

React hook that updates the document title and Open Graph meta tags. When Google Analytics is initialized, it also emits a `page_view` event automatically on navigation (URL change).

```ts
import { usePageSeo } from '@grasdouble/slm_shared';

usePageSeo({
  title: 'My Page',
  description: 'Page description',
  url: 'https://sebastien-lemouillour.fr/my-page',
});
```

**Props**

| Prop            | Type      | Required | Default | Description                                                      |
| --------------- | --------- | -------- | ------- | ---------------------------------------------------------------- |
| `title`         | `string`  | ✅       | —       | Page title (`document.title` + `og:title`)                       |
| `description`   | `string`  | ✅       | —       | Meta description + `og:description`                              |
| `url`           | `string`  | ✅       | —       | Canonical URL (`og:url`) — drives page view tracking             |
| `trackPageView` | `boolean` | —        | `true`  | Set to `false` to opt out of GA page view tracking for this page |

> **Note:** page view events fire on mount and on `url` changes only. Title-only changes do not emit extra events.

---

## Google Analytics

GA is initialized once by the container (`slm-container`) and parcels integrate automatically via `usePageSeo`. Parcels can also emit custom events.

### Setup (container only)

The container calls `initializeGoogleAnalytics` once at startup. Parcels do not need to call it.

```ts
import { initializeGoogleAnalytics } from '@grasdouble/slm_shared';

initializeGoogleAnalytics(import.meta.env.VITE_GOOGLE_ANALYTICS_ID);
```

Set the `VITE_GOOGLE_ANALYTICS_ID` environment variable (format: `G-XXXXXXXXXX`) to enable GA. When the variable is absent or invalid, the function is a no-op and analytics are silently disabled.

### Automatic page view tracking

Any parcel that calls `usePageSeo` gets page view tracking for free. No additional setup is needed.

To opt a specific page out of tracking:

```ts
usePageSeo({ title, description, url, trackPageView: false });
```

### Custom event tracking

Use `trackGoogleAnalyticsEvent` to emit parcel-specific events. The function is a no-op when GA is not initialized.

```ts
import { trackGoogleAnalyticsEvent } from '@grasdouble/slm_shared';

// Simple event
trackGoogleAnalyticsEvent('project_click');

// Event with parameters
trackGoogleAnalyticsEvent('lesson_complete', {
  lesson_id: 'intro-typescript',
  duration_ms: 3200,
});
```

**Signature**

```ts
trackGoogleAnalyticsEvent(eventName: string, params?: GoogleAnalyticsEventParams): void
```

`GoogleAnalyticsEventParams` is `Record<string, unknown>`. All parameters are forwarded to `gtag` alongside `send_to` (set automatically from the measurement ID).

### Behaviour summary

| Scenario                                | Result                               |
| --------------------------------------- | ------------------------------------ |
| `VITE_GOOGLE_ANALYTICS_ID` not set      | No-op — analytics disabled, no error |
| Invalid measurement ID format           | `console.warn` + no-op               |
| `trackGoogleAnalyticsEvent` before init | No-op — safe to call at any time     |
| SSR / no `window`                       | No-op — all functions are SSR-safe   |
