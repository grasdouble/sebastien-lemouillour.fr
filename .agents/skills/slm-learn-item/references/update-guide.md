---
name: update-guide
description: Capability for updating an existing learn guide — content, metadata, or translations.
---

# Update Guide

## Outcome

The targeted guide is updated consistently across all files it touches. No dangling references, no stale translations.

## Discovery

1. **Which guide?** — ask for the guide `id` or title. If unclear, offer to list existing guides.
2. **What changes?** — ask what the user wants to update:
   - Markdown content (EN, FR, or both)
   - Metadata (`difficulty`, `tags`, `categoryKey`)
   - i18n title or description (EN, FR, or both)

Read the current state of affected files before proposing changes.

### Listing existing guides

If needed, read `packages/parcels/learn/src/data/learn.ts` and display a table:

| id  | categoryKey | difficulty | tags |
| --- | ----------- | ---------- | ---- |
| …   | …           | …          | …    |

## Steps

Execute only the steps relevant to the requested changes.

### Content update (markdown)

- For EN: edit `packages/parcels/learn/src/data/content/{categoryKey}/{id}.en.md`
- For FR: edit `packages/parcels/learn/src/data/content/{categoryKey}/{id}.fr.md`

If the user asks for a content update but only provides one language, offer to translate/adapt the other.

Keep the existing structure (headings, sections) unless the user asks to reorganize.

### Metadata update (difficulty, tags, categoryKey)

Edit the matching entry in `packages/parcels/learn/src/data/learn.ts`.

If `categoryKey` changes:

- Move markdown files to the new category folder (`git mv`)
- Update the import paths in `learn.ts`
- If the old category becomes empty, remove it from `CATEGORY_KEYS` and both i18n files

If a new `categoryKey` is introduced:

- Add to `CATEGORY_KEYS`
- Add label to `en.json` and `fr.json` under `"categories"`

### i18n update (title or description)

- EN: edit under `"items"."{id}"` in `packages/parcels/learn/src/i18n/locales/en.json`
- FR: edit under `"items"."{id}"` in `packages/parcels/learn/src/i18n/locales/fr.json`

### Changeset

Always create a changeset for any update:

File: `.changeset/update-learn-{id}.md` (if a file with that name already exists, append a short suffix like `-content` or `-metadata`)

```md
---
'@grasdouble/slm_parcel_learn': patch
---

fix: update "{title}" guide — {brief description of change}.
```

Use `minor` instead of `patch` if new content sections are added.

### Confirm

Summarize what changed (files edited, fields updated). Remind the user to run `pnpm build` from the `learn` package.
