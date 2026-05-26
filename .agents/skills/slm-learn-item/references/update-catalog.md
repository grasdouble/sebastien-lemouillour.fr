---
name: update-catalog
description: Capability for updating an existing catalog — move guides in/out, reorder, or update i18n title/description.
---

# Update Catalog

## Outcome

The specified catalog is updated — guides moved in or out of the catalog folder, and/or i18n keys updated in `en.json` and `fr.json`.

> ⚠️ **Do not edit `learn.ts`** — catalog membership is determined by the file system. Moving guide files is the only way to add/remove guides from a catalog.

## Discovery

Gather these before writing anything:

1. **Catalog id** — which catalog to update? List existing catalogs from `content/` folders if unclear.
2. **What to change** — one or more of:
   - Add guide(s) to the catalog (move their files into the catalog folder)
   - Remove guide(s) from the catalog (move their files to another catalog folder)
   - Update title (EN and/or FR)
   - Update description (EN and/or FR)

## Steps

### Guide membership changes

Use `git mv` to move guide files between catalog folders.

- **Add a guide** to this catalog: `git mv content/{srcCategory}/{srcCatalog}/{id}.{lang}.md content/{categoryKey}/{catalogId}/{id}.{lang}.md`
- **Remove a guide** from this catalog: move it to another catalog folder (a guide must always belong to exactly one catalog)

Both `.en.md` and `.fr.md` files must be moved together.

### i18n title or description update

- EN: edit under `"catalogs"."items"."{catalogId}"` in `packages/parcels/learn/src/i18n/locales/en.json`
- FR: edit under `"catalogs"."items"."{catalogId}"` in `packages/parcels/learn/src/i18n/locales/fr.json`

Always update both files if any i18n field changes.

### Changeset

File: `.changeset/update-learn-catalog-{id}.md` (if a file with that name already exists, append a short suffix like `-guides` or `-i18n`)

```md
---
'@grasdouble/slm_parcel_learn': patch
---

fix: update "{title}" catalog — {brief description of change}.
```

### Confirm

Summarize what changed (files moved, i18n fields updated). Remind the user to run `pnpm build` from the `learn` package.

## Constraints

- A guide must always belong to exactly one catalog — never leave guide files in a folder that no longer has i18n keys, and never remove a guide without re-assigning it
- Always move both `.en.md` and `.fr.md` together
- Catalog `id` derives from the folder name — renaming a catalog means renaming the folder (`git mv`) and updating its i18n key
