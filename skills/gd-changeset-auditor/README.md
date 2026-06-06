# Changeset Quality Auditor 🔍

A memory agent that audits changeset quality on git branches, detects consolidation violations, and generates corrected changesets following AGENTS.md rules.

## Purpose

Catches every consolidation violation that familiarity with development flow makes invisible. Ensures changeset quality is never compromised by iteration blindness.

## Agent Type

**Memory agent** (focused relationship) — learns repository-specific patterns and consolidation preferences over time.

## Activation

```bash
# Interactive mode (default)
gd-changeset-auditor

# Analyze specific target branch
gd-changeset-auditor --target=develop
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

- **Sanctum location:** `{project-root}/_bmad/memory/gd-changeset-auditor/`
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
gd-changeset-auditor/
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
gd-changeset-auditor

# Subsequent uses (normal rebirth)
gd-changeset-auditor

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

## Requirements

- Python 3.7+ (stdlib only, no pip dependencies)
- Git repository
- AGENTS.md file in repository root (for rule loading)

## License

Part of the Grasdouble project ecosystem.
