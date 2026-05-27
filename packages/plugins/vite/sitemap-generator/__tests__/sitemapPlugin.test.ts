import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import sitemapPlugin from '../index.mjs';

type EmittedAsset = {
  type: string;
  fileName: string;
  source: string;
};

function renderSitemap(options?: Parameters<typeof sitemapPlugin>[0]): EmittedAsset {
  const emitFile = vi.fn();
  const plugin = sitemapPlugin(options);
  const generateBundle = plugin.generateBundle as (this: { emitFile: (asset: EmittedAsset) => void }) => void;

  generateBundle.call({ emitFile });

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

  it('emits a sitemap.xml file', () => {
    const asset = renderSitemap({ urls: [{ loc: '/' }] });

    expect(asset.type).toBe('asset');
    expect(asset.fileName).toBe('sitemap.xml');
    expect(asset.source).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
  });

  it('builds the expected xml structure for multiple url configurations', () => {
    const asset = renderSitemap({
      baseUrl: 'https://example.com',
      urls: [{ loc: '/' }, { loc: '/experience' }, { loc: 'https://cdn.example.com/feed.xml' }],
    });

    expect(asset.source).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(asset.source).toContain('<loc>https://example.com/</loc>');
    expect(asset.source).toContain('<loc>https://example.com/experience</loc>');
    expect(asset.source).toContain('<loc>https://cdn.example.com/feed.xml</loc>');
  });

  it('prefixes paths starting with a slash using the base url', () => {
    const asset = renderSitemap({
      baseUrl: 'https://example.com',
      urls: [{ loc: '/learn' }],
    });

    expect(asset.source).toContain('<loc>https://example.com/learn</loc>');
  });

  it('does not prefix paths that do not start with a slash', () => {
    const asset = renderSitemap({
      baseUrl: 'https://example.com',
      urls: [{ loc: 'learn' }],
    });

    expect(asset.source).toContain('<loc>learn</loc>');
    expect(asset.source).not.toContain('https://example.comlearn');
  });

  it('escapes xml special characters in loc values', () => {
    const asset = renderSitemap({
      baseUrl: 'https://example.com',
      urls: [{ loc: `/search?q=ai&lang=<fr>"'` }],
    });

    expect(asset.source).toContain('<loc>https://example.com/search?q=ai&amp;lang=&lt;fr&gt;&quot;&apos;</loc>');
  });

  it('supports a factory function for urls', () => {
    const urls = vi.fn(() => [{ loc: '/dynamic' }]);

    const asset = renderSitemap({ baseUrl: 'https://example.com', urls });

    expect(urls).toHaveBeenCalledOnce();
    expect(asset.source).toContain('<loc>https://example.com/dynamic</loc>');
  });

  it('produces a valid empty urlset when urls is empty', () => {
    const asset = renderSitemap({ urls: [] });

    expect(asset.source).toBe(
      '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n\n</urlset>\n'
    );
  });

  it('uses default values for lastmod, changefreq, and priority', () => {
    const asset = renderSitemap({
      baseUrl: 'https://example.com',
      urls: [{ loc: '/defaults' }],
    });

    expect(asset.source).toContain('<lastmod>2025-01-15</lastmod>');
    expect(asset.source).toContain('<changefreq>monthly</changefreq>');
    expect(asset.source).toContain('<priority>0.5</priority>');
  });

  it('uses custom lastmod, changefreq, and priority values', () => {
    const asset = renderSitemap({
      baseUrl: 'https://example.com',
      urls: [{ loc: '/custom', lastmod: '2024-06-01', changefreq: 'weekly', priority: '0.8' }],
    });

    expect(asset.source).toContain('<lastmod>2024-06-01</lastmod>');
    expect(asset.source).toContain('<changefreq>weekly</changefreq>');
    expect(asset.source).toContain('<priority>0.8</priority>');
  });
});
