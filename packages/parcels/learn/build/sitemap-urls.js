import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';

const CONTENT_PATH = resolve(import.meta.dirname, '../src/data/content');
const BASE_ROUTE = '/learn';

/** Parses `id`, `publishedAt` and `updatedAt` fields from YAML frontmatter delimited by `---`. */
function parseFrontmatterFields(raw) {
  const parts = raw.split(/^---$/m);
  if (parts.length < 3) return null;
  const idMatch = /^id:\s*(\S+)/m.exec(parts[1]);
  if (!idMatch) return null;
  const publishedAtMatch = /^publishedAt:\s*(\S+)/m.exec(parts[1]);
  const updatedAtMatch = /^updatedAt:\s*(\S+)/m.exec(parts[1]);
  return {
    id: idMatch[1],
    publishedAt: publishedAtMatch ? publishedAtMatch[1] : null,
    updatedAt: updatedAtMatch ? updatedAtMatch[1] : null,
  };
}

/** Returns the ISO date (YYYY-MM-DD) of a file's last modification. */
function fileDate(filePath) {
  return statSync(filePath).mtime.toISOString().split('T')[0];
}

/** Builds the full list of sitemap paths from the learn content directory. */
export function buildLearnUrls() {
  const today = new Date().toISOString().split('T')[0];
  const urls = [{ loc: BASE_ROUTE, lastmod: today, changefreq: 'weekly', priority: '0.8' }];

  if (!existsSync(CONTENT_PATH)) return urls;

  for (const categoryDir of readdirSync(CONTENT_PATH)) {
    const categoryPath = resolve(CONTENT_PATH, categoryDir);
    if (!statSync(categoryPath).isDirectory()) continue;

    for (const catalogDir of readdirSync(categoryPath)) {
      const catalogPath = resolve(categoryPath, catalogDir);
      if (!statSync(catalogPath).isDirectory()) continue;

      const catalogFiles = readdirSync(catalogPath).map((f) => resolve(catalogPath, f));

      // Guard: skip empty catalog directories to avoid a 1970-01-01 lastmod from reduce's seed.
      if (catalogFiles.length === 0) continue;

      const catalogLastmod = catalogFiles
        .map((f) => statSync(f).mtime)
        .reduce((latest, mtime) => (mtime > latest ? mtime : latest), new Date(0))
        .toISOString()
        .split('T')[0];

      urls.push({
        loc: `${BASE_ROUTE}/${catalogDir}`,
        lastmod: catalogLastmod,
        changefreq: 'monthly',
        priority: '0.7',
      });

      for (const file of readdirSync(catalogPath)) {
        if (!file.endsWith('.en.md')) continue;
        const filePath = resolve(catalogPath, file);
        const fields = parseFrontmatterFields(readFileSync(filePath, 'utf8'));
        if (!fields) continue;

        urls.push({
          loc: `${BASE_ROUTE}/${catalogDir}/${fields.id}`,
          lastmod: fields.updatedAt ?? fields.publishedAt ?? fileDate(filePath),
          changefreq: 'monthly',
          priority: '0.6',
        });
      }
    }
  }

  return urls;
}

/**
 * Builds the manifest URL list for the learn parcel.
 * Each guide entry includes `publishedAt` from frontmatter so the sitemap proxy
 * can filter dynamically at request time (publishedAt <= today).
 * Catalog entries use the earliest guide publishedAt so they only appear when
 * at least one guide is published.
 */
export function buildLearnManifestUrls() {
  const today = new Date().toISOString().split('T')[0];
  const urls = [{ loc: BASE_ROUTE, lastmod: today, changefreq: 'weekly', priority: '0.8' }];

  if (!existsSync(CONTENT_PATH)) return urls;

  for (const categoryDir of readdirSync(CONTENT_PATH)) {
    const categoryPath = resolve(CONTENT_PATH, categoryDir);
    if (!statSync(categoryPath).isDirectory()) continue;

    for (const catalogDir of readdirSync(categoryPath)) {
      const catalogPath = resolve(categoryPath, catalogDir);
      if (!statSync(catalogPath).isDirectory()) continue;

      const allFiles = readdirSync(catalogPath);
      const enFiles = allFiles.filter((f) => f.endsWith('.en.md'));
      if (enFiles.length === 0) continue;

      const guideEntries = [];
      for (const file of enFiles) {
        const filePath = resolve(catalogPath, file);
        const fields = parseFrontmatterFields(readFileSync(filePath, 'utf8'));
        if (!fields) continue;

        guideEntries.push({
          loc: `${BASE_ROUTE}/${catalogDir}/${fields.id}`,
          lastmod: fields.updatedAt ?? fields.publishedAt ?? fileDate(filePath),
          changefreq: 'monthly',
          priority: '0.6',
          publishedAt: fields.publishedAt,
        });
      }

      if (guideEntries.length === 0) continue;

      // Catalog lastmod = most recent guide updatedAt (falls back to fileDate via guide entry)
      const catalogLastmod =
        guideEntries
          .map((e) => e.lastmod)
          .filter(Boolean)
          .sort()
          .at(-1) ?? new Date().toISOString().split('T')[0];

      // The catalog page appears when its earliest guide is published.
      // If any guide has no publishedAt (always visible), the catalog is also always visible.
      const hasAlwaysVisibleGuide = guideEntries.some((e) => !e.publishedAt);
      const earliestPublishedAt = hasAlwaysVisibleGuide
        ? null
        : (guideEntries.map((e) => e.publishedAt).sort()[0] ?? null);

      urls.push({
        loc: `${BASE_ROUTE}/${catalogDir}`,
        lastmod: catalogLastmod,
        changefreq: 'monthly',
        priority: '0.7',
        ...(earliestPublishedAt ? { publishedAt: earliestPublishedAt } : {}),
      });

      urls.push(...guideEntries);
    }
  }

  return urls;
}
