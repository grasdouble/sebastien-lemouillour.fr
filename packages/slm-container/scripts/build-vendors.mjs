/**
 * Builds each shared dependency as a standalone ES module in dist/vendor/.
 *
 * Uses esbuild directly so that CJS packages (React family) are correctly
 * converted to ESM with proper named exports. All four React specifiers
 * (react, react/jsx-runtime, react-dom, react-dom/client) are bundled into a
 * single file to avoid circular imports and guarantee one shared React instance.
 *
 * ESM packages (i18next, react-i18next, etc.) use esbuild's prefix-matching
 * externals so that react/* is externalized and resolved via the import map.
 *
 * Vendor config (VENDORS) is the single source of truth — this script derives
 * both the build inputs and the prod import map from it.
 */

import { mkdirSync, rmSync, writeFileSync } from 'fs';
import { basename, resolve } from 'path';
import { build } from 'esbuild';

import { VENDORS } from './vendor-config.mjs';

const define = { 'process.env.NODE_ENV': '"production"' };
const cwd = process.cwd();

// Clean output dir to remove stale hashed files from previous builds
rmSync('public/vendor', { recursive: true, force: true });
mkdirSync('public/vendor', { recursive: true });

/** Maps vendor name → hashed filename, e.g. { 'react-bundle': 'react-bundle-ABC123.mjs' } */
const manifest = {};

for (const vendor of VENDORS) {
  console.log(`Building vendor: ${vendor.name}…`);
  const alias = Object.fromEntries(Object.entries(vendor.alias ?? {}).map(([k, v]) => [k, resolve(cwd, v)]));
  const result = await build({
    entryPoints: { [vendor.name]: vendor.entry },
    outdir: 'public/vendor',
    entryNames: '[name]-[hash]',
    outExtension: { '.js': '.mjs' },
    metafile: true,
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

  const outputPath = Object.keys(result.metafile.outputs)[0];
  manifest[vendor.name] = basename(outputPath);
}

writeFileSync('public/vendor/vendor-manifest.json', JSON.stringify(manifest, null, 2) + '\n');

console.log('✓ All vendor bundles built in public/vendor/');
