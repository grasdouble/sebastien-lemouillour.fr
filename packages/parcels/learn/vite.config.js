import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';
import { externalizeDeps } from 'vite-plugin-externalize-deps';

import sitemapPlugin from '@grasdouble/slm_plugin_vite_sitemap-generator';

const CONTENT_PATH = resolve(import.meta.dirname, 'src/data/content');
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

/** Builds the full list of sitemap paths from the learn content directory. */
function buildLearnUrls() {
  const today = new Date().toISOString().split('T')[0];
  const urls = [{ loc: BASE_ROUTE, lastmod: today, changefreq: 'weekly', priority: '0.8' }];

  if (!existsSync(CONTENT_PATH)) return urls;

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
        loc: `${BASE_ROUTE}?catalog=${catalogDir}`,
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
          loc: `${BASE_ROUTE}?catalog=${catalogDir}&amp;guide=${guideId}`,
          lastmod: fileDate(filePath),
          changefreq: 'monthly',
          priority: '0.6',
        });
      }
    }
  }

  return urls;
}

export default defineConfig({
  plugins: [
    react(),
    cssInjectedByJsPlugin(),
    sitemapPlugin({ urls: buildLearnUrls }),
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
