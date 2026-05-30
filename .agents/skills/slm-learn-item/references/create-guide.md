---
name: create-guide
description: Capability for creating a new learn guide — markdown files with frontmatter, i18n keys.
---

# Create Guide

## Language

- Communicate with the user in French (or match `{communication_language}`)
- Write EN markdown content and EN i18n strings in English
- Write FR markdown content and FR i18n strings in French

## Outcome

All files for a new guide exist and are wired up: two markdown files (with frontmatter), i18n keys in both locale files. The guide is auto-discovered by `learn.ts` from its file path and appears in the catalog matching its parent folder.

> ⚠️ **Do not edit `learn.ts`** — guides are auto-discovered via `import.meta.glob`. The catalog membership is determined by the folder the file is placed in.

## Discovery

**First-timer orientation:** If the user's message is exploratory ("I'd like to write a guide", "je veux créer un article learn") without a clear topic — open the floor before collecting any schema field:

> "Super ! Dis-moi sur quoi tu veux écrire. Je vais te poser quelques questions ensuite pour placer le guide dans le bon catalogue et définir sa structure."

Then proceed to the normal discovery flow once the topic is established.

Gather these before writing anything. If the user has already provided some, skip those questions.

**Yolo quick-intake:** If the user's message already contains a clear topic, target catalog (or enough context to infer it), and at least 3 additional fields from the list below — skip the step-by-step discovery. Jump directly to the Soft Checkpoint with all inferred fields pre-filled.

**Headless input schema** (structured payload, no conversational wrapper):

```json
{
  "topic": "string (required)",
  "id": "string (optional — kebab-case proposed if missing)",
  "categoryKey": "string (optional — required if catalogId is ambiguous)",
  "catalogId": "string (optional — required if not inferable from topic)",
  "difficulty": "beginner|intermediate|advanced (optional — inferred from topic, fallback: intermediate)",
  "order": "integer (optional — defaults to max+1 within catalog, or 1 if empty)",
  "tags": ["string"],
  "title": { "en": "string", "fr": "string" },
  "description": { "en": "string", "fr": "string" },
  "content": "string (optional — drafted if missing)"
}
```

In Headless mode, never prompt. Log all assumptions in the `assumptions` field of the confirmation output.

**Headless return contract** (always return this JSON object — no prose, no markdown outside the schema):

```json
{
  "status": "created" | "blocked" | "dry_run",
  "id": "<guide-id>",
  "categoryKey": "<string>",
  "catalogId": "<string>",
  "files_created": ["<relative-path>"],
  "changeset": "<relative-path>",
  "assumptions": ["<assumption made>"],
  "error": "<message if status is blocked, else null>"
}
```

`dry_run` is returned when the payload includes `"dryRun": true` — no files are written. `blocked` is returned when a pre-pass failure or conflict prevents safe execution.

**Run the inventory snapshot first.** Use its JSON output to answer without re-scanning:

```bash
python3 {skill-root}/scripts/inventory-snapshot.py
```

- **Step 3** (`categoryKey` / `catalogId`): list catalogs grouped by `categoryKey` from the snapshot
- **Step 6** (`order`): find the max `order` among guides in the target catalog, then propose `max + 1` as the default (or `1` if the catalog is empty)

1. **Topic** — what is the guide about?
2. **`id`** — propose a kebab-case id from the topic (e.g. `react-query-basics`). Confirm with user.
3. **`categoryKey`** — one of `ia-llm`, `tooling`, `architecture`. If none fits, propose a new one (kebab-case) and confirm.
4. **`catalogId`** — which existing catalog should this guide belong to? List the existing catalogs. If none fits, propose creating a new one (load `{workflow.ref_create_catalog}` first).
5. **`difficulty`** — `beginner`, `intermediate`, or `advanced`. Infer from topic if obvious, confirm.
   - `beginner` → Découvreur: analogies, define every term on first use, explicit limits. ✅ End with "what next" path. ❌ No unexplained code blocks.
   - `intermediate` → Développeur: working code with commented parameters, mention costs/rate limits/security. ❌ No purely theoretical content.
   - `advanced` → Architecte: tradeoffs, observability, production patterns, SLAs. ❌ Don't explain basics (tokens, temperature).
6. **`order`** — integer position within the catalog (e.g. `1`, `2`, `3`…). Check existing guides in the catalog to determine the right position. Guides are displayed in ascending order within a catalog. **Always set this** — guides without `order` fall to the end.
7. **`tags`** — 2–5 tags. PascalCase for proper nouns/tools (`React`, `Vite`, `TypeScript`), lowercase for concepts (`monorepo`, `performance`).
8. **Title** — EN and FR versions (short, descriptive).
9. **Description** — EN and FR (1–2 sentences, no trailing period).
10. **Content** — ask if the user wants to:
    a. Provide their own content (paste or describe)
    b. Have the agent draft it based on the topic and difficulty

If drafting content, write substantive markdown — introduction, key concepts, practical examples, code blocks where relevant. Aim for ~400–800 words per language. Mirror structure between EN and FR — same sections, same examples, translated.

> **Load both asset files before drafting:**
>
> - `{skill-root}/assets/content-quality-rules.md` — narrative arc, persona alignment, project-agnosticism, official documentation links, link anchor text
> - `{skill-root}/assets/voice-rules.md` — point of view, opening rule, tone calibration by difficulty, antipatterns, reformulation examples
>
> Apply all rules from both files without exception.

## Soft Checkpoint

Before writing any file, present a one-message summary of all gathered or inferred fields:

> "Je vais créer `{id}` dans `{catalogId}` / `{categoryKey}`, difficulté `{difficulty}`, order `{order}`, tags `{tags}`. [Assumptions: …] Tu peux ajouter des contraintes ou confirmer pour démarrer."

**Per mode:**

- **Guided:** mandatory — wait for explicit confirmation or corrections before proceeding
- **Yolo:** mandatory — present summary, allow one correction exchange, then execute
- **Headless:** skip prompt; if the payload includes `"dryRun": true`, return the planned-action summary as JSON and stop without writing any file

If the user adds a constraint at this point, update the inferred fields and show the summary once more.

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
publishedAt: { YYYY-MM-DD — today's date in UTC }
updatedAt: { YYYY-MM-DD — same as publishedAt }
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
- Frontmatter: difficulty, tags, `publishedAt` and `updatedAt` both set to today's UTC date
- Guide auto-registered in catalog `{catalogId}` via file path
- i18n keys added (both locales)
- Changeset created

Remind the user to run `pnpm build` from the `learn` package to validate.

If `{workflow.on_complete}` is non-empty, execute it after confirming.

> **Dev-time integrity** — in development, `learn.ts` logs a warning if a guide's `categoryKey` is not listed in `CATEGORY_KEYS`. If that warning appears, add the category to `CATEGORY_KEYS` and both i18n files.
