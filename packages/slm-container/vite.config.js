import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import { externalizeDeps } from 'vite-plugin-externalize-deps';

import importMapInjectorPlugin from '@grasdouble/slm_plugin_vite_import-map-injector';
import reactPreamblePlugin from '@grasdouble/slm_plugin_vite_react-preamble';

const dsPkgPath = resolve(import.meta.dirname, 'node_modules/@grasdouble/lufa_design-system/package.json');
const dsVersion = JSON.parse(readFileSync(dsPkgPath, 'utf8')).version;

/** Injects %LUFA_DS_VERSION% in index.html so the CDN stylesheet URL always
 *  matches the version installed by pnpm — no manual sync needed. */
const dsVersionPlugin = () => ({
  name: 'lufa-ds-version',
  transformIndexHtml: (html) => html.replaceAll('%LUFA_DS_VERSION%', dsVersion),
});

export default defineConfig({
  plugins: [
    dsVersionPlugin(),
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
