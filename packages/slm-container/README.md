# @grasdouble/slm-container

Single-SPA root container application for the Lufa platform. Orchestrates loading, mounting, and routing of microfrontend applications.

## Overview

This package serves as the main container and orchestrator for the Lufa microfrontend architecture. It:

- Loads and registers microfrontend applications dynamically
- Manages routing between microfrontends
- Provides shared dependencies via import maps
- Handles authentication and global state
- Implements error boundaries and fallback UI

## Architecture

Built with:

- **Single-SPA** - Microfrontend framework
- **React** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool

## Development

```bash
# Start dev server
pnpm app:mf:dev

# Build for production
pnpm app:mf:build

# Preview production build
pnpm app:mf:preview
```

## Google Analytics

Set `VITE_GOOGLE_ANALYTICS_ID` in the container environment to enable Google Analytics. When configured, the container initializes `gtag.js` once and parcels using `@grasdouble/slm_shared`'s `usePageSeo` hook automatically emit page views.

## Microfrontend Integration

New microfrontends are registered in the container configuration. Each microfrontend:

- Has its own repository and deployment pipeline
- Loads independently at runtime
- Shares common dependencies through the container
- Communicates via custom events or shared state

## Server configuration

The `.htaccess` files below must be configured manually on the servers. They are **not** managed by CI.

### Container hosting

Place a `.htaccess` at the root of the server where the container (`index.html`, JS, CSS) is hosted:

```apache
Options -MultiViews
RewriteEngine On

# Redirect www to non-www
RewriteCond %{HTTP_HOST} ^www\.(.+)$ [NC]
RewriteRule ^ https://%1%{REQUEST_URI} [L,R=301]

# PHP proxy: /<parcel>/sitemap.xml → sitemap-proxy.php
# sitemap-proxy.php reads CDN importMap.json at runtime to resolve the parcel bundle URL,
# then generates the sitemap dynamically:
#   1. If the parcel exposes sitemap-publishedAt-filter.json: filters URLs by publishedAt <= today and builds XML on the fly.
#   2. Otherwise: fetches and proxies the static sitemap.xml from the CDN.
RewriteRule ^([a-z-]+)/sitemap\.xml$ /sitemap-proxy.php?parcel=$1 [L]

# Single-spa: serve index.html for all non-file, non-directory requests
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^ index.html [L]

# index.html — always revalidated, never served from cache
<FilesMatch "^index\.html$">
  Header set Cache-Control "no-cache, must-revalidate"
</FilesMatch>

# Hashed assets (e.g. index.DDQFmmI_.js, main-ClsXMC0j.js, main-C0tzyRio.css) — permanent cache
<FilesMatch "[-\.][A-Za-z0-9_-]{6,}\.(js|css)$">
  Header set Cache-Control "max-age=31536000, immutable"
</FilesMatch>
```

### CDN (importMap.json)

Place a `.htaccess` at the root of the CDN server where `importMap.json` is hosted:

```apache
<FilesMatch "^importMap\.json$">
  Header set Cache-Control "no-cache, must-revalidate"
</FilesMatch>
```

## Sitemap proxy

`sitemap-proxy.php` serves the sitemap for each parcel at `/<parcel>/sitemap.xml`. It always returns valid XML — crawlers always see a clean URL.

**Requires PHP 7.4+** (arrow functions are used). No other PHP extensions beyond `curl` (optional, falls back to `file_get_contents`) are required.

### Request flow

```
/<parcel>/sitemap.xml   (.htaccess rewrite)
        │
        ▼
sitemap-proxy.php?parcel=<name>
        │
        ├─ 1. Fetch importMap.json from CDN → resolve parcel bundle URL
        │
        ├─ 2. Try fetching sitemap-publishedAt-filter.json (dynamic mode)
        │       └─ Filter entries: exclude publishedAt > today
        │       └─ Build and return XML on the fly
        │
        └─ 3. Fallback: fetch and proxy static sitemap.xml (static mode)
```

### Dynamic mode — sitemap-publishedAt-filter.json

A parcel opts into dynamic sitemaps by publishing a `sitemap-publishedAt-filter.json` alongside its bundle. The manifest contains **all** URL entries (including future ones) with their `publishedAt` dates. The proxy filters at request time so unpublished content is never exposed to crawlers without a rebuild.

**Manifest format:**

```json
{
  "baseUrl": "https://sebastien-lemouillour.fr",
  "urls": [
    { "loc": "/learn", "lastmod": "2026-06-15", "changefreq": "weekly", "priority": "0.8" },
    {
      "loc": "/learn/my-catalog",
      "publishedAt": "2026-07-01",
      "lastmod": "2026-06-10",
      "changefreq": "monthly",
      "priority": "0.7"
    }
  ]
}
```

- If `publishedAt` is **absent** → always included.
- If `publishedAt` is **present and ≤ today** → included.
- If `publishedAt` is **present and > today** → excluded until that date, with no rebuild required.

Use `sitemapPublishedAtFilterPlugin` from `@grasdouble/slm_plugin_vite_sitemap-generator` to generate this file at build time.

### Static mode — static sitemap.xml

Parcels that don't provide a `sitemap-publishedAt-filter.json` are served their static `sitemap.xml` as-is (no filtering). This is a fully supported mode for parcels whose content is always public.
