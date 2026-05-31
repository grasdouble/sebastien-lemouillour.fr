import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';
import { externalizeDeps } from 'vite-plugin-externalize-deps';

import sitemapPlugin from '@grasdouble/slm_plugin_vite_sitemap-generator';

export default defineConfig({
  plugins: [
    react(),
    cssInjectedByJsPlugin(),
    sitemapPlugin({ urls: [{ loc: '/', changefreq: 'monthly', priority: '1.0' }] }),
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
      fileName: () => 'home.mjs',
      preserveEntrySignatures: 'strict',
    },
    sourcemap: true,
  },
  server: {
    port: 4101,
    hmr: true,
  },
  preview: {
    port: 4101,
  },
});
