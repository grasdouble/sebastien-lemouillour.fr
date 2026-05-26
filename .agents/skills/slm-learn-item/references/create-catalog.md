---
name: create-catalog
description: Capability for creating a new catalog — i18n keys in both locale files.
---

# Create Catalog

## Outcome

A new catalog is registered by creating its folder under `content/{categoryKey}/{catalogId}/` and adding i18n keys (title + description) to both `en.json` and `fr.json`. The catalog is auto-discovered by `learn.ts` as soon as at least one guide file exists in the folder.

> ⚠️ **Do not edit `learn.ts`** — catalogs are auto-discovered from the file system. The only manual step is the i18n metadata.

## Discovery

Gather these before writing anything. If the user has already provided some, skip those questions:

1. **Topic / name** — what is this catalog about?
2. **`id`** — propose a kebab-case id (e.g. `ai-fundamentals`). Confirm with user.
3. **`categoryKey`** — which category does this catalog belong to? One of `ia-llm`, `tooling`, `architecture`.
4. **Guides** — which existing guides (by id) should be placed in this catalog? They will be moved to the new folder.
5. **Title** — EN and FR versions (short, descriptive, e.g. "AI Fundamentals").
6. **Description** — EN and FR (1–2 sentences, no trailing period).

## Steps

### 1. Add i18n keys to `en.json`

File: `packages/parcels/learn/src/i18n/locales/en.json`

Add under `"catalogs"."items"`:

```json
"my-catalog-id": {
  "title": "...",
  "description": "..."
}
```

### 2. Add i18n keys to `fr.json`

File: `packages/parcels/learn/src/i18n/locales/fr.json`

Mirror the same structure with French translations.

### 3. Move or create guide files

The catalog folder `content/{categoryKey}/{catalogId}/` is created implicitly when guide files are placed in it.

- If assigning existing guides: use `git mv` to move their `.en.md` and `.fr.md` files into the new folder.
- If this catalog is being created ahead of any guide: create a `.gitkeep` file to hold the folder, and note that the catalog won't appear in the UI until at least one guide is added.

### 4. Create changeset

File: `.changeset/add-learn-catalog-{id}.md`

```md
---
'@grasdouble/slm_parcel_learn': minor
---

feat: add "{title_en}" catalog to the learn parcel.
```

### 5. Confirm

Summarize what was created:

- Catalog folder: `content/{categoryKey}/{catalogId}/`
- i18n keys added to both `en.json` and `fr.json`
- Guides moved (if any): list them
- Changeset created

Remind the user to run `pnpm build` from the `learn` package to validate.

## Constraints

- Catalog `id` must be unique and kebab-case
- The catalog must belong to a `categoryKey` listed in `CATEGORY_KEYS`
- A catalog with no guide files is valid but won't render in the UI
