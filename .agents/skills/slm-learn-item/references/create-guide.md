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

**Run the inventory snapshot from SKILL.md first.** Use its JSON output to answer without re-scanning:

- **Step 3** (`categoryKey` / `catalogId`): list catalogs grouped by `categoryKey` from the snapshot
- **Step 6** (`order`): find the max `order` among guides in the target catalog, then propose `max + 1` as the default (or `1` if the catalog is empty)

1. **Topic** — what is the guide about?
2. **`id`** — propose a kebab-case id from the topic (e.g. `react-query-basics`). Confirm with user.
3. **`categoryKey`** — one of `ia-llm`, `tooling`, `architecture`. If none fits, propose a new one (kebab-case) and confirm.
4. **`catalogId`** — which existing catalog should this guide belong to? List the existing catalogs. If none fits, propose creating a new one (load `references/create-catalog.md` first).
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

**Every guide must tell a story**: open with a concrete pain the reader recognizes, introduce each concept as the answer to the previous problem, add a transition sentence before every code block, and close with a real takeaway — not a summary. Both EN and FR must have the same narrative richness.

**Always write for the target persona**:

- `beginner` → Découvreur: analogies, plain language, explicit limitations, path to next guides
- `intermediate` → Développeur: working code examples with commented parameters, practical patterns
- `advanced` → Architecte: tradeoffs, security, production patterns, no hand-holding on basics

**Content must be project-agnostic**: no references to any specific codebase, internal tooling, or organizational setup. Use generic names (`@my/shared`, `my-app`). Any reader on any project must be able to follow the guide.

**Back every significant claim with an official documentation link**: add inline links to primary sources (provider docs, tool websites, specs, papers). Each URL must appear **at most once** per guide — link it the first time it appears; refer to the name elsewhere. If multiple references apply, add a `## Resources` section at the end.

**Keep external links in the 3–7 range per guide**: fewer than 3 leaves key claims unsupported and weakens SEO authority signals; more than 7 dilutes link equity and risks being flagged as over-linked. Hard cap: 10. When you'd exceed the cap, consolidate into a `## Resources` section rather than adding more inline links. Count all external links across the guide body and the Resources section together.

**Verify before writing**: check API shapes, configuration option names, and defaults against official docs. Mention the version when behavior is version-specific.

## Voice

These guides live on Sébastien's personal site. They must sound like a developer with opinions, not a system following a template.

**Write with a point of view:**

- ✅ State what you would choose and why ("I'd start with X every time unless…")
- ✅ Acknowledge what's genuinely tricky ("This is the part that confused me")
- ✅ Allow light humor or informal asides
- ❌ Never be a neutral narrator — neutral is forgettable
- ❌ Never list options without saying which one you'd actually pick

**Antipatterns — ban these in all guide content:**

- ❌ `—` (em dash surrounded by spaces) in prose — use a comma, colon, or restructure
- ❌ "straightforward", "Let's dive in", "In conclusion", "It's worth noting that"
- ❌ Mechanical transitions ("Now that X is clear, let's move to Y")
- ❌ Closing sentences that echo the intro or summarize what was covered
- ❌ Perfect symmetry between sections (same length, rhythm, structure)

**EN and FR must match in voice:** same opinions, stance, and personality — not just the same structure. FR is not a reduced version; translate the narrative including the lightness.

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
