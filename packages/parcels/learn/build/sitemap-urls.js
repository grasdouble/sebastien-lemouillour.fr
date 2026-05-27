import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';

const CONTENT_PATH = resolve(import.meta.dirname, '../src/data/content');
const BASE_ROUTE = '/learn';

/** Parses the `id:` field from YAML frontmatter delimited by `---`. */
function parseGuideId(raw) {
  const parts = raw.split(/^---$/m);
  if (parts.length < 3) return null;
  const match = /^id:\s*(\S+)/m.exec(parts[1]);
  return match ? match[1] : null;
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
        const guideId = parseGuideId(readFileSync(filePath, 'utf8'));
        if (!guideId) continue;

        urls.push({
          loc: `${BASE_ROUTE}/${catalogDir}/${guideId}`,
          lastmod: fileDate(filePath),
          changefreq: 'monthly',
          priority: '0.6',
        });
      }
    }
  }

  return urls;
}
