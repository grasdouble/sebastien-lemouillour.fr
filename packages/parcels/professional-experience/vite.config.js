import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';
import { externalizeDeps } from 'vite-plugin-externalize-deps';

import sitemapPlugin from '@grasdouble/slm_plugin_vite_sitemap-generator';

export default defineConfig({
  plugins: [
    react(),
    cssInjectedByJsPlugin(),
    sitemapPlugin({ urls: [{ loc: '/experience', changefreq: 'monthly', priority: '0.8' }] }),
    externalizeDeps({
      deps: true,
      devDeps: false,
      optionalDeps: false,
      peerDeps: false,
      except: ['@grasdouble/slm_shared'],
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
      fileName: () => 'professional-experience.mjs',
      preserveEntrySignatures: 'strict',
    },
    sourcemap: true,
  },
  server: {
    port: 4102,
    hmr: true,
  },
  preview: {
    port: 4102,
  },
});
