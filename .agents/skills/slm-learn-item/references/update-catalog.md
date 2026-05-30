---
name: update-catalog
description: Capability for updating an existing catalog — move guides in/out, reorder, or update i18n title/description.
---

# Update Catalog

## Language

- Communicate with the user in French (or match `{communication_language}`)
- Write EN i18n strings in English; write FR i18n strings in French

## Outcome

The specified catalog is updated — guides moved in or out of the catalog folder, and/or i18n keys updated in `en.json` and `fr.json`.

> ⚠️ **Do not edit `learn.ts`** — catalog membership is determined by the file system. Moving guide files is the only way to add/remove guides from a catalog.

## Discovery

Gather these before writing anything:

1. **Catalog id** — which catalog to update? List existing catalogs from `content/` folders if unclear.
2. **What to change** — one or more of:
   - Add guide(s) to the catalog (move their files into the catalog folder)
   - Remove guide(s) from the catalog (move their files to another catalog folder)
   - Reorder guides within the catalog (change their `order` frontmatter values)
   - Update title (EN and/or FR)
   - Update description (EN and/or FR)

## Steps

### Guide membership changes

Move guide files between catalog folders using your file tools (read old file, create at new path, delete old file). Do **not** use `git mv` — it stages files automatically, which conflicts with the no-staging rule. Git state management (staging, committing) is the user's responsibility.

- **Add a guide** to this catalog: move `content/{srcCategory}/{srcCatalog}/{id}.en.md` and `content/{srcCategory}/{srcCatalog}/{id}.fr.md` to `content/{categoryKey}/{catalogId}/`.
- **Remove a guide** from this catalog: move it to another catalog folder (a guide must always belong to exactly one catalog).

Always move both `.en.md` and `.fr.md` files together in the same operation.

### Reorder guides within a catalog

The display order of guides within a catalog is controlled by the `order` integer field in each guide's frontmatter (both `.en.md` and `.fr.md`). Lower numbers appear first.

**Workflow:**

1. Run the catalog order map pre-pass (substitute the actual `categoryKey` and `catalogId` values):

   ```bash
   python3 - <<'PYEOF'
   import os, re, json
   catalog_path = "packages/parcels/learn/src/data/content/{categoryKey}/{catalogId}"  # ← substitute actual values
   guides = []
   for f in sorted(os.listdir(catalog_path)):
       if not f.endswith('.en.md'): continue
       content = open(os.path.join(catalog_path, f)).read()
       parts = content.split('---', 2)
       fm = {}
       if len(parts) >= 3:
           for line in parts[1].split('\n'):
               idx = line.find(':')
               if idx != -1:
                   k, v = line[:idx].strip(), line[idx+1:].strip()
                   if k: fm[k] = v
       guides.append({"id": fm.get("id", f.replace('.en.md', '')), "order": int(fm.get("order", 0)), "file": f})
   guides.sort(key=lambda g: g["order"])
   orders = [g["order"] for g in guides]
   dupes = sorted({o for o in orders if orders.count(o) > 1})
   print(json.dumps({"current_order": guides, "duplicate_orders": dupes,
                     "is_contiguous": orders == list(range(1, len(orders) + 1))}, indent=2))
   PYEOF
   ```

   Use the JSON output (`current_order`) as the authoritative order map — do not re-read frontmatter manually.

2. Determine the desired new ordering with the user
3. For each guide whose position changes, update the `order` field in **both** `.en.md` and `.fr.md`
4. Verify that no two guides share the same `order` value within the catalog after the change — if a conflict exists, shift the other values to resolve it (increment by 1 cascading up)
5. Never leave gaps in the sequence that could create ambiguity; keep values contiguous (1, 2, 3…)

**Example:** Moving guide `react-query-basics` from position 3 to position 1 in a catalog with 3 guides:

- `react-query-basics`: `order: 3` → `order: 1`
- `caching-strategies`: `order: 1` → `order: 2`
- `optimistic-updates`: `order: 2` → `order: 3`

Update **both** language files for each affected guide. Changes to frontmatter do not require moving any files.

### i18n title or description update

- EN: edit under `"catalogs"."items"."{catalogId}"` in `packages/parcels/learn/src/i18n/locales/en.json`
- FR: edit under `"catalogs"."items"."{catalogId}"` in `packages/parcels/learn/src/i18n/locales/fr.json`

Always update both files if any i18n field changes.

File: `.changeset/update-learn-catalog-{id}.md` (if a file with that name already exists, append a short suffix like `-guides` or `-i18n`)

```md
---
'@grasdouble/slm_parcel_learn': patch
---

fix: update "{title}" catalog — {brief description of change}.
```

### Confirm

Summarize what changed (files moved, i18n fields updated). Remind the user to run `pnpm build` from the `learn` package.

If `{workflow.on_complete}` is non-empty, execute it after confirming.

## Constraints

- A guide must always belong to exactly one catalog — never leave guide files in a folder that no longer has i18n keys, and never remove a guide without re-assigning it
- Always move both `.en.md` and `.fr.md` together
- Catalog `id` derives from the folder name — renaming a catalog means renaming the folder with your file tools (move all guide files to the new path, then delete the old folder) and updating its i18n key. Do **not** use `git mv` — staging is the user's responsibility.
