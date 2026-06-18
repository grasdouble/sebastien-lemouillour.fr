import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { buildLearnManifestUrls } from '../sitemap-urls.js';

vi.mock('node:fs', () => {
  const existsSync = vi.fn();
  const readdirSync = vi.fn();
  const readFileSync = vi.fn();
  const statSync = vi.fn();
  const mod = { existsSync, readdirSync, readFileSync, statSync };
  return { ...mod, default: mod };
});

// ------- helpers -------

const makeDir = (mtime = new Date('2024-03-01T00:00:00Z')) => ({ isDirectory: () => true, mtime });
const makeFile = (mtime = new Date('2024-03-01T00:00:00Z')) => ({ isDirectory: () => false, mtime });

/**
 * Builds a minimal YAML frontmatter string.
 * Pass publishedAt as null to omit the field entirely.
 */
const fm = (id, publishedAt) =>
  `---\nid: ${id}\n${publishedAt !== null ? `publishedAt: ${publishedAt}\n` : ''}title: Test Guide\n---\nContent`;

// ------- setup -------

beforeEach(() => {
  vi.resetAllMocks();
});

// ------- tests -------

describe('buildLearnManifestUrls', () => {
  it('returns only the base /learn URL when content path does not exist', () => {
    existsSync.mockReturnValue(false);

    const urls = buildLearnManifestUrls();

    expect(urls).toHaveLength(1);
    expect(urls[0]).toMatchObject({ loc: '/learn', changefreq: 'weekly', priority: '0.8' });
    expect(urls[0].lastmod).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('skips a catalog directory that contains no .en.md files', () => {
    existsSync.mockReturnValue(true);
    readdirSync
      .mockReturnValueOnce(['ai']) // CONTENT_PATH
      .mockReturnValueOnce(['transformers']) // category
      .mockReturnValueOnce(['intro.fr.md']); // catalog — no .en.md
    statSync.mockReturnValueOnce(makeDir()).mockReturnValueOnce(makeDir());

    const urls = buildLearnManifestUrls();

    expect(urls).toHaveLength(1); // only base /learn
  });

  it('adds catalog and guide entries; catalog has no publishedAt when all guides lack one', () => {
    // statSync call order:
    //   1. statSync(categoryPath).isDirectory()  → dir
    //   2. statSync(catalogPath).isDirectory()   → dir
    //   3. statSync(filePath).mtime              → catalogLastmod reduction
    //   4. statSync(filePath).mtime              → fileDate inside guide loop
    existsSync.mockReturnValue(true);
    readdirSync
      .mockReturnValueOnce(['ai']) // CONTENT_PATH
      .mockReturnValueOnce(['transformers']) // category
      .mockReturnValueOnce(['intro.en.md']); // catalog
    statSync
      .mockReturnValueOnce(makeDir()) // 1 category
      .mockReturnValueOnce(makeDir()) // 2 catalog
      .mockReturnValueOnce(makeFile()) // 3 lastmod
      .mockReturnValueOnce(makeFile()); // 4 fileDate
    readFileSync.mockReturnValueOnce(fm('intro', null));

    const urls = buildLearnManifestUrls();

    expect(urls).toHaveLength(3); // base + catalog + guide

    const catalog = urls.find((u) => u.loc === '/learn/transformers');
    expect(catalog).toBeDefined();
    expect(catalog.publishedAt).toBeUndefined(); // always visible — no gate

    const guide = urls.find((u) => u.loc === '/learn/transformers/intro');
    expect(guide).toBeDefined();
    expect(guide.publishedAt).toBeNull();
  });

  it('sets catalog publishedAt to the earliest guide publishedAt when guides have dates', () => {
    // statSync: 1. category dir  2. catalog dir
    // No fileDate calls — both guides have publishedAt, so lastmod uses publishedAt directly.
    // catalogLastmod is derived from guideEntries, not from file mtime.
    existsSync.mockReturnValue(true);
    readdirSync
      .mockReturnValueOnce(['ai'])
      .mockReturnValueOnce(['transformers'])
      .mockReturnValueOnce(['guide-a.en.md', 'guide-b.en.md']);
    statSync
      .mockReturnValueOnce(makeDir()) // 1 category
      .mockReturnValueOnce(makeDir()); // 2 catalog
    readFileSync.mockReturnValueOnce(fm('guide-a', '2025-06-01')).mockReturnValueOnce(fm('guide-b', '2025-03-01'));

    const urls = buildLearnManifestUrls();

    const catalog = urls.find((u) => u.loc === '/learn/transformers');
    expect(catalog?.publishedAt).toBe('2025-03-01'); // earliest wins
  });

  it('sets catalog publishedAt to null when some guides have no publishedAt (mixed dates)', () => {
    // guide-a: has publishedAt → lastmod = publishedAt (no statSync)
    // guide-b: no publishedAt, no updatedAt → lastmod = fileDate (1 statSync)
    existsSync.mockReturnValue(true);
    readdirSync
      .mockReturnValueOnce(['ai'])
      .mockReturnValueOnce(['transformers'])
      .mockReturnValueOnce(['guide-a.en.md', 'guide-b.en.md']);
    statSync
      .mockReturnValueOnce(makeDir()) // 1 category
      .mockReturnValueOnce(makeDir()) // 2 catalog
      .mockReturnValueOnce(makeFile()); // 3 fileDate for guide-b (no publishedAt/updatedAt)
    readFileSync.mockReturnValueOnce(fm('guide-a', '2025-06-01')).mockReturnValueOnce(fm('guide-b', null)); // no publishedAt

    const urls = buildLearnManifestUrls();

    // guide-b has no publishedAt → always visible → catalog must also be always visible
    const catalog = urls.find((u) => u.loc === '/learn/transformers');
    expect(catalog?.publishedAt).toBeUndefined();

    const guideB = urls.find((u) => u.loc === '/learn/transformers/guide-b');
    expect(guideB?.publishedAt).toBeNull();
  });

  it('skips guide entries whose frontmatter has no id, and skips the catalog when all guides are invalid', () => {
    existsSync.mockReturnValue(true);
    readdirSync.mockReturnValueOnce(['ai']).mockReturnValueOnce(['transformers']).mockReturnValueOnce(['bad.en.md']);
    statSync
      .mockReturnValueOnce(makeDir()) // category
      .mockReturnValueOnce(makeDir()) // catalog
      .mockReturnValueOnce(makeFile()); // catalogLastmod reduction
    // Frontmatter without an id field
    readFileSync.mockReturnValueOnce('---\ntitle: No ID Guide\n---\nContent');

    const urls = buildLearnManifestUrls();

    // guide skipped → guideEntries empty → catalog also skipped
    expect(urls).toHaveLength(1);
    expect(urls[0].loc).toBe('/learn');
  });

  it('skips non-directory entries at category and catalog levels', () => {
    existsSync.mockReturnValue(true);
    readdirSync
      .mockReturnValueOnce(['readme.md']) // CONTENT_PATH — not a dir
      .mockReturnValueOnce([]); // would never be called but safety net
    statSync.mockReturnValueOnce(makeFile()); // readme.md is not a dir

    const urls = buildLearnManifestUrls();

    expect(urls).toHaveLength(1);
  });
});
