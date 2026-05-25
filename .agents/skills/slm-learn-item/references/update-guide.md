---
name: update-guide
description: Capability for updating an existing learn guide — content, frontmatter metadata, or translations.
---

# Update Guide

## Outcome

The targeted guide is updated consistently across all files it touches. No stale translations or mismatched frontmatter.

## Discovery

1. **Which guide?** — ask for the guide `id` or title. If unclear, offer to list existing guides by scanning `content/` folders.
2. **What changes?** — ask what the user wants to update:
   - Markdown content (EN, FR, or both)
   - Frontmatter metadata (`difficulty`, `tags`)
   - i18n title or description (EN, FR, or both)
   - Move to a different catalog or category

Read the current state of affected files before proposing changes.

### Listing existing guides

If needed, list the files under `packages/parcels/learn/src/data/content/` and display a table:

| id  | categoryKey | catalogId | difficulty | tags |
| --- | ----------- | --------- | ---------- | ---- |
| …   | …           | …         | …          | …    |

## Steps

Execute only the steps relevant to the requested changes.

### Content update (markdown)

- For EN: edit `packages/parcels/learn/src/data/content/{categoryKey}/{catalogId}/{id}.en.md` (body only, below the `---` frontmatter block)
- For FR: edit `packages/parcels/learn/src/data/content/{categoryKey}/{catalogId}/{id}.fr.md`

If the user asks for a content update but only provides one language, offer to translate/adapt the other.

Keep the existing structure (headings, sections) unless the user asks to reorganize.

### Frontmatter metadata update (difficulty, tags)

Edit the frontmatter block at the top of **both** `.en.md` and `.fr.md` files:

```md
---
difficulty: { new_difficulty }
tags: [{ new_tags }]
---
```

Both language files must always have identical frontmatter.

### Move to a different catalog or category

- Use `git mv` to move both markdown files to the new path: `content/{new_categoryKey}/{new_catalogId}/{id}.{lang}.md`
- If `categoryKey` changed and the new one is not yet in `CATEGORY_KEYS`, add it to `learn.ts` and both i18n files
- If the old category folder is now empty, remove it from `CATEGORY_KEYS` and both i18n files

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

> **Dev-time integrity** — in development, `learn.ts` logs a warning if a guide's `categoryKey` (derived from its folder) is not listed in `CATEGORY_KEYS`. If that warning appears after a move, add the new category to `CATEGORY_KEYS` and both i18n files.
