/**
 * @typedef {Object} SitemapUrl
 * @property {string} loc - URL or path of the page. Paths starting with `/` are prefixed with `baseUrl`.
 * @property {string} [lastmod] - ISO date (YYYY-MM-DD). Defaults to today.
 * @property {string} [changefreq] - Change frequency. Defaults to 'monthly'.
 * @property {string} [priority] - Priority (0.0–1.0). Defaults to '0.5'.
 */

/**
 * @typedef {Object} SitemapPluginOptions
 * @property {string} [baseUrl] - Base URL prepended to any `loc` starting with `/`.
 * @property {SitemapUrl[] | (() => SitemapUrl[])} urls
 *   Static array of URL entries, or a factory function returning them.
 *   Pass an empty array to emit an empty urlset (e.g. for utility parcels).
 */

function buildSitemapXml(entries, baseUrl) {
  const today = new Date().toISOString().split('T')[0];

  const toEntry = ({ loc, lastmod, changefreq, priority }) => {
    const resolvedLoc = baseUrl && loc.startsWith('/') ? `${baseUrl}${loc}` : loc;
    const safeLastmod = lastmod ?? today;
    const safeChangefreq = changefreq ?? 'monthly';
    const safePriority = priority ?? '0.5';
    return `  <url>\n    <loc>${resolvedLoc}</loc>\n    <lastmod>${safeLastmod}</lastmod>\n    <changefreq>${safeChangefreq}</changefreq>\n    <priority>${safePriority}</priority>\n  </url>`;
  };

  const urlEntries = entries.map(toEntry).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlEntries}\n</urlset>\n`;
}

/**
 * Vite plugin that generates `dist/sitemap.xml` at build time.
 *
 * @param {SitemapPluginOptions} options
 * @returns {import('vite').Plugin}
 *
 * @example
 * // Static paths with baseUrl
 * sitemapPlugin({ baseUrl: 'https://example.com', urls: [{ loc: '/', changefreq: 'monthly', priority: '1.0' }] })
 *
 * @example
 * // Dynamic URLs (computed at build time)
 * sitemapPlugin({ baseUrl: 'https://example.com', urls: () => computeUrlsFromContent() })
 *
 * @example
 * // Empty sitemap (for parcels with no public routes)
 * sitemapPlugin({ urls: [] })
 */
export default function sitemapPlugin({ baseUrl = 'https://sebastien-lemouillour.fr', urls = [] } = {}) {
  return {
    name: 'slm-sitemap',
    generateBundle() {
      const resolvedUrls = typeof urls === 'function' ? urls() : urls;
      this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: buildSitemapXml(resolvedUrls, baseUrl) });
    },
  };
}
