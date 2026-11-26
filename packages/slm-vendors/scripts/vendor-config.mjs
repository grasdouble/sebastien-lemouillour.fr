/**
 * Single source of truth for vendor build configuration.
 *
 * - `name`    : vendor identifier; output file is dist/<name>.mjs
 * - `entry`   : esbuild entry point (relative to package root)
 * - `external`: packages to leave as ESM imports (resolved via import map at runtime)
 * - `alias`   : esbuild alias overrides (relative to package root)
 *
 * Import map specifiers are maintained in packages/slm-container/src/importMap*.json.
 */
export const VENDORS = [
  {
    name: 'react-bundle',
    entry: 'src/react-bundle.ts',
    // Bundle all React packages together — no externals, no circular deps.
    external: [],
  },
  {
    name: 'i18next',
    entry: 'src/i18next.ts',
    external: [],
  },
  {
    name: 'react-i18next',
    entry: 'src/react-i18next.ts',
    // 'react' prefix-matches react/* (jsx-runtime etc.) — all resolve to react-bundle.mjs.
    external: ['react', 'react-dom', 'i18next'],
    // Replace the CJS-only use-sync-external-store/shim with an ESM shim that uses
    // React 18+'s native useSyncExternalStore. Without this alias esbuild generates
    // a runtime __require("react") shim that fails in browser ESM.
    alias: {
      'use-sync-external-store/shim': 'src/use-sync-external-store-shim.ts',
    },
  },
  {
    name: 'i18next-browser-languagedetector',
    entry: 'src/i18next-browser-languagedetector.ts',
    external: ['i18next'],
  },
  {
    name: 'clsx',
    entry: 'src/clsx.ts',
    external: [],
  },
  {
    name: 'react-markdown',
    entry: 'src/react-markdown.ts',
    external: ['react', 'react-dom'],
  },
  {
    name: 'remark-gfm',
    entry: 'src/remark-gfm.ts',
    external: [],
  },
  {
    name: 'rehype-highlight',
    entry: 'src/rehype-highlight.ts',
    external: [],
  },
  {
    name: 'highlight',
    entry: 'src/highlight.ts',
    external: [],
  },
  {
    name: 'rehype-sanitize',
    entry: 'src/rehype-sanitize.ts',
    external: [],
  },
];
