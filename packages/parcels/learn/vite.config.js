import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';
import { externalizeDeps } from 'vite-plugin-externalize-deps';

import { sitemapPublishedAtFilterPlugin } from '@grasdouble/slm_plugin_vite_sitemap-generator';

import { buildLearnManifestUrls } from './build/sitemap-urls.js';

export default defineConfig({
  plugins: [
    react(),
    cssInjectedByJsPlugin(),
    sitemapPublishedAtFilterPlugin({ urls: buildLearnManifestUrls }),
    externalizeDeps({
      deps: false,
      devDeps: false,
      optionalDeps: false,
      peerDeps: true,
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
