/**
 * Builds each shared dependency as a standalone ES module in dist/.
 *
 * Uses esbuild directly so that CJS packages (React family) are correctly
 * converted to ESM with proper named exports. All four React specifiers
 * (react, react/jsx-runtime, react-dom, react-dom/client) are bundled into a
 * single file to avoid circular imports and guarantee one shared React instance.
 *
 * ESM packages (i18next, react-i18next, etc.) use esbuild's prefix-matching
 * externals so that react/* is externalized and resolved via the import map.
 *
 * Output filenames are stable (no hash) — cache busting is handled by the
 * package version in the CDN URL.
 */

import { cpSync, mkdirSync, rmSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { build } from 'esbuild';

import { VENDORS } from './vendor-config.mjs';

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const define = { 'process.env.NODE_ENV': '"production"' };

// Clean output dir to remove stale files from previous builds
rmSync(resolve(packageRoot, 'dist'), { recursive: true, force: true });
mkdirSync(resolve(packageRoot, 'dist'), { recursive: true });

for (const vendor of VENDORS) {
  console.log(`Building vendor: ${vendor.name}…`);
  const alias = Object.fromEntries(Object.entries(vendor.alias ?? {}).map(([k, v]) => [k, resolve(packageRoot, v)]));
  await build({
    entryPoints: [resolve(packageRoot, vendor.entry)],
    outfile: resolve(packageRoot, `dist/${vendor.name}.mjs`),
    bundle: true,
    format: 'esm',
    platform: 'browser',
    external: vendor.external,
    alias,
    define,
    logLevel: 'warning',
    minify: true,
    minifySyntax: true,
  });
}

// Copy highlight.js CSS themes to dist/styles/ (always synced with installed version)
console.log('Copying highlight.js styles…');
cpSync(resolve(packageRoot, 'node_modules/highlight.js/styles'), resolve(packageRoot, 'dist/styles'), {
  recursive: true,
});

console.log('✓ All vendor bundles built in dist/');
