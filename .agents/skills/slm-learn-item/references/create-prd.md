---
name: create-prd
description: Capability for authoring a structured catalog PRD markdown file that can later be consumed by the create-catalog-from-prd workflow.
---

# Create PRD

## Language

- Communicate with the user in French (or match `{communication_language}`)
- **The PRD content is always written in English** — titles, objectives, sub-sections, and guide titles must all be in English regardless of the user's communication language

## Outcome

A structured PRD markdown file saved to `packages/parcels/learn/prd/{filename}.md`, formatted exactly for the `create-catalog-from-prd` workflow. The file is validated by `parse-prd-import.py` before it is written.

> ⚠️ The PRD is a planning artifact — no changeset is created.

## PRD Format Reference

```
# Catalog N — Title

> Objective: 1–2 sentences describing what the learner will achieve.

## Beginner Level

### Sub-section Title

1. Guide title
2. Guide title

## Intermediate Level

### Sub-section Title

3. Guide title

## Advanced Level

### Sub-section Title

4. Guide title
```

**Numbering rules:**

- Guide numbers are **continuous within each catalog** (1, 2, 3… regardless of level boundaries)
- Numbers restart at 1 for each new catalog (`# Catalog N+1`)
- Never restart numbering per difficulty level or per sub-section

## Discovery

Gather these fields before generating any content. If the user has already provided them, skip those questions.

### 1. Filename

Propose a descriptive PascalCase filename derived from the topic (e.g., `Frontend_Architecture_Catalog.md`). Ask the user to confirm or override.

Check whether the file already exists at `packages/parcels/learn/prd/{filename}.md`. If it does, warn the user and ask to confirm overwrite or provide a different name.

### 2. Category key

Ask which `categoryKey` the catalogs belong to (e.g., `ia-llm`, `tooling`, `architecture`). This is required — it is used for parser validation.

If the user is unsure, show the list of existing categories from the `SKILL.md` codebase conventions table.

### 3. Structure intake

Present this template and ask the user to fill it in, one catalog at a time or all at once:

```
# Catalog 1 — [Title]

> Objective: [1–2 sentences]

## Beginner Level

### [Sub-section]

1. [Guide title]
2. [Guide title]

## Intermediate Level

### [Sub-section]

3. [Guide title]

## Advanced Level

### [Sub-section]

4. [Guide title]

# Catalog 2 — [Title]
...
```

> ℹ️ Sub-sections (`###`) are optional — omit them if the level has only one logical group.  
> ⚠️ Guide numbering must be continuous within each catalog. Don't restart at 1 for each difficulty level.

**If the user has no outline yet:** offer to generate a skeleton based on the topic and catalog count. Only use this fallback when explicitly requested. If accepted, generate skeletal titles (e.g., "Introduction to X", "Core concepts of Y") and require the user to review and confirm/edit before treating them as final.

**Accepted intake formats:**

- Properly formatted markdown (paste directly)
- Rough list ("3 beginner guides on X, 2 intermediate on Y…") — reformat into PRD markdown
- Natural language description per catalog — extract and reformat

## Normalization

Before validation, apply these rules to the content gathered from the user:

- **Enforce English headings** — replace any French headings (`# Catalogue`, `## Niveau Débutant`, `> Objectif :`, etc.) with their English equivalents
- Ensure guide numbers are continuous per catalog — if gaps or restarts are detected, renumber automatically and flag the change in the checkpoint
- Remove trailing punctuation from guide titles (the parser uses titles as IDs; trailing periods or question marks affect slugification)
- Trim extra whitespace

## Validation Loop

**Do not write the file until it passes validation.** Run the parser on a temporary in-memory representation by writing to a temp path and running:

```bash
python3 {skill-root}/scripts/parse-prd-import.py packages/parcels/learn/prd/{filename}.md --category {categoryKey}
```

> Since we must write before parsing, use this two-phase approach:
>
> 1. Write the file to `packages/parcels/learn/prd/{filename}.md`
> 2. Run the parser
> 3. If `validation.errors` is non-empty → show errors, collect fixes, rewrite, re-run
> 4. Repeat until clean or the user aborts

**If the parser reports errors (`validation.errors`):**

- Show them clearly
- Allow targeted fixes per catalog or section (the user does not need to re-enter the whole PRD)
- Rewrite the file with the fixes and re-run the parser
- Repeat until `validation.errors` is empty

**Warnings (`validation.warnings`)** are non-blocking — note them in the final summary.

## Checkpoint

Before the first write, present a compact checkpoint:

### Compact manifest

Show a table of the catalogs derived from the user's input:

| Catalog (title)    | Filename                         | Guides | Beginner / Intermediate / Advanced |
| ------------------ | -------------------------------- | ------ | ---------------------------------- |
| Understanding LLMs | `AI_and_LLM_Training_Catalog.md` | 29     | 15 / 7 / 7                         |
| …                  | …                                | …      | …                                  |

> "Je vais générer ce PRD. Confirme ou corrige avant que j'écrive le fichier."

Offer to show the full PRD markdown content on request before confirming.

### One correction round

If the user requests changes at the checkpoint, apply them and re-show the compact manifest. Only one checkpoint round before writing.

## Steps

### 1. Write the PRD file

File: `packages/parcels/learn/prd/{filename}.md`

Write the fully formatted PRD markdown content. Ensure:

- Correct language headings throughout
- Continuous guide numbering per catalog
- All `> Objective:` / `> Objectif :` blocks present

### 2. Run parser validation

```bash
python3 {skill-root}/scripts/parse-prd-import.py packages/parcels/learn/prd/{filename}.md --category {categoryKey}
```

- If errors: enter correction loop (see "Validation Loop" above)
- When `validation.errors` is empty, proceed

### 3. Confirm

Summarize the result:

- PRD file: `packages/parcels/learn/prd/{filename}.md`
- Catalogs: N (list titles)
- Total guides: M (breakdown per catalog: title — X guides)
- Any warnings from validation (note as backlog)

> **Next step:** use `create catalogs from prd [file path]` to scaffold the catalog and guide stubs from this PRD.

If `{workflow.on_complete}` is non-empty, execute it after confirming.

## Constraints

- **PRD content is always in English** — headings, titles, objectives, and guide names must be English; if the user provides content in French, translate it before writing
- Guide numbers must be contiguous within each catalog — never restart per level
- Each catalog must have an `> Objective:` / `> Objectif :` block — the parser treats a missing objective as an error
- Guide titles should not have trailing periods (affects slugification)
- File must exist at the standard path `packages/parcels/learn/prd/{filename}.md` — do not place PRD files elsewhere
- The agent must never suggest guide titles as defaults — only as explicit fallback when the user requests ideation, and only with required user confirmation

## Mode

This workflow operates in **Guided mode** — Yolo and Headless detection do not apply here.

A checkpoint is mandatory before writing the file. Parser validation is mandatory before the workflow is considered complete.
