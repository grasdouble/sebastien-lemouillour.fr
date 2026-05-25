---
name: create-catalog
description: Capability for creating a new catalog — data entry in learn.ts and i18n keys in both locale files.
---

# Create Catalog

## Outcome

A new catalog entry exists in `RAW_CATALOGS` in `learn.ts`, and i18n keys (title + description) are added to both `en.json` and `fr.json`. The catalog is immediately navigable from the learn page.

## Discovery

Gather these before writing anything. If the user has already provided some, skip those questions:

1. **Topic / name** — what is this catalog about?
2. **`id`** — propose a kebab-case id (e.g. `ai-fundamentals`). Confirm with user.
3. **`guideIds`** — ordered list of existing guide IDs to include. Ask the user or suggest based on topic. All IDs must exist in `RAW_LEARN_ITEMS`.
4. **Title** — EN and FR versions (short, descriptive, e.g. "AI Fundamentals").
5. **Description** — EN and FR (1–2 sentences, no trailing period).

## Steps

1. **Add entry to `RAW_CATALOGS`** in `packages/parcels/learn/src/data/learn.ts`:

   ```ts
   {
     id: 'my-catalog-id',
     guideIds: ['guide-id-1', 'guide-id-2'],
   },
   ```

2. **Add i18n keys** to `packages/parcels/learn/src/i18n/locales/en.json`:
   ```json
   "catalogs": {
     "items": {
       "my-catalog-id": {
         "title": "...",
         "description": "..."
       }
     }
   }
   ```
   Mirror the same structure in `fr.json` with French translations.

## Constraints

- Only use guide IDs that already exist in `RAW_LEARN_ITEMS` — never invent IDs
- A guide can only belong to one catalog
- The order of `guideIds` defines the display order in the catalog detail page
- Catalog `id` must be unique and kebab-case
