# @grasdouble/slm_plugin_vite_sitemap

Vite plugin that generates a `sitemap.xml` asset at build time.

## Usage

```js
import sitemapPlugin from '@grasdouble/slm_plugin_vite_sitemap';

// Static URLs
sitemapPlugin({
  urls: [
    { loc: 'https://example.com/', changefreq: 'monthly', priority: '1.0' },
    { loc: 'https://example.com/about', changefreq: 'yearly', priority: '0.5' },
  ],
});

// Dynamic URLs (computed at build time)
sitemapPlugin({
  urls: () => computeUrlsFromContent(),
});

// Empty sitemap (for parcels with no public routes)
sitemapPlugin({ urls: [] });
```

## Options

### `urls`

Type: `SitemapUrl[] | () => SitemapUrl[]`

Static array of URL entries or a factory function returning them. Each entry accepts:

| Field        | Type     | Default     | Description              |
| ------------ | -------- | ----------- | ------------------------ |
| `loc`        | `string` | required    | Absolute URL of the page |
| `lastmod`    | `string` | today       | ISO date (YYYY-MM-DD)    |
| `changefreq` | `string` | `'monthly'` | Change frequency         |
| `priority`   | `string` | `'0.5'`     | Priority from 0.0 to 1.0 |
