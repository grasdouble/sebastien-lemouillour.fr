---
name: update-catalog
description: Capability for updating an existing catalog — move guides in/out, reorder, rename, or update i18n title/description.
---

# Update Catalog

## Language

- Communicate with the user in French (or match `{communication_language}`)
- Write EN i18n strings in English; write FR i18n strings in French

## Outcome

The specified catalog is updated — guides moved in or out of the catalog folder, order values reindexed, i18n keys updated in `en.json` and `fr.json`, and `CATALOG_ORDER` / `CATEGORY_KEYS` in `learn.ts` updated when the catalog is renamed or a new category is introduced.

> ⚠️ **The catalog folder and i18n keys are auto-discovered** — do not add catalog imports or registration lines to `learn.ts`. Only `CATALOG_ORDER` (and `CATEGORY_KEYS` if a category changes) may be edited.

## Pre-passes

Run these commands before doing anything. Use their output as the authoritative source — never re-derive by reading files manually.

### Consistency check

```bash
python3 {skill-root}/scripts/consistency-check.py
```

Review the output. Fix critical consistency issues before proceeding. Report non-critical issues as warnings in the final summary.

### Catalog order map (for reorder or membership changes)

```bash
python3 {skill-root}/scripts/catalog-order-map.py {categoryKey} {catalogId}
```

Run this for every catalog that will gain or lose guides, and for the target catalog itself. Use its `current_order` as the authoritative order state — do not re-read frontmatter manually.

**Blocked state:** If the pre-passes reveal that the target catalog does not exist, or that consistency errors make the requested change unsafe, stop immediately and return:

```json
{ "status": "blocked", "reason": "<what the pre-pass found>", "pre_pass_issues": [...] }
```

Do not proceed until the blocking issue is resolved.

## Discovery

1. **Catalog id** — which catalog to update? Run the consistency check output or list `content/` folders if unclear.
2. **What to change** — one or more of:
   - Add guide(s) to the catalog (move their files into the catalog folder)
   - Remove guide(s) from the catalog (move their files to another catalog folder)
   - Reorder guides within the catalog (change their `order` frontmatter values)
   - Rename the catalog (rename the folder and update `CATALOG_ORDER`)
   - Update title (EN and/or FR)
   - Update description (EN and/or FR)

## Scope Summary

Before applying any change, present a one-message scope summary:

> "Je vais [describe changes] dans le catalogue `{catalogId}`. [Guides concernés : liste.] [Assumptions: …] Confirme ou ajuste."

**Guided mode:** mandatory — wait for explicit confirmation before proceeding. If the user adds a constraint, update the plan and show the summary once more.

## Steps

Execute only the steps relevant to the requested changes.

### Guide membership changes

Move guide files between catalog folders using your file tools (read old file, create at new path, delete old file). Do **not** use `git mv` — it stages files automatically, which conflicts with the no-staging rule.

- **Add a guide** to this catalog: move `content/{srcCategory}/{srcCatalog}/{id}.en.md` and `content/{srcCategory}/{srcCatalog}/{id}.fr.md` to `content/{categoryKey}/{catalogId}/`.
- **Remove a guide** from this catalog: move it to another catalog folder (a guide must always belong to exactly one catalog).

Always move both `.en.md` and `.fr.md` files together in the same operation.

**After any membership change:** run `catalog-order-map.py` on every affected catalog (source and destination) and reindex `order` values to be contiguous (1, 2, 3…) in both. Update the `order` field in **both** `.en.md` and `.fr.md` for every affected guide.

### Reorder guides within a catalog

The display order of guides within a catalog is controlled by the `order` integer field in each guide's frontmatter (both `.en.md` and `.fr.md`). Lower numbers appear first.

**Workflow:**

1. Use the `catalog-order-map.py` output from the pre-pass (or re-run if stale):

   ```bash
   python3 {skill-root}/scripts/catalog-order-map.py {categoryKey} {catalogId}
   ```

2. Determine the desired new ordering with the user
3. For each guide whose position changes, update the `order` field in **both** `.en.md` and `.fr.md`
4. Verify that no two guides share the same `order` value — if a conflict exists, shift values to resolve it (increment by 1, cascading up)
5. Keep values contiguous (1, 2, 3…) — never leave gaps

**Example:** Moving guide `react-query-basics` from position 3 to position 1 in a catalog with 3 guides:

- `react-query-basics`: `order: 3` → `order: 1`
- `caching-strategies`: `order: 1` → `order: 2`
- `optimistic-updates`: `order: 2` → `order: 3`

Update **both** language files for each affected guide.

### Rename catalog

Renaming a catalog requires updating every reference to the old id:

1. Move all guide files from `content/{categoryKey}/{oldId}/` to `content/{categoryKey}/{newId}/` using file tools
2. Delete the old empty folder
3. Update `CATALOG_ORDER` in `packages/parcels/learn/src/data/learn.ts` — replace `'{oldId}'` with `'{newId}'`
4. Rename the i18n key from `"{oldId}"` to `"{newId}"` in **both** `en.json` and `fr.json` under `"catalogs"."items"`
5. Do **not** use `git mv` — staging is the user's responsibility

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

Summarize what changed (files moved, order values reindexed, i18n fields updated, `learn.ts` updated if applicable). Remind the user to run `pnpm build` from the `learn` package.

If `{workflow.on_complete}` is non-empty, execute it after confirming.

## Constraints

- A guide must always belong to exactly one catalog — never leave guide files in a folder that no longer has i18n keys, and never remove a guide without re-assigning it
- Always move both `.en.md` and `.fr.md` together
- After any guide moves, always reindex `order` values in every affected catalog to keep them contiguous
- Catalog `id` derives from the folder name — renaming requires updating the folder, `CATALOG_ORDER`, and i18n keys in both locales
- A renamed catalog must keep its entry in `CATALOG_ORDER` up to date — never leave a stale id in the array
