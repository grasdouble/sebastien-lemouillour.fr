import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import { externalizeDeps } from 'vite-plugin-externalize-deps';

import importMapInjectorPlugin from '@grasdouble/slm_plugin_vite_import-map-injector';
import reactPreamblePlugin from '@grasdouble/slm_plugin_vite_react-preamble';

const dsPkgPath = resolve(import.meta.dirname, 'node_modules/@grasdouble/lufa_design-system/package.json');
const dsVersion = JSON.parse(readFileSync(dsPkgPath, 'utf8')).version;

const BASE_URL = 'https://sebastien-lemouillour.fr';

/**
 * Parcel routes that expose their own sitemap via /<route>?sitemap.
 * Each parcel publishes sitemap.xml in its npm package exports.
 * A PHP script reads importMap.json at runtime to resolve the versioned CDN URL
 * and proxies the response — so the container never needs rebuilding when a parcel
 * is updated.
 */
const PARCEL_ROUTES = ['learn'];

function buildSitemapXml(urls) {
  const toEntry = ({ loc, lastmod, changefreq, priority }) =>
    `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(toEntry).join('\n')}\n</urlset>\n`;
}

function buildSitemapIndex(entries) {
  const toEntry = ({ loc, lastmod }) =>
    `  <sitemap>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </sitemap>`;
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.map(toEntry).join('\n')}\n</sitemapindex>\n`;
}

/**
 * Emits dist/sitemap-core.xml (static routes), dist/sitemap.xml (index),
 * and dist/importMap.json so the PHP proxy can read it at runtime.
 * Parcel sitemaps are served at runtime via PHP proxy — no parcel dist reading needed.
 */
const sitemapGeneratorPlugin = () => ({
  name: 'slm-sitemap-generator',
  generateBundle() {
    const today = new Date().toISOString().split('T')[0];

    const coreUrls = [
      { loc: `${BASE_URL}/`, lastmod: today, changefreq: 'monthly', priority: '1.0' },
      { loc: `${BASE_URL}/experience`, lastmod: today, changefreq: 'monthly', priority: '0.8' },
    ];
    this.emitFile({ type: 'asset', fileName: 'sitemap-core.xml', source: buildSitemapXml(coreUrls) });

    const indexEntries = [
      { loc: `${BASE_URL}/sitemap-core.xml`, lastmod: today },
      ...PARCEL_ROUTES.map((route) => ({ loc: `${BASE_URL}/${route}/sitemap.xml`, lastmod: today })),
    ];
    this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: buildSitemapIndex(indexEntries) });

    // Emit importMap.json so the PHP sitemap proxy can resolve the CDN URL at runtime.
    const importMap = readFileSync(resolve(import.meta.dirname, 'src/importMap.json'), 'utf8');
    this.emitFile({ type: 'asset', fileName: 'importMap.json', source: importMap });
  },
});

/** Injects %LUFA_DS_VERSION% in index.html so the CDN stylesheet URL always
 *  matches the version installed by pnpm — no manual sync needed. */
const dsVersionPlugin = () => ({
  name: 'lufa-ds-version',
  transformIndexHtml: (html) => html.replaceAll('%LUFA_DS_VERSION%', dsVersion),
});

export default defineConfig({
  plugins: [
    dsVersionPlugin(),
    sitemapGeneratorPlugin(),
    importMapInjectorPlugin({
      extImportMap: 'src/importMapExternal.json',
      devImportMap: 'src/importMap.dev.json',
      previewImportMap: 'src/importMap.preview.json',
      prodImportMap: 'src/importMap.json',
    }),
    externalizeDeps({
      deps: false,
      devDeps: false,
      optionalDeps: false,
      peerDeps: true,
      except: [],
      nodeBuiltins: true,
    }),
    reactPreamblePlugin(),
  ],
  build: {
    target: 'esnext',
    modulePreload: false, // Single-SPA manages the loading of modules
    minify: false,
    rolldownOptions: {
      output: {
        format: 'esm',
        entryFileNames: '[name].[hash].js',
      },
    },
  },
  server: {
    port: 5173,
    cors: true,
    hmr: true,
  },
  preview: {
    port: 5173,
  },
});
