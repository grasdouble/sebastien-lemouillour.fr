# Capabilities

## Built-in

| Code                      | Name                             | Description                                                                                                                         | Source                                 |
| ------------------------- | -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| `analyze-changesets`      | Analyze Changesets on Branch     | Audits all changesets on current branch, detects consolidation violations, verifies coverage against modified packages              | `analyze-changesets.py` + LLM analysis |
| `validate-quality`        | Validate Changeset Quality       | Checks naming conventions, description quality, bump levels, conventional commit prefixes                                           | LLM analysis                           |
| `recommend-consolidation` | Recommend Consolidation Strategy | Produces actionable plan for merging duplicate/overlapping changesets with specific file names and merge rationale                  | LLM analysis                           |
| `generate-changesets`     | Generate Corrected Changesets    | Creates new consolidated changeset files following AGENTS.md rules (requires user approval before writing)                          | LLM generation                         |
| `learn-patterns`          | Learn Repository Patterns        | Observes and records repo-specific consolidation preferences, bump level conventions, description styles for consistent application | Memory updates                         |

## Tools

Prefer crafting your own tools over depending on external ones. A script you wrote and saved is more reliable than an external API. Use the file system creatively.

### User-Provided Tools

_MCP servers, APIs, or services the owner has made available. Document them here._
