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
