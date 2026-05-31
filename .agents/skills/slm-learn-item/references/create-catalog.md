---
name: create-catalog
description: Capability for creating a new catalog — i18n keys in both locale files, CATALOG_ORDER entry in learn.ts.
---

# Create Catalog

## Language

- Communicate with the user in French (or match `{communication_language}`)
- Write EN i18n strings in English; write FR i18n strings in French

## Outcome

A new catalog is registered by:

1. Adding its `id` to `CATALOG_ORDER` in `learn.ts` (controls display order within the category)
2. Creating its folder under `content/{categoryKey}/{catalogId}/`
3. Adding i18n keys (title + description) to both `en.json` and `fr.json`

The catalog is auto-discovered by `learn.ts` as soon as at least one guide file exists in the folder. **Adding the entry to `CATALOG_ORDER` is mandatory** — a catalog absent from `CATALOG_ORDER` will appear last in the UI with a dev warning.

> ⚠️ **The catalog folder and i18n keys are auto-discovered** — do not add a catalog import or registration line to `learn.ts`. Only `CATALOG_ORDER` (and `CATEGORY_KEYS` if a new category is needed) may be edited.

## Pre-passes

Run these commands before gathering any information from the user. Use their output to validate inputs — never re-derive by reading files.

### Inventory snapshot

```bash
python3 {skill-root}/scripts/inventory-snapshot.py
```

Use to understand the current guide landscape and confirm which catalog IDs already exist (via folder presence).

### Consistency check

```bash
python3 {skill-root}/scripts/consistency-check.py
```

Review the output. Fix any critical consistency issues before proceeding. Report non-critical issues as warnings in the final summary.

**Blocked state:** If the requested catalog `id` already exists (found in `CATALOG_ORDER`, content folders, or i18n files), or the requested `categoryKey` is not in `CATEGORY_KEYS`, stop immediately and return:

```json
{ "status": "blocked", "reason": "<what the pre-pass found>", "pre_pass_issues": [...] }
```

Do not proceed until the blocking issue is resolved.

## Discovery

Gather these before writing anything. If the user has already provided some, skip those questions:

1. **Topic / name** — what is this catalog about?
2. **`id`** — propose a kebab-case id (e.g. `ai-fundamentals`). Confirm with user.
3. **`categoryKey`** — which category does this catalog belong to? One of `ia-llm`, `tooling`, `architecture`. If none fits, propose a new kebab-case key and confirm.
4. **Position in `CATALOG_ORDER`** — where should this catalog appear relative to the other catalogs in the same category? Propose appending it after the last catalog in the same category as default.
5. **Guides** — which existing guides (by id) should be placed in this catalog? They will be moved to the new folder.
6. **Title** — EN and FR versions (short, descriptive, e.g. "AI Fundamentals").
7. **Description** — EN and FR (1–2 sentences, no trailing period).

## Soft Checkpoint

Before writing any file, present a one-message summary of the planned catalog:

> "Je vais créer le catalogue `{id}` dans la catégorie `{categoryKey}`, inséré dans `CATALOG_ORDER` après `{preceding_catalog_id}` (ou en première position si le premier). Titre EN : `{title_en}`, titre FR : `{title_fr}`. [Guides à déplacer : liste ou aucun.] Confirme pour démarrer."

**Guided mode:** mandatory — wait for explicit confirmation or corrections before proceeding. If the user adds a constraint, update the plan and show the summary once more.

## Steps

Execute all steps. Do not stop between them.

### 1. Edit `CATALOG_ORDER` in `learn.ts`

File: `packages/parcels/learn/src/data/learn.ts`

Insert the new catalog `id` at the agreed position within the `CATALOG_ORDER` array. The array is flat; catalogs are sorted per category in the UI at runtime.

```ts
export const CATALOG_ORDER: readonly string[] = [
  // ... existing entries ...
  '{catalogId}', // ← insert at confirmed position
  // ... existing entries ...
];
```

If a new `categoryKey` is needed, also add it to `CATEGORY_KEYS`:

```ts
export const CATEGORY_KEYS: readonly string[] = [
  // ... existing entries ...
  '{categoryKey}',
];
```

### 2. Add i18n keys to `en.json`

File: `packages/parcels/learn/src/i18n/locales/en.json`

Add under `"catalogs"."items"`:

```json
"my-catalog-id": {
  "title": "...",
  "description": "..."
}
```

If a new category: also add under `"categories"`:

```json
"{categoryKey}": "{category_label_en}"
```

### 3. Add i18n keys to `fr.json`

File: `packages/parcels/learn/src/i18n/locales/fr.json`

Mirror the same structure with French translations (catalog and, if applicable, category).

### 4. Move or create guide files

The catalog folder `content/{categoryKey}/{catalogId}/` is created implicitly when guide files are placed in it.

- If assigning existing guides: move **both** `.en.md` and `.fr.md` files into the new folder using your file tools (read old file, create at new path, delete old file). Do **not** use `git mv` — it stages files automatically, which conflicts with the no-staging rule.
- After moving guides: run `catalog-order-map.py` on **both** the source catalog and the new catalog to detect duplicate or gapped `order` values, then reindex them so order values are contiguous (1, 2, 3…) within each affected catalog.
- If this catalog is being created ahead of any guide: create a `.gitkeep` file to hold the folder, and note that the catalog won't appear in the UI until at least one guide is added.

### 5. Create changeset

File: `.changeset/add-learn-catalog-{id}.md`

```md
---
'@grasdouble/slm_parcel_learn': minor
---

feat: add "{title_en}" catalog to the learn parcel.
```

### 6. Confirm

Summarize what was created:

- `CATALOG_ORDER` updated in `learn.ts` (position confirmed)
- Catalog folder: `content/{categoryKey}/{catalogId}/`
- i18n keys added to both `en.json` and `fr.json`
- Guides moved (if any): list them; order values reindexed in affected catalogs
- Changeset created

Remind the user to run `pnpm build` from the `learn` package to validate.

If `{workflow.on_complete}` is non-empty, execute it after confirming.

## Constraints

- Catalog `id` must be unique and kebab-case
- The catalog must belong to a `categoryKey` listed in `CATEGORY_KEYS`
- Every new catalog must be added to `CATALOG_ORDER` — never skip this step
- A catalog with no guide files is valid but won't render in the UI

## Mode

Catalog workflows operate in **Guided mode only** — Yolo and Headless detection do not apply here.

All writes require explicit user confirmation at the Soft Checkpoint before proceeding. The user must confirm or correct the summary before any file is touched.
