---
name: update-catalog
description: Capability for updating an existing catalog — modify guideIds order, add/remove guides, or update i18n title/description.
---

# Update Catalog

## Outcome

The specified catalog is updated in `RAW_CATALOGS` and/or its i18n keys in `en.json` and `fr.json`.

## Discovery

Gather these before writing anything:

1. **Catalog id** — which catalog to update? List existing catalogs from `RAW_CATALOGS` if unclear.
2. **What to change** — one or more of:
   - Add guide(s) to `guideIds`
   - Remove guide(s) from `guideIds`
   - Reorder `guideIds`
   - Update title (EN and/or FR)
   - Update description (EN and/or FR)

## Steps

1. **Update `RAW_CATALOGS`** in `packages/parcels/learn/src/data/learn.ts` — modify `guideIds` as needed.
2. **Update i18n keys** in `en.json` and/or `fr.json` if title or description changed.

## Constraints

- Only use guide IDs that already exist in `RAW_LEARN_ITEMS`
- Always update both `en.json` and `fr.json` if any i18n field changes
