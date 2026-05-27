/**
 * sync-import-maps.mjs
 *
 * Reads all import map JSON files in src/, parses the CDN URLs to extract
 * the package name and version, then compares against the installed version
 * in node_modules and updates mismatches.
 *
 * No configuration needed — adding a new lib to an import map is enough.
 *
 * Usage:
 *   node scripts/sync-import-maps.mjs          # dry-run (preview changes)
 *   node scripts/sync-import-maps.mjs --write  # apply changes to disk
 *
 * Run after a dependency upgrade:
 *   pnpm sync:importmaps
 */

import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const PKG_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const WORKSPACE_ROOT = resolve(PKG_ROOT, '../..');
const WRITE = process.argv.includes('--write');

// --- Version resolution ---

/**
 * Candidate node_modules locations, in resolution order.
 * Covers local package, workspace root, siblings (depth 1), and nested packages
 * (depth 2, e.g. packages/parcels/learn/node_modules in pnpm workspaces).
 */
const collectNodeModulesRoots = (dir, depth = 0, acc = []) => {
  if (depth > 2) return acc;
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return acc;
  }
  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
    acc.push(resolve(dir, entry.name, 'node_modules'));
    collectNodeModulesRoots(resolve(dir, entry.name), depth + 1, acc);
  }
  return acc;
};

const NODE_MODULES_ROOTS = [
  resolve(PKG_ROOT, 'node_modules'),
  resolve(WORKSPACE_ROOT, 'node_modules'),
  ...collectNodeModulesRoots(resolve(PKG_ROOT, '..')),
];

const versionCache = new Map();

/**
 * Builds a map of { packageName → version } for all workspace packages by
 * scanning package.json files under WORKSPACE_ROOT/packages (depth ≤ 3).
 * This covers workspace-only packages that are not installed in node_modules
 * (e.g. parcels loaded dynamically via import map at runtime).
 */
const buildWorkspaceVersionMap = () => {
  const map = new Map();

  const scanDir = (dir, depth = 0) => {
    if (depth > 3) return;
    let entries;
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      if (!entry.isDirectory() || entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
      try {
        const pkg = JSON.parse(readFileSync(resolve(dir, entry.name, 'package.json'), 'utf8'));
        if (pkg.name && pkg.version) map.set(pkg.name, pkg.version);
      } catch {
        // no package.json — continue
      }
      scanDir(resolve(dir, entry.name), depth + 1);
    }
  };

  scanDir(resolve(WORKSPACE_ROOT, 'packages'));
  return map;
};

const workspaceVersionMap = buildWorkspaceVersionMap();

const resolveInstalledVersion = (pkgName) => {
  if (versionCache.has(pkgName)) return versionCache.get(pkgName);

  for (const root of NODE_MODULES_ROOTS) {
    try {
      const version = JSON.parse(readFileSync(resolve(root, pkgName, 'package.json'), 'utf8')).version;
      versionCache.set(pkgName, version);
      return version;
    } catch {
      // not in this location — try next
    }
  }

  // Fallback: workspace packages not installed in node_modules (e.g. parcels)
  const workspaceVersion = workspaceVersionMap.get(pkgName);
  if (workspaceVersion) {
    versionCache.set(pkgName, workspaceVersion);
    return workspaceVersion;
  }

  return null; // package not found locally (e.g. external CDN-only dep)
};

// --- URL parsing ---

/**
 * Parses a CDN URL of the form:
 *   https://cdn.example.com/(@scope/pkg|pkg)@VERSION[/path][?query]
 *
 * Returns { pkgName, currentVersion, urlPrefix, urlSuffix } or null if the
 * URL does not match the expected pattern (e.g. relative paths).
 * urlSuffix preserves both the path segment and the query string so that
 * parameters like `?external=react,react-dom` are not lost on version bumps.
 */
const parseCdnUrl = (url) => {
  // Split query string before matching so it is never captured as part of the version.
  const queryIndex = url.indexOf('?');
  const querySuffix = queryIndex !== -1 ? url.slice(queryIndex) : '';
  const urlWithoutQuery = queryIndex !== -1 ? url.slice(0, queryIndex) : url;

  const match = urlWithoutQuery.match(/^(https?:\/\/[^/]+\/)(.+?)@([0-9][^/]*)(\/.*)?$/);
  if (!match) return null;

  const [, base, pkgName, currentVersion, pathSuffix = ''] = match;
  return { pkgName, currentVersion, urlPrefix: `${base}${pkgName}@`, urlSuffix: `${pathSuffix}${querySuffix}` };
};

// --- Sync logic ---

const IMPORT_MAPS_DIR = resolve(PKG_ROOT, 'src');
const importMapFiles = readdirSync(IMPORT_MAPS_DIR).filter((f) => f.startsWith('importMap') && f.endsWith('.json'));

let hasChanges = false;

for (const fileName of importMapFiles) {
  const absPath = resolve(IMPORT_MAPS_DIR, fileName);
  const importMap = JSON.parse(readFileSync(absPath, 'utf8'));
  let fileChanged = false;

  for (const [key, url] of Object.entries(importMap.imports ?? {})) {
    const parsed = parseCdnUrl(url);
    if (!parsed) continue;

    const { pkgName, currentVersion, urlPrefix, urlSuffix } = parsed;
    const installedVersion = resolveInstalledVersion(pkgName);

    if (!installedVersion || installedVersion === currentVersion) continue;

    importMap.imports[key] = `${urlPrefix}${installedVersion}${urlSuffix}`;
    fileChanged = true;
    hasChanges = true;
    console.log(`  src/${fileName}`);
    console.log(`    ${key} (${pkgName}): ${currentVersion} → ${installedVersion}`);
  }

  if (fileChanged && WRITE) {
    writeFileSync(absPath, JSON.stringify(importMap, null, 2) + '\n', 'utf8');
  }
}

if (!hasChanges) {
  console.log('✅ All import maps are already up to date.');
} else if (WRITE) {
  console.log('\n✅ Import maps updated.');
} else {
  console.log('\n⚠️  Run with --write to apply changes.');
}
