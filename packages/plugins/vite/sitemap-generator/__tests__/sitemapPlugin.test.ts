import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import sitemapPlugin, { sitemapPublishedAtFilterPlugin } from '../index.mjs';

type EmittedAsset = {
  type: string;
  fileName: string;
  source: string;
};

async function renderSitemap(options?: Parameters<typeof sitemapPlugin>[0]): Promise<EmittedAsset> {
  const emitFile = vi.fn();
  const plugin = sitemapPlugin(options);
  const generateBundle = plugin.generateBundle as (this: {
    emitFile: (asset: EmittedAsset) => void;
  }) => Promise<void> | void;

  await generateBundle.call({ emitFile });

  expect(emitFile).toHaveBeenCalledOnce();
  return emitFile.mock.calls[0][0] as EmittedAsset;
}

async function renderManifest(options?: Parameters<typeof sitemapPublishedAtFilterPlugin>[0]): Promise<EmittedAsset> {
  const emitFile = vi.fn();
  const plugin = sitemapPublishedAtFilterPlugin(options);
  const generateBundle = plugin.generateBundle as (this: {
    emitFile: (asset: EmittedAsset) => void;
  }) => Promise<void> | void;

  await generateBundle.call({ emitFile });

  expect(emitFile).toHaveBeenCalledOnce();
  return emitFile.mock.calls[0][0] as EmittedAsset;
}

describe('sitemapPlugin', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-01-15T12:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('emits a sitemap.xml file', async () => {
    const asset = await renderSitemap({ urls: [{ loc: '/' }] });

    expect(asset.type).toBe('asset');
    expect(asset.fileName).toBe('sitemap.xml');
    expect(asset.source).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
  });

  it('builds the expected xml structure for multiple url configurations', async () => {
    const asset = await renderSitemap({
      baseUrl: 'https://example.com',
      urls: [{ loc: '/' }, { loc: '/experience' }, { loc: 'https://cdn.example.com/feed.xml' }],
    });

    expect(asset.source).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(asset.source).toContain('<loc>https://example.com/</loc>');
    expect(asset.source).toContain('<loc>https://example.com/experience</loc>');
    expect(asset.source).toContain('<loc>https://cdn.example.com/feed.xml</loc>');
  });

  it('prefixes paths starting with a slash using the base url', async () => {
    const asset = await renderSitemap({
      baseUrl: 'https://example.com',
      urls: [{ loc: '/learn' }],
    });

    expect(asset.source).toContain('<loc>https://example.com/learn</loc>');
  });

  it('does not prefix paths that do not start with a slash', async () => {
    const asset = await renderSitemap({
      baseUrl: 'https://example.com',
      urls: [{ loc: 'learn' }],
    });

    expect(asset.source).toContain('<loc>learn</loc>');
    expect(asset.source).not.toContain('https://example.comlearn');
  });

  it('escapes xml special characters in loc values', async () => {
    const asset = await renderSitemap({
      baseUrl: 'https://example.com',
      urls: [{ loc: `/search?q=ai&lang=<fr>"'` }],
    });

    expect(asset.source).toContain('<loc>https://example.com/search?q=ai&amp;lang=&lt;fr&gt;&quot;&apos;</loc>');
  });

  it('supports a synchronous factory function for urls', async () => {
    const urls = vi.fn(() => [{ loc: '/dynamic' }]);

    const asset = await renderSitemap({ baseUrl: 'https://example.com', urls });

    expect(urls).toHaveBeenCalledOnce();
    expect(asset.source).toContain('<loc>https://example.com/dynamic</loc>');
  });

  it('supports an async factory function for urls', async () => {
    const urls = vi.fn(() => Promise.resolve([{ loc: '/async' }]));

    const asset = await renderSitemap({ baseUrl: 'https://example.com', urls });

    expect(urls).toHaveBeenCalledOnce();
    expect(asset.source).toContain('<loc>https://example.com/async</loc>');
  });

  it('produces a valid empty urlset when urls is empty', async () => {
    const asset = await renderSitemap({ urls: [] });

    expect(asset.source).toBe(
      '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n\n</urlset>\n'
    );
  });

  it('uses default values for lastmod, changefreq, and priority', async () => {
    const asset = await renderSitemap({
      baseUrl: 'https://example.com',
      urls: [{ loc: '/defaults' }],
    });

    expect(asset.source).toContain('<lastmod>2025-01-15</lastmod>');
    expect(asset.source).toContain('<changefreq>monthly</changefreq>');
    expect(asset.source).toContain('<priority>0.5</priority>');
  });

  it('uses custom lastmod, changefreq, and priority values', async () => {
    const asset = await renderSitemap({
      baseUrl: 'https://example.com',
      urls: [{ loc: '/custom', lastmod: '2024-06-01', changefreq: 'weekly', priority: '0.8' }],
    });

    expect(asset.source).toContain('<lastmod>2024-06-01</lastmod>');
    expect(asset.source).toContain('<changefreq>weekly</changefreq>');
    expect(asset.source).toContain('<priority>0.8</priority>');
  });
});

describe('sitemapPublishedAtFilterPlugin', () => {
  it('emits a sitemap-publishedAt-filter.json file', async () => {
    const asset = await renderManifest({ urls: [{ loc: '/' }] });

    expect(asset.type).toBe('asset');
    expect(asset.fileName).toBe('sitemap-publishedAt-filter.json');
  });

  it('emits valid JSON', async () => {
    const asset = await renderManifest({ urls: [{ loc: '/learn' }] });

    expect(() => {
      JSON.parse(asset.source);
    }).not.toThrow();
  });

  it('includes baseUrl and urls array in the manifest', async () => {
    const asset = await renderManifest({
      baseUrl: 'https://example.com',
      urls: [{ loc: '/learn', lastmod: '2025-01-15', changefreq: 'weekly', priority: '0.8' }],
    });

    const manifest = JSON.parse(asset.source) as {
      baseUrl: string;
      urls: { loc: string; lastmod: string; changefreq: string; priority: string }[];
    };
    expect(manifest.baseUrl).toBe('https://example.com');
    expect(manifest.urls).toHaveLength(1);
    expect(manifest.urls[0].loc).toBe('/learn');
    expect(manifest.urls[0].lastmod).toBe('2025-01-15');
  });

  it('includes optional publishedAt field when present', async () => {
    const asset = await renderManifest({
      baseUrl: 'https://example.com',
      urls: [{ loc: '/learn/guide', publishedAt: '2025-03-01' }],
    });

    const manifest = JSON.parse(asset.source) as {
      urls: { loc: string; publishedAt?: string }[];
    };
    expect(manifest.urls[0].publishedAt).toBe('2025-03-01');
  });

  it('does not filter urls by publishedAt — all urls are included regardless of date', async () => {
    const asset = await renderManifest({
      baseUrl: 'https://example.com',
      urls: [
        { loc: '/learn/past-guide', publishedAt: '2020-01-01' },
        { loc: '/learn/future-guide', publishedAt: '2099-12-31' },
        { loc: '/learn' },
      ],
    });

    const manifest = JSON.parse(asset.source) as { urls: { loc: string }[] };
    expect(manifest.urls).toHaveLength(3);
  });

  it('supports a synchronous factory function for urls', async () => {
    const urls = vi.fn(() => [{ loc: '/dynamic', publishedAt: '2025-01-01' }]);

    const asset = await renderManifest({ baseUrl: 'https://example.com', urls });

    expect(urls).toHaveBeenCalledOnce();
    const manifest = JSON.parse(asset.source) as { urls: { loc: string }[] };
    expect(manifest.urls[0].loc).toBe('/dynamic');
  });

  it('supports an async factory function for urls', async () => {
    const urls = vi.fn(() => Promise.resolve([{ loc: '/async-guide', publishedAt: '2025-01-01' }]));

    const asset = await renderManifest({ baseUrl: 'https://example.com', urls });

    expect(urls).toHaveBeenCalledOnce();
    const manifest = JSON.parse(asset.source) as { urls: { loc: string }[] };
    expect(manifest.urls[0].loc).toBe('/async-guide');
  });

  it('produces an empty urls array when urls is empty', async () => {
    const asset = await renderManifest({ urls: [] });

    const manifest = JSON.parse(asset.source) as { urls: unknown[] };
    expect(manifest.urls).toHaveLength(0);
  });
});
