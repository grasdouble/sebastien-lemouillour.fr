/**
 * Single source of truth for all vendor bundles.
 *
 * - `name`       : vendor identifier and base filename (public/vendor/<name>-[hash].mjs)
 * - `entry`      : esbuild entry point
 * - `external`   : packages to leave as ESM imports (resolved via import map at runtime)
 * - `specifiers` : npm bare specifiers that should resolve to this vendor file in the import map
 */
export const VENDORS = [
  {
    name: 'react-bundle',
    entry: 'src/vendor/react-bundle.ts',
    // Bundle all React packages together — no externals, no circular deps.
    external: [],
    specifiers: ['react', 'react/jsx-runtime', 'react-dom', 'react-dom/client'],
  },
  {
    name: 'i18next',
    entry: 'src/vendor/i18next.ts',
    external: [],
    specifiers: ['i18next'],
  },
  {
    name: 'react-i18next',
    entry: 'src/vendor/react-i18next.ts',
    // 'react' prefix-matches react/* (jsx-runtime etc.) — all resolve to react-bundle.mjs.
    external: ['react', 'react-dom', 'i18next'],
    // Replace the CJS-only use-sync-external-store/shim with an ESM shim that uses
    // React 18+'s native useSyncExternalStore. Without this alias esbuild generates
    // a runtime __require("react") shim that fails in browser ESM.
    alias: {
      'use-sync-external-store/shim': 'src/vendor/use-sync-external-store-shim.ts',
    },
    specifiers: ['react-i18next'],
  },
  {
    name: 'i18next-browser-languagedetector',
    entry: 'src/vendor/i18next-browser-languagedetector.ts',
    external: ['i18next'],
    specifiers: ['i18next-browser-languagedetector'],
  },
  {
    name: 'tanstack-react-router',
    entry: 'src/vendor/tanstack-react-router.ts',
    external: ['react', 'react-dom'],
    // Same CJS shim issue as react-i18next — @tanstack/react-store uses
    // use-sync-external-store/shim/with-selector which also requires react at runtime.
    alias: {
      'use-sync-external-store/shim': 'src/vendor/use-sync-external-store-shim.ts',
      'use-sync-external-store/shim/with-selector': 'src/vendor/use-sync-external-store-shim-with-selector.ts',
    },
    specifiers: ['@tanstack/react-router'],
  },
  {
    name: 'clsx',
    entry: 'src/vendor/clsx.ts',
    external: [],
    specifiers: ['clsx'],
  },
  {
    name: 'mermaid',
    entry: 'src/vendor/mermaid.ts',
    external: [],
    specifiers: ['mermaid'],
  },
];
