---
name: create-guide
description: Capability for creating a new learn guide — markdown files with frontmatter, i18n keys.
---

# Create Guide

## Outcome

All files for a new guide exist and are wired up: two markdown files (with frontmatter), i18n keys in both locale files. The guide is auto-discovered by `learn.ts` from its file path and appears in the catalog matching its parent folder.

> ⚠️ **Do not edit `learn.ts`** — guides are auto-discovered via `import.meta.glob`. The catalog membership is determined by the folder the file is placed in.

## Discovery

Gather these before writing anything. If the user has already provided some, skip those questions:

1. **Topic** — what is the guide about?
2. **`id`** — propose a kebab-case id from the topic (e.g. `react-query-basics`). Confirm with user.
3. **`categoryKey`** — one of `ia-llm`, `tooling`, `architecture`. If none fits, propose a new one (kebab-case) and confirm.
4. **`catalogId`** — which existing catalog should this guide belong to? List the existing catalogs. If none fits, propose creating a new one (load `./references/create-catalog.md` first).
5. **`difficulty`** — `beginner`, `intermediate`, or `advanced`. Infer from topic if obvious, confirm. Use the persona definitions in `SKILL.md` (section "Difficulty guidance — Personas") to choose the right level and write content for the correct audience.
6. **`order`** — integer position within the catalog (e.g. `1`, `2`, `3`…). Check existing guides in the catalog to determine the right position. Guides are displayed in ascending order within a catalog. **Always set this** — guides without `order` fall to the end.
7. **`tags`** — 2–5 tags. PascalCase for proper nouns/tools (`React`, `Vite`, `TypeScript`), lowercase for concepts (`monorepo`, `performance`).
8. **Title** — EN and FR versions (short, descriptive).
9. **Description** — EN and FR (1–2 sentences, no trailing period).
10. **Content** — ask if the user wants to:
    a. Provide their own content (paste or describe)
    b. Have the agent draft it based on the topic and difficulty

If drafting content, write substantive markdown — introduction, key concepts, practical examples, code blocks where relevant. Aim for ~400–800 words per language. Mirror structure between EN and FR — same sections, same examples, translated.

**Every guide must tell a story** (see "Narrative Writing" in `SKILL.md`): open with a concrete pain the reader recognizes, introduce each concept as the answer to the previous problem, add a transition sentence before every code block, and close with a real takeaway — not a summary. Both EN and FR must have the same narrative richness.

**Always write for the target persona** (see "Difficulty guidance — Personas" in `SKILL.md`):

- `beginner` → Découvreur: analogies, plain language, explicit limitations, path to next guides
- `intermediate` → Développeur: working code examples with commented parameters, practical patterns
- `advanced` → Architecte: tradeoffs, security, production patterns, no hand-holding on basics

## Steps

Execute all steps. Do not stop between them.

### 1. Create EN markdown file

Path: `packages/parcels/learn/src/data/content/{categoryKey}/{catalogId}/{id}.en.md`

Start with the frontmatter block, then the guide content:

```md
---
id: { id }
order: { order }
difficulty: { difficulty }
tags: [{ tags }]
---

## ...
```

### 2. Create FR markdown file

Path: `packages/parcels/learn/src/data/content/{categoryKey}/{catalogId}/{id}.fr.md`

Same frontmatter and structure as EN, fully translated to French.

### 3. Update `en.json`

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

### 4. Update `fr.json`

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

If new category: also add it to `CATEGORY_KEYS` in `packages/parcels/learn/src/data/learn.ts`.

### 5. Create changeset

File: `.changeset/add-learn-{id}.md`

```md
---
'@grasdouble/slm_parcel_learn': minor
---

feat: add "{title_en}" guide to the learn parcel.
```

### 6. Confirm

Summarize what was created:

- Files created (list paths)
- Frontmatter: difficulty + tags
- Guide auto-registered in catalog `{catalogId}` via file path
- i18n keys added (both locales)
- Changeset created

Remind the user to run `pnpm build` from the `learn` package to validate.

> **Dev-time integrity** — in development, `learn.ts` logs a warning if a guide's `categoryKey` is not listed in `CATEGORY_KEYS`. If that warning appears, add the category to `CATEGORY_KEYS` and both i18n files.
