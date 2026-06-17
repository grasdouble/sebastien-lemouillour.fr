# @grasdouble/slm_plugin_vite_sitemap

Vite plugin that generates a `sitemap.xml` asset at build time.
A companion export `sitemapPublishedAtFilterPlugin` generates a `sitemap-publishedAt-filter.json` manifest for parcels that publish content with a future date.

## Usage

```js
import sitemapPlugin, { sitemapPublishedAtFilterPlugin } from '@grasdouble/slm_plugin_vite_sitemap';

// Static URLs
sitemapPlugin({
  baseUrl: 'https://example.com',
  urls: [
    { loc: '/', changefreq: 'monthly', priority: '1.0' },
    { loc: '/about', changefreq: 'yearly', priority: '0.5' },
  ],
});

// Dynamic URLs (computed at build time)
sitemapPlugin({
  baseUrl: 'https://example.com',
  urls: () => computeUrlsFromContent(),
});

// Empty sitemap (for parcels with no public routes)
sitemapPlugin({ urls: [] });

// Manifest for server-side publishedAt filtering
sitemapPublishedAtFilterPlugin({
  baseUrl: 'https://example.com',
  urls: () => buildLearnManifestUrls(),
});
```

## Options

### `baseUrl`

Type: `string` — Default: `'https://sebastien-lemouillour.fr'`

Base URL prepended to any `loc` that starts with `/`. Has no effect on entries whose `loc` is already an absolute URL.

### `urls`

Type: `SitemapUrl[] | () => SitemapUrl[]`

Static array of URL entries or a factory function returning them. Each entry accepts:

| Field         | Type     | Default     | Description                                                                                                             |
| ------------- | -------- | ----------- | ----------------------------------------------------------------------------------------------------------------------- |
| `loc`         | `string` | required    | Absolute URL or path (paths starting with `/` are prefixed with `baseUrl`)                                              |
| `lastmod`     | `string` | today       | ISO date (YYYY-MM-DD)                                                                                                   |
| `changefreq`  | `string` | `'monthly'` | Change frequency                                                                                                        |
| `priority`    | `string` | `'0.5'`     | Priority from 0.0 to 1.0                                                                                                |
| `publishedAt` | `string` | —           | ISO date (YYYY-MM-DD). If **absent** or `null` → always included. If present → visible only when `publishedAt <= today` |

## `sitemapPublishedAtFilterPlugin`

Generates `dist/sitemap-publishedAt-filter.json` containing all URL entries with their `publishedAt` fields.
A server-side proxy reads this manifest at request time and filters entries where `publishedAt <= today`, so unpublished content never appears in the sitemap without a rebuild.

**Catalog entries behaviour:** if any guide in a catalog has no `publishedAt` (always visible), the catalog itself must also be always visible — its entry should carry no `publishedAt` field.
