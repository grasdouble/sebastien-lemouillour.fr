---
name: update-guide
description: Capability for updating an existing learn guide — content, frontmatter metadata, or translations.
---

# Update Guide

## Language

- Communicate with the user in French (or match `{communication_language}`)
- Write EN markdown content and EN i18n strings in English
- Write FR markdown content and FR i18n strings in French

## Outcome

The targeted guide is updated consistently across all files it touches. No stale translations or mismatched frontmatter.

## Discovery

1. **Which guide?** — ask for the guide `id` or title. If unclear, run the **inventory snapshot** from SKILL.md and display the result as a table.
2. **What changes?** — ask what the user wants to update:
   - Markdown content (EN, FR, or both)
   - Frontmatter metadata (`difficulty`, `tags`)
   - i18n title or description (EN, FR, or both)
   - Move to a different catalog or category

Read the current state of affected files before proposing changes.

## Assumption Policy

When the user's input is partial or contains apparent contradictions:

**Safe to assume** (state the assumption, proceed):

- Missing language scope when the user describes a content change → assume both EN and FR, mention it
- Missing verbosity preference for the Confirm summary
- `difficulty` when content clearly targets a specific audience → infer from content and state the inference

**Unsafe to assume** (stop and ask):

- Guide `id` or target file path — never invent or guess
- Catalog or category destination for a move — always confirm
- Order changes that would affect sibling guides in the same catalog
- Language scope for a destructive change (deletion, full rewrite)

**Conflicting input** (e.g. "update difficulty to beginner" while content clearly targets advanced readers): flag the conflict, propose a resolution, wait for confirmation before editing.

**Unresolvable conflict** (e.g. guide `id` not found, catalog does not exist): stop immediately and ask. Never create a missing guide or catalog as a side-effect.

Log every assumption — safe or otherwise — in the Confirm step.

## Soft Checkpoint

Before applying any change, present a one-message scope summary:

> "Je vais modifier [what] dans [id]. [Assumptions: …] Autres ajustements ?"

**Per mode:**

- **Guided:** mandatory — wait for explicit confirmation or corrections
- **Yolo:** mandatory — allow one correction exchange, then execute
- **Headless:** skip prompt; include the planned scope in the structured output's `planned_changes` field

### Listing existing guides

If needed, run the **inventory snapshot** from SKILL.md and display the result as:

| id  | categoryKey | catalogId | difficulty | order |
| --- | ----------- | --------- | ---------- | ----- |
| …   | …           | …         | …          | …     |

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

**EN and FR must match in voice:** same opinions, stance, and personality — not just structure. FR is not a reduced version; translate the narrative including the lightness.

## Steps

Execute only the steps relevant to the requested changes.

### Content update (markdown)

- For EN: edit `packages/parcels/learn/src/data/content/{categoryKey}/{catalogId}/{id}.en.md` (body only, below the `---` frontmatter block)
- For FR: edit `packages/parcels/learn/src/data/content/{categoryKey}/{catalogId}/{id}.fr.md`
- **Always update `updatedAt`** in the frontmatter of both files to today's date in UTC (`YYYY-MM-DD`). Never change `publishedAt`.

If the user asks for a content update but only provides one language, offer to translate/adapt the other.

Keep the existing structure (headings, sections) unless the user asks to reorganize.

**Write for the target persona**:

- `beginner` → Découvreur: analogies, define every term on first use, explicit limits. ✅ End with "what next" path. ❌ No unexplained code blocks.
- `intermediate` → Développeur: working code with commented parameters, mention costs/rate limits/security. ❌ No purely theoretical content.
- `advanced` → Architecte: tradeoffs, observability, production patterns, SLAs. ❌ Don't explain basics.

**Every guide must tell a story**: open with a concrete pain, transition between every major section, set context before every code block, close with a real takeaway. Both EN and FR must have the same narrative richness.

**Content must be project-agnostic**: no references to any specific codebase, internal tooling, or organizational setup. Use generic names. Any reader on any project must be able to follow the guide.

**Back every significant claim with an official documentation link**: add inline links to primary sources (provider docs, tool websites, specs, papers). Each URL must appear **at most once** per guide — link it the first time; refer to the name elsewhere. If multiple references apply, add a `## Resources` section at the end.

**Keep external links in the 3–7 range per guide**: fewer than 3 leaves key claims unsupported and weakens SEO authority signals; more than 7 dilutes link equity and risks being flagged as over-linked. Hard cap: 10. Count all external links across body and Resources section together. When adding links would exceed the cap, consolidate into the `## Resources` section instead of adding more inline links.

**Verify before writing**: check API shapes, configuration option names, and defaults against official docs. Mention the version when behavior is version-specific.

### Frontmatter metadata update (difficulty, tags, order)

Edit the frontmatter block at the top of **both** `.en.md` and `.fr.md` files:

```md
---
id: { id }
order: { new_order }
difficulty: { new_difficulty }
tags: [{ new_tags }]
publishedAt: { unchanged — do not modify }
updatedAt: { YYYY-MM-DD — today's date in UTC }
---
```

Both language files must always have identical frontmatter. When changing `order`, verify that other guides in the same catalog don't have conflicting order values.

### Move to a different catalog or category

- Move both markdown files to the new path using your file tools (read old file, create at new path, delete old file): `content/{new_categoryKey}/{new_catalogId}/{id}.{lang}.md`
- Do **not** use `git mv` — it stages files automatically, which conflicts with the no-staging rule. Git state management (staging, committing) is the user's responsibility.
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

Summarize what changed (files edited, fields updated, `updatedAt` refreshed to today's UTC date). Remind the user to run `pnpm build` from the `learn` package.

If `{workflow.on_complete}` is non-empty, execute it after confirming.

> **Dev-time integrity** — in development, `learn.ts` logs a warning if a guide's `categoryKey` (derived from its folder) is not listed in `CATEGORY_KEYS`. If that warning appears after a move, add the new category to `CATEGORY_KEYS` and both i18n files.
