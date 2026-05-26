import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';
import { externalizeDeps } from 'vite-plugin-externalize-deps';

const CONTENT_PATH = resolve(import.meta.dirname, 'src/data/content');
const BASE_URL = 'https://sebastien-lemouillour.fr';
const BASE_ROUTE = '/learn';

/** Parses the `id:` field from YAML frontmatter delimited by `---`. */
function parseGuideId(raw) {
  const parts = raw.split(/^---$/m);
  if (parts.length < 3) return null;
  const match = /^id:\s*(\S+)/m.exec(parts[1]);
  return match ? match[1] : null;
}

/** Returns the ISO date (YYYY-MM-DD) of a file's last modification. */
function fileDate(filePath) {
  return statSync(filePath).mtime.toISOString().split('T')[0];
}

function buildSitemapXml(urls) {
  const toEntry = ({ loc, lastmod, changefreq, priority }) =>
    `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(toEntry).join('\n')}\n</urlset>\n`;
}

/**
 * Generates dist/sitemap.xml with all learn routes (page, catalogs, guides).
 * This file is deployed to the CDN and proxied by Apache at /learn?sitemap
 * so the container never needs rebuilding when content changes.
 */
const sitemapPlugin = () => ({
  name: 'slm-sitemap',
  generateBundle() {
    const today = new Date().toISOString().split('T')[0];
    const urls = [{ loc: `${BASE_URL}${BASE_ROUTE}`, lastmod: today, changefreq: 'weekly', priority: '0.8' }];

    if (!existsSync(CONTENT_PATH)) {
      this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: buildSitemapXml(urls) });
      return;
    }

    for (const categoryDir of readdirSync(CONTENT_PATH)) {
      const categoryPath = resolve(CONTENT_PATH, categoryDir);
      if (!statSync(categoryPath).isDirectory()) continue;

      for (const catalogDir of readdirSync(categoryPath)) {
        const catalogPath = resolve(categoryPath, catalogDir);
        if (!statSync(catalogPath).isDirectory()) continue;

        const catalogFiles = readdirSync(catalogPath).map((f) => resolve(catalogPath, f));
        const catalogLastmod = catalogFiles
          .map((f) => statSync(f).mtime)
          .reduce((latest, mtime) => (mtime > latest ? mtime : latest), new Date(0))
          .toISOString()
          .split('T')[0];

        urls.push({
          loc: `${BASE_URL}${BASE_ROUTE}?catalog=${catalogDir}`,
          lastmod: catalogLastmod,
          changefreq: 'monthly',
          priority: '0.7',
        });

        for (const file of readdirSync(catalogPath)) {
          if (!file.endsWith('.en.md')) continue;
          const filePath = resolve(catalogPath, file);
          const guideId = parseGuideId(readFileSync(filePath, 'utf8'));
          if (!guideId) continue;

          urls.push({
            loc: `${BASE_URL}${BASE_ROUTE}?catalog=${catalogDir}&amp;guide=${guideId}`,
            lastmod: fileDate(filePath),
            changefreq: 'monthly',
            priority: '0.6',
          });
        }
      }
    }

    this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: buildSitemapXml(urls) });
  },
});

export default defineConfig({
  plugins: [
    react(),
    cssInjectedByJsPlugin(),
    sitemapPlugin(),
    externalizeDeps({
      deps: true,
      devDeps: false,
      optionalDeps: false,
      peerDeps: false,
      except: ['react-markdown', 'remark-gfm', '@grasdouble/slm_shared'],
      nodeBuiltins: true,
    }),
  ],
  define: {
    'process.env.NODE_ENV': JSON.stringify('dev'),
    'process.env': {},
  },
  build: {
    minify: false,
    assetsDir: 'assets',
    lib: {
      assetsDir: 'assets',
      formats: ['es'],
      entry: {
        index: 'src/parcel.tsx',
      },
      fileName: () => 'learn.mjs',
      preserveEntrySignatures: 'strict',
    },
    sourcemap: true,
  },
  server: {
    port: 4103,
    hmr: true,
  },
  preview: {
    port: 4103,
  },
});
