---
name: create-guide
description: Capability for creating a new learn guide — all files, i18n and data entry.
---

# Create Guide

## Outcome

All files for a new guide exist and are wired up: two markdown files, one data entry in `learn.ts`, and i18n keys in both locale files. The user can run the build and the guide appears in the app.

## Discovery

Gather these before writing anything. If the user has already provided some, skip those questions:

1. **Topic** — what is the guide about?
2. **`id`** — propose a kebab-case id from the topic (e.g. `react-query-basics`). Confirm with user.
3. **`categoryKey`** — one of `ia-llm`, `tooling`, `architecture`. If none fits, propose a new one (kebab-case) and confirm.
4. **`difficulty`** — `beginner`, `intermediate`, or `advanced`. Infer from topic if obvious, confirm.
5. **`tags`** — 2–5 tags. PascalCase for proper nouns/tools (React, Vite, TypeScript), lowercase for concepts (monorepo, performance).
6. **Title** — EN and FR versions (short, descriptive).
7. **Description** — EN and FR (1–2 sentences, no trailing period).
8. **Content** — ask if the user wants to:
   a. Provide their own content (paste or describe)
   b. Have the agent draft it based on the topic and difficulty

If drafting content, write substantive markdown — introduction, key concepts, practical examples, code blocks where relevant. Aim for ~400–800 words per language. Mirror structure between EN and FR — same sections, same examples, translated.

## Steps

Execute all steps. Do not stop between them.

### 1. Create EN markdown file

Path: `packages/parcels/learn/src/data/content/{categoryKey}/{id}.en.md`

Content: well-structured markdown with `#` title, sections, code blocks if relevant.

### 2. Create FR markdown file

Path: `packages/parcels/learn/src/data/content/{categoryKey}/{id}.fr.md`

Content: same structure as EN, fully translated to French.

### 3. Update `learn.ts`

File: `packages/parcels/learn/src/data/learn.ts`

Add two import lines (after the existing imports for the same category, or at the end of the imports block):

```ts
import {id}En from './content/{categoryKey}/{id}.en.md?raw';
import {id}Fr from './content/{categoryKey}/{id}.fr.md?raw';
```

Convert `id` to camelCase for variable names (e.g. `react-query-basics` → `reactQueryBasicsEn`).

Add entry to `RAW_LEARN_ITEMS` array (preserve logical grouping by category if possible):

```ts
{
  id: '{id}',
  categoryKey: '{categoryKey}',
  difficulty: '{difficulty}',
  tags: [{tags}],
  content: { fr: {id}Fr, en: {id}En },
},
```

If `{categoryKey}` is new, also add it to `CATEGORY_KEYS`:

```ts
export const CATEGORY_KEYS: readonly string[] = ['ia-llm', 'tooling', 'architecture', '{categoryKey}'];
```

### 4. Update `en.json`

File: `packages/parcels/learn/src/i18n/locales/en.json`

Add under `"items"`:

```json
"{id}": {
  "title": "{title_en}",
  "description": "{description_en}"
}
```

If new category: add under `"categories"`:

```json
"{categoryKey}": "{category_label_en}"
```

### 5. Update `fr.json`

File: `packages/parcels/learn/src/i18n/locales/fr.json`

Add under `"items"`:

```json
"{id}": {
  "title": "{title_fr}",
  "description": "{description_fr}"
}
```

If new category: add under `"categories"`:

```json
"{categoryKey}": "{category_label_fr}"
```

### 6. Create changeset

File: `.changeset/add-learn-{id}.md`

```md
---
'@grasdouble/slm_parcel_learn': minor
---

feat: add "{title_en}" guide to the learn parcel.
```

### 7. Confirm

Summarize what was created:

- Files created (list paths)
- Entry added to `RAW_LEARN_ITEMS`
- i18n keys added (both locales)
- Changeset created

Remind the user to run `pnpm build` from the `learn` package to validate.
