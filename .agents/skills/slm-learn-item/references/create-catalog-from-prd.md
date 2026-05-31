---
name: create-catalog-from-prd
description: Capability for creating multiple catalogs and guide stubs in one operation from a PRD markdown file.
---

# Create Catalogs from PRD

## Language

- Communicate with the user in French (or match `{communication_language}`)
- Write EN i18n strings and EN markdown content in English; write FR i18n strings and FR markdown content in French

## Outcome

All catalogs defined in the PRD are created in one atomic operation:

1. Each catalog's `id` is added to `CATALOG_ORDER` in `learn.ts`
2. Each catalog's folder is created under `content/{categoryKey}/{catalogId}/`
3. i18n keys (title + description) are added to both `en.json` and `fr.json` for each catalog
4. A guide stub (`.en.md` + `.fr.md`) is created for each guide listed in the PRD, with correct frontmatter and a placeholder body

> ⚠️ Guide stubs are scaffolded but not content-complete. Use the `update-guide` workflow to write full content for each stub after creation.

## Supported PRD Format

The skill supports both French and English PRD headings — auto-detected per file.

**French format:**

```
# Catalogue N — Titre FR

> Objectif : description...

## Niveau Débutant | Intermédiaire | Avancé

### Sous-section

1. Titre du guide FR
```

**English format:**

```
# Catalog N — Title EN

> Objective: description...

## Beginner | Intermediate | Advanced Level

### Sub-section

1. Guide title EN
```

Both formats can coexist across catalogs in the same PRD file — detection is per-file.

**Parsing rules:**

| PRD element                                         | Maps to                                                           |
| --------------------------------------------------- | ----------------------------------------------------------------- |
| `# Catalogue N — Title` / `# Catalog N — Title`     | Catalog title (extracted after `— `)                              |
| `> Objectif : …` / `> Objective: …`                 | Catalog description — **required**                                |
| `## Niveau Débutant` / `## Beginner Level`          | `difficulty: beginner`                                            |
| `## Niveau Intermédiaire` / `## Intermediate Level` | `difficulty: intermediate`                                        |
| `## Niveau Avancé` / `## Advanced Level`            | `difficulty: advanced`                                            |
| `### Sub-section`                                   | Sub-section label (used for tag derivation, not folder structure) |
| `N. Guide title`                                    | Guide — N = `order` within catalog (continuous per catalog)       |

The `source_language` field in the manifest (`"en"` or `"fr"`) tells the agent which language the source titles are in. When `source_language: "en"`, use source titles as EN i18n strings directly and translate to FR. When `source_language: "fr"`, reverse applies.

## Pre-passes

Run before any file discovery or user interaction. Use the pre-pass output as the authoritative state — never re-derive manually.

### Parse-PRD dry-run

```bash
python3 {skill-root}/scripts/parse-prd-import.py <prd-file-path> --category <categoryKey>
```

This script:

- Parses the PRD and generates proposed `catalogId` and `guideId` values (kebab-case from FR titles)
- Detects errors: missing `> Objectif` block, non-contiguous ordering, empty guide IDs, unresolvable difficulty
- Detects collisions: internal (within the batch) and external (against existing content/)
- Outputs a structured JSON manifest

If the script reports **errors** in `validation.errors`, stop immediately:

```json
{ "status": "blocked", "reason": "<error message>", "pre_pass_issues": [...] }
```

Warnings (`validation.warnings`) are non-blocking — note them in the final summary.

### Consistency check

```bash
python3 {skill-root}/scripts/consistency-check.py
```

Fix critical consistency issues before proceeding. Report non-critical issues as warnings in the final summary.

## Discovery

If the PRD file path was provided in the user's opening message (e.g. via a tagged file reference), skip step 1.

1. **PRD file path** — absolute or relative to the project root. Read the file.
2. **`categoryKey`** — which category do all catalogs in this PRD belong to? If all catalogs share the same category, one answer covers all. If different, clarify per catalog.
   - Pass this to the parse script with `--category <categoryKey>`.
3. **Guide stub visibility** — guide stubs are scaffolded with `publishedAt: {today}`. This means they will appear in production as soon as deployed, with a "🚧 being written" placeholder body.
   - Ask once: "Tu confirmes que les stubs seront visibles en production dès le déploiement ? (Sinon je peux utiliser une date future pour les masquer.)"
   - Default: visible immediately (`publishedAt: today`)
   - Alternative: set `publishedAt` to a future date (e.g. `2099-12-31`) to hide them until content is ready

## Master Checkpoint

Present a master checkpoint **before writing any file**. Wait for explicit user confirmation.

### Section 1 — Catalog plan

> "J'ai analysé le PRD. Voici le plan — confirme ou ajuste avant que je démarre."

Show a table of proposed catalogs:

| Catalogue (PRD)    | `catalogId` proposé  | `categoryKey` | Guides | beginner / intermediate / advanced |
| ------------------ | -------------------- | ------------- | ------ | ---------------------------------- |
| Comprendre les LLM | `comprendre-les-llm` | `ia-llm`      | 29     | 15 / 7 / 7                         |
| …                  | …                    | …             | …      | …                                  |

### Section 2 — Guide manifest (per catalog)

For **each catalog**, show its complete guide list as a compact table:

| #   | `guideId` proposé                         | Titre FR                                    | Difficulté | Sous-section      |
| --- | ----------------------------------------- | ------------------------------------------- | ---------- | ----------------- |
| 1   | `quest-ce-que-lintelligence-artificielle` | Qu'est-ce que l'Intelligence Artificielle ? | beginner   | Les bases de l'IA |
| 2   | …                                         | …                                           | …          | …                 |

This allows the user to catch any bad ID generation before files are created.

### Section 3 — Assumptions

List all assumptions applied:

- "Tous les catalogues sont dans `{categoryKey}`"
- "Les IDs sont générés en kebab-case depuis les titres FR (déterministe)"
- "Les stubs de guides contiennent frontmatter + marqueur `🚧` — `publishedAt: {visibility_choice}`"
- "Un seul changeset couvre l'ensemble de l'import"
- Any warnings from the pre-pass

### Adjustment round

If the user requests adjustments (different `id`, different `categoryKey`, visibility change), update the manifest and re-show the affected sections. Only one round of corrections before proceeding.

## Steps

Execute all steps in order. Do not stop between them once the user confirms.

### 1. Resolve proposed IDs

Use the manifest from the parse-prd dry-run as the base. Apply any user corrections from the checkpoint round. Final IDs must be unique and kebab-case.

If any `guideId` collision was flagged as a warning, append a short disambiguating suffix (e.g. `-llm`, `-2`) and include in the manifest.

### 2. Edit `CATALOG_ORDER` in `learn.ts`

File: `packages/parcels/learn/src/data/learn.ts`

For each new catalog, append its `id` to `CATALOG_ORDER` after the last entry in the same `categoryKey`. If the `categoryKey` is new, also add it to `CATEGORY_KEYS`.

```ts
export const CATALOG_ORDER: readonly string[] = [
  // ... existing entries ...
  '{catalogId-1}',
  '{catalogId-2}',
  // ...
];
```

### 3. Add catalog i18n keys

**`en.json`** (`packages/parcels/learn/src/i18n/locales/en.json`) — add under `"catalogs"."items"` for each catalog:

```json
"{catalogId}": {
  "title": "{title_en}",
  "description": "{description_en}"
}
```

**`fr.json`** (`packages/parcels/learn/src/i18n/locales/fr.json`) — add under `"catalogs"."items"`:

```json
"{catalogId}": {
  "title": "{title_fr}",
  "description": "{description_fr}"
}
```

Derive EN title and description by translating the FR values from the PRD. Keep descriptions to 1–2 sentences, no trailing period.

If a new category was added: also add its label under `"categories"` in both locale files.

### 4. Add guide i18n keys

For each guide, add to both `en.json` and `fr.json` under `"items"`:

```json
"{guideId}": {
  "title": "{title_en_or_fr}",
  "description": "{short_description_en_or_fr}"
}
```

Derive the EN title by translating the guide's FR title. Keep descriptions to 1 sentence, no trailing period. For EN descriptions, describe what the guide covers based on the title.

### 5. Create guide stubs

For each guide in each catalog, create both files:

**EN stub** — `packages/parcels/learn/src/data/content/{categoryKey}/{catalogId}/{guideId}.en.md`:

```md
---
id: { guideId }
order: { order }
difficulty: { difficulty }
tags: [{ tags }]
publishedAt: { YYYY-MM-DD }
updatedAt: { YYYY-MM-DD }
---

## {title_en}

> 🚧 This guide is being written.
```

**FR stub** — `packages/parcels/learn/src/data/content/{categoryKey}/{catalogId}/{guideId}.fr.md`:

```md
---
id: { guideId }
order: { order }
difficulty: { difficulty }
tags: [{ tags }]
publishedAt: { YYYY-MM-DD }
updatedAt: { YYYY-MM-DD }
---

## {title_fr}

> 🚧 Ce guide est en cours de rédaction.
```

**Frontmatter rules:**

- Both files have **identical** frontmatter
- `publishedAt` and `updatedAt` are both set to today's UTC date (or the user-chosen visibility date)
- `tags`: 2–5 tags derived from the catalog context and sub-section label. PascalCase for proper nouns/tools (`LLM`, `RAG`, `Transformer`), lowercase for concepts (`tokenisation`, `alignement`)
- `order`: taken directly from the PRD item number (continuous within the catalog)
- `difficulty`: mapped from the `## Niveau` heading

### 6. Create changeset

File: `.changeset/import-prd-{prd-slug}.md`

Where `{prd-slug}` is a kebab-case slug derived from the PRD filename (without extension).

```md
---
'@grasdouble/slm_parcel_learn': minor
---

feat: scaffold {N} catalogs and {M} guide stubs from PRD "{prd-title}".
```

### 7. Run consistency check

```bash
python3 {skill-root}/scripts/consistency-check.py
```

All created catalogs and guides must appear without errors. Report any remaining warnings as backlog in the final summary.

### 8. Confirm

Summarize what was created:

- Catalogs created (list with folder path)
- Total guide stubs created (per catalog breakdown)
- `CATALOG_ORDER` entries added to `learn.ts`
- i18n keys added: N catalog keys + M guide keys in both `en.json` and `fr.json`
- Changeset: `.changeset/import-prd-{prd-slug}.md`
- Any warnings from validation (backlog)

> **Next step:** use `update-guide [id]` or `create guide [id]` to write full content for each stub.

Remind the user to run `pnpm build` from the `learn` package to validate.

If `{workflow.on_complete}` is non-empty, execute it after confirming.

## Constraints

- All catalog `id` values must be unique (checked via pre-pass, blocked on collision)
- All guide `id` values must be unique across the entire content tree (collision = warning → disambiguate before writing)
- Every catalog must be added to `CATALOG_ORDER`
- Every guide must have both `.en.md` and `.fr.md` stubs — never one without the other
- Guide `order` values must be contiguous (1, 2, 3…) within each catalog, matching PRD item numbers
- A guide stub is valid published content — do not create stubs with empty bodies

## Mode

This workflow operates in **Guided mode** — a master checkpoint is mandatory before any file is created.

Yolo and Headless detection do not apply to this workflow: the scale of a PRD import (multiple catalogs + many guide stubs) always requires explicit user confirmation.
