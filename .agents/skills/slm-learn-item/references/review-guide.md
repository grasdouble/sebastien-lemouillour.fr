---
name: review-guide
description: Capability for reviewing one or more existing learn guides — factual accuracy, voice compliance, project-agnosticism, and official documentation links.
---

# Review Guide

## Language

- Communicate with the user in French (or match `{communication_language}`)
- Write EN markdown content and EN i18n strings in English
- Write FR markdown content and FR i18n strings in French

## Outcome

Each reviewed guide is factually accurate, fully project-agnostic, backed by official documentation links (each URL at most once per guide), and compliant with the voice rules. Both EN and FR files are updated consistently.

## Discovery

1. **Which guide(s)?** — ask for guide `id`(s) or titles. If the user says "all guides", run the **inventory snapshot** from SKILL.md to enumerate every guide — do not scan folders manually.
2. **Scope** — clarify what to review (default: everything):
   - Factual accuracy against official documentation
   - Voice compliance (em-dash, mechanical transitions, narrative arc…)
   - Project-agnosticism (no repo-specific references)
   - Official documentation links (present, correct, each URL at most once)

If more than one guide is in scope, use sub-agents (see the batch orchestration in the Steps section below).

## Review checklist

For each guide, verify:

### Factual accuracy

- [ ] All technical claims match official documentation as of today
- [ ] API shapes, configuration options, and defaults are current
- [ ] Deprecated features or packages are flagged as such
- [ ] No common misconceptions repeated as facts

### Official documentation

- [ ] Every significant technical claim has an inline link to its primary source
- [ ] Each URL appears **at most once** in the guide — first occurrence gets the link, subsequent references use the name only
- [ ] Sources are official (provider docs, tool websites, specs, seminal papers) — not blog posts or secondary sources
- [ ] External link count (body + Resources section combined) is **between 3 and 7** — flag as under-linked if fewer than 3, over-linked if more than 7, and reject if more than 10
- [ ] A `## Resources` section exists at the end **only** when it lists sources not already linked inline — e.g. foundational papers, additional reading, or a consolidated reference list
- [ ] The `## Resources` section contains **actual markdown links** (`[Name](url)` or `- [Name][ref]`) — a prose description of sources with no clickable links is not acceptable and must be replaced with real links or removed entirely
- [ ] Inline link anchor text is **concise** — it names the resource, feature, or key term (ideally ≤5 words). Never wrap a full sentence or a paraphrase of what the source says in a link. The cited claim stays as readable prose; the link sits only on the resource name.
  - ✅ `[OpenAI's evals guide](url) recommends tracking behavior as prompts change`
  - ✅ `temperature is documented in [Google's parameter guide](url) as a randomness control`
  - ✅ `[chain-of-thought paper](url)`
  - ❌ `[OpenAI recommends evals to track behavior as prompts and models change](url)`
  - ❌ `[Google documents temperature as a randomness control, notes that 0 is only mostly deterministic, and lists 1.0 as the default](url)`

### Project-agnosticism

- [ ] No references to any specific codebase, internal repo, or organizational setup
- [ ] Code examples use generic names (`@my/shared`, `my-app`, `my-package`)
- [ ] Any personal anecdote is framed around a universal experience, not internal specifics

### Dates

- [ ] `publishedAt` is present in both EN and FR frontmatter
- [ ] `updatedAt` is present in both EN and FR frontmatter
- [ ] Both values are valid ISO 8601 dates (`YYYY-MM-DD`)
- [ ] `updatedAt` is not older than `publishedAt`
- [ ] Both EN and FR files have identical `publishedAt` and `updatedAt` values

### Voice compliance

- [ ] No `—` (em dash with surrounding spaces) in prose
- [ ] No "straightforward", "Let's dive in", "In conclusion", "It's worth noting that"
- [ ] No mechanical section transitions ("Now that X is clear, let's move to Y")
- [ ] No closing sentence that echoes the intro or summarizes what was covered
- [ ] Opens with a concrete pain the reader recognizes
- [ ] Each concept introduced as the answer to the previous problem
- [ ] One natural transition sentence before every code block
- [ ] Closes with a decision rule, a caveat, or a threshold — not a summary

## Pre-pass — Structural validation

Run this command before any LLM review begins. It performs deterministic checks that the model should not re-derive by reading files.

```bash
python3 - <<'PYEOF'
import os, re, json

base = "packages/parcels/learn/src/data/content"
BANNED = [
    "straightforward", "Let's dive in", "In conclusion",
    "It's worth noting that", "Now that", "In summary",
]
DATE_RE = re.compile(r'^\d{4}-\d{2}-\d{2}$')
FM_FIELDS = ["id", "order", "difficulty", "publishedAt", "updatedAt"]
URL_RE = re.compile(r'https?://[^\s)\]"\']+')
issues = []

def parse_fm_and_body(path):
    content = open(path).read()
    parts = content.split('---', 2)
    if len(parts) < 3:
        return {}, content
    fm = {}
    for line in parts[1].split('\n'):
        idx = line.find(':')
        if idx != -1:
            k, v = line[:idx].strip(), line[idx+1:].strip()
            if k: fm[k] = v
    return fm, parts[2]

for cat in sorted(os.listdir(base)):
    cat_p = os.path.join(base, cat)
    if not os.path.isdir(cat_p): continue
    for catalog in sorted(os.listdir(cat_p)):
        clog_p = os.path.join(cat_p, catalog)
        if not os.path.isdir(clog_p): continue
        for f in sorted(os.listdir(clog_p)):
            if not f.endswith('.en.md'): continue
            gid = f.replace('.en.md', '')
            en_p = os.path.join(clog_p, f)
            fr_p = os.path.join(clog_p, gid + '.fr.md')

            if not os.path.exists(fr_p):
                issues.append({"id": gid, "type": "missing_fr_file"})
                continue

            en_fm, en_body = parse_fm_and_body(en_p)
            fr_fm, _ = parse_fm_and_body(fr_p)

            # Frontmatter parity (EN is authoritative)
            for key in FM_FIELDS:
                if en_fm.get(key) != fr_fm.get(key):
                    issues.append({"id": gid, "type": "fm_mismatch", "field": key,
                                   "en": en_fm.get(key), "fr": fr_fm.get(key)})

            # Date validity and ordering
            for fm, lang in [(en_fm, "en"), (fr_fm, "fr")]:
                for field in ["publishedAt", "updatedAt"]:
                    val = fm.get(field, "")
                    if not DATE_RE.match(val):
                        issues.append({"id": gid, "type": "invalid_date",
                                       "field": field, "lang": lang, "value": val})
                if fm.get("updatedAt", "9") < fm.get("publishedAt", "0"):
                    issues.append({"id": gid, "type": "updated_before_published", "lang": lang})

            # Duplicate URLs (EN body — source of truth for links)
            seen_urls, dupes = set(), []
            for url in URL_RE.findall(en_body):
                if url in seen_urls: dupes.append(url)
                seen_urls.add(url)
            if dupes:
                issues.append({"id": gid, "type": "duplicate_urls", "urls": list(set(dupes))})

            # Banned phrases (EN body only — phrase list is English-specific)
            for phrase in BANNED:
                if phrase in en_body:
                    issues.append({"id": gid, "type": "banned_phrase", "phrase": phrase})

print(json.dumps({"structural_issues": issues}, indent=2))
PYEOF
```

**Interpreting the output and acting on it:**

| `type`                     | Action                                                                             |
| -------------------------- | ---------------------------------------------------------------------------------- |
| `missing_fr_file`          | Create the FR file before reviewing; if not in scope, flag as error                |
| `fm_mismatch`              | Sync the FR frontmatter field to match EN (EN is authoritative)                    |
| `invalid_date`             | Correct the date to `YYYY-MM-DD` format                                            |
| `updated_before_published` | Set `updatedAt` ≥ `publishedAt`                                                    |
| `duplicate_urls`           | Keep only the first occurrence of each URL; replace subsequent ones with name only |
| `banned_phrase`            | Rewrite the affected sentence                                                      |

**Scope rule:** Fix only issues for guides in the current review scope. Report issues found in other guides as a warning in the final summary — they are backlog, not blockers for the current task.

**Escape hatch:** If a structural issue cannot be safely auto-fixed (e.g. `missing_fr_file` for a guide not in scope), include it in the `error` field of the sub-agent return instead of blocking the review.

## Steps

### Single guide

1. Read both `.en.md` and `.fr.md` files
2. Research the topic against official documentation (use web search)
3. Apply all corrections directly to both files
4. Run validation from `packages/parcels/learn`: `rtk pnpm lint && rtk pnpm build`
5. Report what changed

### Multiple guides (batch)

Apply these orchestration rules:

1. List all guides to review
2. **Pre-execution scope summary** — for reviews covering more than 3 guides (or any "review all" request), present a scope summary before launching any sub-agent:
   > "Je vais reviewer N guides : [list of ids]. Dimensions : [checklist items in scope]. Plan : [batch count] batch(es) de 4 sous-agents en parallèle. Confirme ou ajuste la liste."
   > Wait for explicit confirmation before launching sub-agents.
3. Launch sub-agents in batches of **4 in parallel** — exactly 4 per batch (or fewer if fewer remain); **1 sub-agent per guide, 1 guide per sub-agent**
4. Wait for the entire batch to complete before launching the next
5. Each sub-agent prompt must include: file paths, voice rules, content quality rules, constraints (`no git add/commit`), the validation command, and the **exact JSON schema from the Subagent return contract below** — instruct the sub-agent explicitly that it must return only that JSON object, no prose, no markdown outside the schema
6. After all batches: run `rtk pnpm lint && rtk pnpm typecheck && rtk pnpm build` from `packages/parcels/learn`
7. Report a summary of what each sub-agent changed

#### Subagent return contract

Every review sub-agent **ONLY** return a JSON object — no prose, no markdown, no explanations outside the schema. The parent agent will aggregate and format the output.

```json
{
  "id": "<guide-id>",
  "status": "changed" | "unchanged" | "error",
  "files_edited": ["<relative-path>", ...],
  "corrections": [
    { "type": "factual" | "voice" | "links" | "frontmatter" | "agnosticism", "description": "<one line>" }
  ],
  "validation": "pass" | "fail",
  "error": "<message if status is error, else null>"
}
```

If the sub-agent cannot complete the review (e.g. file not found, validation failure it cannot fix), it must set `status: "error"` and populate `error`. It must never return partial prose.

#### Graceful Degradation — Sequential Fallback

If sub-agents fail to launch (rate limit, environment constraint, or repeated sub-agent error):

1. Report immediately: "Sous-agents indisponibles — je traite les guides séquentiellement (1 à la fois)."
2. Process guides one at a time in the parent context using the same review checklist and corrections
3. **On partial batch failure** (some sub-agents succeeded, some failed): resume only from guides not yet completed — never re-review a guide that already returned `status: "changed"` or `status: "unchanged"`
4. Emit the same subagent return contract JSON for each guide processed in fallback
5. After sequential fallback, run the same final validation: `rtk pnpm lint && rtk pnpm typecheck && rtk pnpm build` from `packages/parcels/learn`

### Decision Log

After all batches complete (parallel or fallback), emit this compact JSON log **before** the human-readable summary. It enables resumability: a new session can pass `orderedTargets.slice(resumeFromIndex)` as its scope to continue from where the previous session left off.

```json
{
  "createdAt": "<ISO-8601 timestamp>",
  "intent": "review",
  "scope": ["<guide-id>", ...],
  "orderedTargets": ["<guide-id>", ...],
  "mode": "parallel-batch" | "sequential-fallback",
  "resumeFromIndex": "<0-based index of first target whose status is not done>",
  "results": [
    {
      "id": "<guide-id>",
      "status": "done" | "error" | "skipped",
      "filesEdited": ["<relative-path>", ...],
      "corrections": [{ "type": "...", "description": "..." }],
      "validation": "pass" | "fail" | null,
      "error": "<message if status is error, else null>"
    }
  ]
}
```

`orderedTargets` is the definitive ordered list of all guides that were in scope. `resumeFromIndex` is `results.length` when all guides completed, otherwise the index of the first non-`done` entry. Set `status: "skipped"` for guides that were not reached due to an interruption.

### Changeset

Create a changeset for any guide that was modified:

File: `.changeset/review-learn-{id}.md`

```md
---
'@grasdouble/slm_parcel_learn': patch
---

fix: review "{title}" guide — factual accuracy, voice, and official doc links.
```

If multiple guides were reviewed in one pass, group them in a single changeset:

```md
---
'@grasdouble/slm_parcel_learn': patch
---

fix: review all learn guides — factual accuracy, voice, and official doc links.
```

### Confirm

Summarize per guide:

- What was corrected (factual errors, voice issues, missing links)
- Whether both EN and FR were updated
- Validation result

If `{workflow.on_complete}` is non-empty, execute it after confirming.
