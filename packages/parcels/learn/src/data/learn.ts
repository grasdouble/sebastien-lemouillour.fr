export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export type RawCatalog = {
  id: string;
  categoryKey: string;
  guideIds: readonly string[];
};

export type Catalog = {
  id: string;
  categoryKey: string;
  category: string;
  title: string;
  description: string;
  guideIds: readonly string[];
};

export type Tutorial = {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: Difficulty;
  tags: string[];
  content: string;
};

export type RawLearnItem = {
  id: string;
  categoryKey: string;
  difficulty: Difficulty;
  tags: string[];
  content: { fr: string; en: string };
};

// CATEGORY_KEYS controls category display order.
export const CATEGORY_KEYS: readonly string[] = ['ia-llm', 'tooling', 'architecture'];

export const DIFFICULTIES: readonly Difficulty[] = ['beginner', 'intermediate', 'advanced'];

export const DIFFICULTY_VARIANT: Record<Difficulty, 'success' | 'warning' | 'danger'> = {
  beginner: 'success',
  intermediate: 'warning',
  advanced: 'danger',
};

export const DIFFICULTY_I18N_KEY: Record<Difficulty, string> = {
  beginner: 'difficulty.beginner',
  intermediate: 'difficulty.intermediate',
  advanced: 'difficulty.advanced',
};

// ---------------------------------------------------------------------------
// Auto-discovery — Vite glob import
// File path convention: ./content/<categoryKey>/<catalogId>/<guideId>.<lang>.md
// The guide id is declared in frontmatter and is independent of the filename.
// ---------------------------------------------------------------------------

type GuideFrontmatter = {
  id: string;
  difficulty: Difficulty;
  tags: string[];
};

/**
 * Parses YAML frontmatter delimited by `---` at the top of a markdown file.
 * Extracts `id` (string), `difficulty` (string) and `tags` (inline array).
 */
function parseFrontmatter(raw: string, path: string): { meta: GuideFrontmatter; body: string } {
  const parts = raw.split(/^---$/m);
  if (parts.length < 3) {
    throw new Error(`[learn] Missing frontmatter in ${path}`);
  }

  const meta: Partial<GuideFrontmatter> = {};

  for (const line of parts[1].split('\n')) {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim();
    const value = line.slice(colonIdx + 1).trim();

    if (key === 'id') {
      meta.id = value;
    } else if (key === 'difficulty') {
      if (!DIFFICULTIES.includes(value as Difficulty)) {
        throw new Error(`[learn] Invalid difficulty "${value}" in ${path}. Must be one of: ${DIFFICULTIES.join(', ')}`);
      }
      meta.difficulty = value as Difficulty;
    } else if (key === 'tags') {
      meta.tags = value
        .replace(/^\[|\]$/g, '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    }
  }

  if (!meta.id || !meta.difficulty || !meta.tags) {
    throw new Error(`[learn] Incomplete frontmatter in ${path}: missing "id", "difficulty" or "tags"`);
  }

  return { meta: meta as GuideFrontmatter, body: parts.slice(2).join('---').trimStart() };
}

/**
 * Extracts categoryKey, catalogId and lang from a glob path.
 * The guide id comes from frontmatter, not the filename.
 * Expected format: ./content/<categoryKey>/<catalogId>/<anything>.<lang>.md
 */
function parsePath(path: string): {
  categoryKey: string;
  catalogId: string;
  lang: 'fr' | 'en';
} {
  const segments = path.replace('./content/', '').split('/');
  const [categoryKey, catalogId, filename] = segments;
  const dotParts = filename.replace(/\.md$/, '').split('.');
  const lang = dotParts.pop() as 'fr' | 'en';
  return { categoryKey, catalogId, lang };
}

type GuideAccumulator = {
  categoryKey: string;
  difficulty: Difficulty;
  tags: string[];
  content: Partial<Record<'fr' | 'en', string>>;
};

const _rawModules: Record<string, string> = import.meta.glob('./content/**/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
});

const _guideMap = new Map<string, GuideAccumulator>();
type CatalogAccumulator = {
  categoryKey: string;
  guideIds: string[];
};

const _catalogMap = new Map<string, CatalogAccumulator>();

for (const [path, raw] of Object.entries(_rawModules)) {
  const { categoryKey, catalogId, lang } = parsePath(path);
  const { meta, body } = parseFrontmatter(raw, path);
  const { id } = meta;

  if (!_guideMap.has(id)) {
    _guideMap.set(id, { categoryKey, difficulty: meta.difficulty, tags: meta.tags, content: {} });
  }
  _guideMap.get(id)!.content[lang] = body;

  if (!_catalogMap.has(catalogId)) {
    _catalogMap.set(catalogId, { categoryKey, guideIds: [] });
  }
  const catalogAcc = _catalogMap.get(catalogId)!;
  if (!catalogAcc.guideIds.includes(id)) {
    catalogAcc.guideIds.push(id);
  }
}

export const RAW_LEARN_ITEMS: readonly RawLearnItem[] = [..._guideMap.entries()].map(([id, acc]) => ({
  id,
  categoryKey: acc.categoryKey,
  difficulty: acc.difficulty,
  tags: acc.tags,
  content: acc.content as { fr: string; en: string },
}));

export const RAW_CATALOGS: readonly RawCatalog[] = [..._catalogMap.entries()].map(([id, acc]) => ({
  id,
  categoryKey: acc.categoryKey,
  guideIds: acc.guideIds,
}));

export const ALL_TAGS: readonly string[] = [...new Set(RAW_LEARN_ITEMS.flatMap((t) => t.tags))].sort();

if (import.meta.env.DEV) {
  const validCategoryKeys = new Set(CATEGORY_KEYS);
  const unknownCategory = RAW_LEARN_ITEMS.filter((g) => !validCategoryKeys.has(g.categoryKey));
  if (unknownCategory.length > 0) {
    console.warn(
      '[learn] Guides found in unknown category folders (not listed in CATEGORY_KEYS):',
      unknownCategory.map((g) => g.id)
    );
  }

  // Detect duplicate ids declared in frontmatter across different files
  const idCounts = new Map<string, number>();
  const idPattern = /^id:\s*(\S+)/m;
  for (const raw of Object.values(_rawModules)) {
    const match = idPattern.exec(raw);
    if (match) idCounts.set(match[1], (idCounts.get(match[1]) ?? 0) + 1);
  }
  // Each guide id should appear exactly twice: once for EN, once for FR
  const duplicates = [...idCounts.entries()].filter(([, count]) => count > 2).map(([id]) => id);
  if (duplicates.length > 0) {
    console.warn(
      '[learn] Duplicate guide ids in frontmatter (each id must appear in exactly one EN+FR pair):',
      duplicates
    );
  }
}
