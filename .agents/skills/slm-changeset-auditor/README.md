# Changeset Quality Auditor 🔍

A memory agent that audits changeset quality on git branches, detects consolidation violations, and generates corrected changesets following AGENTS.md rules.

## Purpose

Catches every consolidation violation that familiarity with development flow makes invisible. Ensures changeset quality is never compromised by iteration blindness.

## Agent Type

**Memory agent** (focused relationship) — learns repository-specific patterns and consolidation preferences over time.

## Activation

```bash
# Interactive mode (default)
slm-changeset-auditor

# Analyze specific target branch
slm-changeset-auditor --target=develop
```

## Capabilities

| Capability                  | Description                                                                                                            |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| **Analyze Changesets**      | Audits all changesets on current branch, detects consolidation violations, verifies coverage against modified packages |
| **Validate Quality**        | Checks naming conventions, description quality, bump levels, conventional commit prefixes                              |
| **Recommend Consolidation** | Produces actionable plan for merging duplicate/overlapping changesets with specific file names                         |
| **Generate Changesets**     | Creates new consolidated changeset files following AGENTS.md rules (requires user approval)                            |
| **Learn Patterns**          | Observes and records repo-specific consolidation preferences, bump level conventions, description styles               |

## What It Audits

### Consolidation Violations

- Multiple changesets targeting the same exact package set
- Overlapping changesets (atomic changes split across multiple files)
- Unrelated changes bundled in one mega-changeset

### Coverage Issues

- Packages with file changes but no changeset entry
- Missing changeset entries for any modified package (including private packages, tests, storybook, docs)

### Quality Issues

- Non-descriptive names (random hex IDs instead of kebab-case names)
- Missing conventional commit prefixes (feat:, fix:, chore:, etc.)
- Incorrect bump levels (major/minor/patch)
- Overly verbose descriptions with unnecessary implementation details

## Technical Details

### Memory Architecture

- **Sanctum location:** `{project-root}/_bmad/memory/slm-changeset-auditor/`
- **Files:** PERSONA, CREED, BOND, MEMORY, CAPABILITIES, INDEX
- **Session logs:** `sessions/YYYY-MM-DD.md`

### Scripts

- **`analyze-changesets.py`** — Mechanical analysis (git diff parsing, changeset parsing, coverage checking)
  - Input: target branch (default: `main`)
  - Output: JSON with modified packages, existing changesets, violations
  - Dependencies: Python stdlib only (no external packages)

### First Breath

On first activation, the agent runs First Breath — a guided conversation to:

- Choose its name
- Learn your development workflow and changeset practices
- Understand your repository structure
- Calibrate its audit strictness level
- Discover your consolidation and quality preferences

## Personality

Meticulous, strict, methodical. Zero tolerance for violations. Evidence-based findings with rule citations. Builds confidence through exhaustive coverage and actionable recommendations.

## Core Values

1. **Zero false negatives** — Every consolidation violation must be detected
2. **Evidence-based findings** — Every violation cited with rule reference and examples
3. **Actionable recommendations** — Consolidation plans must be implementable without ambiguity
4. **Learning mindset** — Repo-specific patterns are learned and applied consistently
5. **Strict but fair** — Distinguish blocking (must fix) from non-blocking (nice to fix)

## Files

```
slm-changeset-auditor/
├── SKILL.md                           # Agent bootloader
├── customize.toml                     # Metadata (no override surface)
├── README.md                          # This file
├── references/
│   ├── first-breath.md                # First activation conversation
│   ├── memory-guidance.md             # Memory management philosophy
│   └── audit-examples.md              # Real-world patterns from production audits
├── scripts/
│   └── analyze-changesets.py          # Mechanical analysis script
└── sanctum-template/                  # Initial sanctum files (created on first breath)
    ├── INDEX-template.md
    ├── PERSONA-template.md
    ├── CREED-template.md
    ├── BOND-template.md
    ├── MEMORY-template.md
    └── CAPABILITIES-template.md
```

## Usage Example

```bash
# First time (triggers First Breath)
slm-changeset-auditor

# Subsequent uses (normal rebirth)
slm-changeset-auditor

# The agent will:
# 1. Read its sanctum (load its identity and learned patterns)
# 2. Greet you by name
# 3. Run analyze-changesets.py to gather data
# 4. Analyze violations with LLM reasoning
# 5. Produce a structured report with:
#    - Blocking violations (consolidation, coverage)
#    - Non-blocking issues (naming, quality)
#    - Actionable consolidation plan
# 6. Optionally generate corrected changesets (with your approval)
# 7. Update session log and memory with patterns learned
```

## Example Audit Session

**Scenario:** Branch `feat-ai-chat` with iterative changesets that need consolidation.

### Initial Changeset State

Three separate files for one atomic feature:

```markdown
# .changeset/improve-ui.md

---

## '@grasdouble/slm_parcel_ai-chatbot': minor

feat: improve chatbot UI with better styling
```

```markdown
# .changeset/fix-history.md

---

## '@grasdouble/slm_parcel_ai-chatbot': patch

fix: fix conversation history loading
```

```markdown
# .changeset/add-providers.md

---

'@grasdouble/slm_shared': major
'@grasdouble/slm_parcel_ai-chatbot': patch

---

refactor: move LLM providers to ai-chatbot, breaking shared consumers
```

### Violations Detected

**BLOCKING - Consolidation Violation:**

```
Package '@grasdouble/slm_parcel_ai-chatbot' appears in 3 changesets:
  - improve-ui.md (minor)
  - fix-history.md (patch)
  - add-providers.md (patch)

These are all part of one atomic feature: "Launch AI chatbot parcel"
Should be ONE changeset with final state.

Rule: AGENTS.md — One file per atomic feature (all packages changing together)
```

**BLOCKING - Coverage Issue:**

```
Package '@grasdouble/slm_parcel_header-bar' has file changes but no changeset:
  - src/nav-links.tsx (modified to add chatbot link)

Missing: header-bar changeset entry
```

**NON-BLOCKING - Quality Issue:**

```
Changeset 'improve-ui.md':
  ✗ Missing conventional commit prefix (found 'improve' but not 'feat:', 'fix:', etc)
  ✓ Bump level: conservative (minor for feature) — OK
  ✓ Naming: descriptive — OK
```

### Consolidation Plan

```markdown
## Recommended Actions

### 1. Merge 3 changesets → 1 consolidated changeset

Merge files:

- improve-ui.md
- fix-history.md
- add-providers.md

Into: add-ai-chatbot-parcel.md

### 2. Add missing changeset

Create: add-ai-chatbot-nav-link.md

- Affects: @grasdouble/slm_parcel_header-bar (minor)

### 3. Corrected changesets

Would generate the following (awaiting your approval):
```

**Corrected Changeset 1:**

```markdown
# .changeset/add-ai-chatbot-parcel.md

---

'@grasdouble/slm_parcel_ai-chatbot': minor
'@grasdouble/slm_shared': major

---

feat: add AI chatbot parcel with LLM providers, conversation history, and styling
```

**Corrected Changeset 2:**

```markdown
# .changeset/add-ai-chatbot-nav-link.md

---

## '@grasdouble/slm_parcel_header-bar': minor

feat: add navigation link to AI chatbot
```

### Summary

| Category                | Count                | Status        |
| ----------------------- | -------------------- | ------------- |
| Blocking violations     | 2                    | 🔴 Must fix   |
| Non-blocking issues     | 1                    | 🟡 Should fix |
| **Recommended changes** | **2 consolidations** | ✅ Ready      |

---

## Configuration

### Configuration Options

Configure via `customize.toml` in the skill directory:

```toml
[repository]

# Consolidation rule: "atomic" (one per atomic feature) or "package" (one per package)
# "atomic" = all packages that change together for one logical change = one changeset
# "package" = one changeset per modified package, regardless of logical grouping
# Default: "atomic" (recommended)
consolidation_rule = "atomic"

# Root-level changesets allowed? (e.g., for shared config, skills, tooling at repo root)
# false = root files do not need changesets (per AGENTS.md shared rule)
# true = include root as a package for changeset tracking
# Default: false (recommended)
root_changesets_allowed = false

# Total packages in monorepo (for sanity checks and coverage validation)
# Leave commented to auto-detect from workspace
# packages_total = 12

# Report language: "en", "fr", or other ISO 639-1 code
# Default: "en"
language = "en"

# Bump philosophy: "conservative" or "aggressive"
# "conservative": patch for fixes/refactors, minor for features, major for breaking changes
# "aggressive": patch for hotfixes only, minor for all changes, major for breaking
# Default: "conservative" (recommended)
bump_philosophy = "conservative"
```

### Configuration Precedence

Configurations are resolved in this order (first match wins):

1. **Personal override** — `{project-root}/_bmad/custom/slm-changeset-auditor.user.toml`
2. **Team override** — `{project-root}/_bmad/custom/slm-changeset-auditor.toml`
3. **Skill defaults** — `.agents/skills/slm-changeset-auditor/customize.toml`

**Validation:**

- If `consolidation_rule` is not "atomic" or "package", agent uses "atomic".
- If `bump_philosophy` is not "conservative" or "aggressive", agent uses "conservative".
- If `packages_total` is negative or non-integer, auto-detection is used.
- If `language` is unsupported, agent falls back to "en".

**Defaults:**

- If `[repository]` section is missing or empty, built-in defaults are used.
- Configuration is loaded once at startup; changes require restart.

### When to Use "atomic" vs "package"

**atomic mode (recommended):**

- Use when: Multiple packages change together as ONE logical feature
- Example: You add a new component, update the DS, and integrate it in a page
  - All 3 packages change for ONE feature → ONE changeset
  - ```toml
    'component-pkg': minor
    'design-system': patch
    'page-pkg': patch
    ```

**package mode:**

- Use when: Each package's changes are independent
- Example: Bug fixes across multiple unrelated packages
  - Package A fix is unrelated to Package B fix → separate changesets
  - ```toml
    # file1.md
    'pkg-a': patch

    # file2.md
    'pkg-b': patch
    ```

### Error Catalog & Troubleshooting

#### "Invalid bump level"

- **Cause:** Changeset specifies a bump level other than major/minor/patch
- **Fix:** Edit changeset file, use only: `major`, `minor`, or `patch`

#### "No frontmatter found"

- **Cause:** Changeset file missing `---` delimiters
- **Fix:** Ensure changeset has frontmatter:

  ```markdown
  ---
  '@pkg': minor
  ---

  feat: description
  ```

#### "Package with changes but no changeset"

- **Cause:** A file was modified but the package isn't in any changeset
- **Fix:** Add the package to an existing changeset, or create a new one:
  ```bash
  pnpm changeset add
  ```

#### "Overlapping changesets for package X"

- **Cause:** Same package appears in multiple different changesets
- **Fix:** Consolidate changesets that share packages (if atomic), or verify they're intentionally separate

#### "Permission denied reading package.json"

- **Cause:** Cannot read package.json in a parent directory
- **Fix:** Check file permissions (`ls -la path/to/package.json`)

---

## Role Boundaries: Script & Agent

### What the Python Script Does

- Parses git diffs and identifies modified files
- Groups files by package (walks package.json hierarchy)
- Parses changeset markdown files and validates structure
- Detects coverage gaps (modified packages without changesets)
- Detects duplicate/overlapping changesets
- Returns structured JSON data

**The script MUST NEVER:**

- Make policy decisions (consolidation strategy)
- Judge which violations are blocking vs non-blocking
- Assume user preferences about bump levels
- Infer repository patterns

### What the LLM Agent Does

- Interprets violation data with repository context
- Applies AGENTS.md rules to make blocking/non-blocking judgments
- Learns and applies repo-specific consolidation patterns
- Proposes consolidation strategy with specific file names
- Generates corrected changesets (with user approval)
- Updates memory with patterns learned

**The agent MUST NEVER:**

- Assume hidden facts about the repo structure
- Commit or stage changes without user consent
- Override AGENTS.md rules
- Bypass the user's consolidation preferences

---

## Activation & Directory Layout

Expected filesystem structure:

```
project-root/
├── .agents/
│   └── skills/
│       └── slm-changeset-auditor/      ← {skill-root}
│           ├── analyze-changesets.py
│           ├── README.md
│           ├── SKILL.md
│           ├── customize.toml
│           └── ...
├── _bmad/
│   ├── config.yaml
│   ├── memory/
│   │   └── slm-changeset-auditor/      ← {skill-root}/_bmad/memory/{skill-name}
│   │       ├── PERSONA.md
│   │       ├── CREED.md
│   │       ├── BOND.md
│   │       ├── MEMORY.md
│   │       ├── CAPABILITIES.md
│   │       ├── INDEX.md
│   │       └── sessions/
│   │           ├── 2026-06-01.md
│   │           └── 2026-06-06.md
│   └── custom/
│       ├── slm-changeset-auditor.toml        ← team overrides
│       └── slm-changeset-auditor.user.toml   ← personal overrides
├── .changeset/                        ← changeset repository
│   ├── *.md                           ← changeset files
│   ├── config.json                    ← changeset config (if using changesets lib)
│   └── README.md
└── AGENTS.md                          ← shared rules (loaded on each audit)
```

**Key paths:**

- Skill root: `.agents/skills/slm-changeset-auditor/`
- Sanctum: `_bmad/memory/slm-changeset-auditor/`
- Config: `_bmad/config.yaml` + `_bmad/custom/*.toml`

---

## Session Close & Memory

After each audit session, the agent follows a discipline to ensure learning persists:

1. **Write session log** → `_bmad/memory/slm-changeset-auditor/sessions/YYYY-MM-DD.md`
   - What was audited, violations found, patterns noticed
   - Kept raw, not polished

2. **Update curated memory** → `_bmad/memory/slm-changeset-auditor/MEMORY.md`
   - Distill patterns from recent session logs
   - Keep tight and relevant
   - This IS loaded on rebirth

3. **Update BOND.md** → What was learned about your preferences
4. **Update PERSONA.md** → How the agent is evolving

See `references/memory-guidance.md` for full discipline.

### Implementation Details

**`analyze-changesets.py`:**

- **Purpose:** Mechanical git/filesystem analysis (no external dependencies).
- **Input:** Target branch (default: `main`).
- **Output:** JSON with modified files, packages, changesets, coverage gaps, violations, and warnings.
- **Error handling:** Fails gracefully with error messages if git commands fail or files are malformed.
- **Requirements:** Python 3.7+ stdlib only.

**Robustness:**

- Git command failures are reported with stderr output.
- Malformed changesets are parsed best-effort with error flags.
- Directory permission issues are detected and reported.
- Bump level validation ensures only valid values (major/minor/patch) are accepted.
- JSON parse failures are logged (not silently swallowed).
- Root package.json is properly detected for coverage checks.

### Python Script Output Schema

The script outputs structured JSON with this schema:

```json
{
  "current_branch": "string",
  "target_branch": "string (default 'main')",
  "modified_files_count": "number of files changed",
  "packages_with_changes": {
    "<package_name>": {
      "file_count": "integer",
      "files": ["path/to/file1", "path/to/file2"]
    }
  },
  "changesets": [
    {
      "filename": "changeset-name.md",
      "packages": [
        {
          "name": "@grasdouble/package-name",
          "bump": "major|minor|patch"
        }
      ],
      "description": "feat: description text",
      "prefix": "feat|fix|chore|...",
      "content": "full file content",
      "error": "optional — only if parsing failed"
    }
  ],
  "changeset_count": "total number of changesets",
  "coverage_gaps": ["@pkg1", "@pkg2"],
  "duplicate_changesets": [
    {
      "packages": ["@pkg-a", "@pkg-b"],
      "changesets": ["file1.md", "file2.md"]
    }
  ],
  "overlapping_changesets": [
    {
      "package": "@grasdouble/shared-pkg",
      "changesets": ["file1.md", "file2.md"]
    }
  ],
  "warnings": ["warning message 1", "warning message 2"] or null
}
```

**Field Definitions:**

- `coverage_gaps`: Packages with file changes but no changeset entry
- `duplicate_changesets`: Changesets targeting the exact same package set (blocking violation)
- `overlapping_changesets`: Same package in multiple different changesets (blocking violation)
- `warnings`: Parse/permission/validation warnings (non-blocking)

## Requirements

- Python 3.7+ (stdlib only, no pip dependencies)
- Git repository
- AGENTS.md file in repository root (for rule loading)

## License

Part of the Grasdouble project ecosystem.
