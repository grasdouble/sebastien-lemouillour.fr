# Content Quality Rules — Learn Guides

Load this file before drafting, revising, or reviewing any guide content. These rules apply to every guide in every capability (create, update, review).

## Narrative arc

Every guide must tell a story:

- Open with a concrete pain the reader recognizes — not a definition or a summary of what will be covered
- Introduce each concept as the answer to the problem raised by the previous one
- Add one natural transition sentence before every code block
- Close with a decision rule, a caveat, or a threshold — not a summary of what was covered
- Both EN and FR must have the same narrative richness — FR is not a reduced version

## Persona alignment

Always write for the target persona:

| Difficulty     | Persona     | Rules                                                                                                                                                                   |
| -------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `beginner`     | Découvreur  | Analogies, plain language, define every term on first use, explicit limitations, path to next guides. ✅ End with a "what next" pointer. ❌ No unexplained code blocks. |
| `intermediate` | Développeur | Working code with commented parameters, practical patterns, mention costs/rate limits/security. ❌ No purely theoretical content.                                       |
| `advanced`     | Architecte  | Tradeoffs, observability, production patterns, SLAs. ❌ Don't explain basics (tokens, temperature, etc.).                                                               |

## Project-agnosticism

- No references to any specific codebase, internal repo, or organizational setup
- Code examples use generic names (`@my/shared`, `my-app`, `my-package`)
- Any personal anecdote is framed around a universal experience, not internal specifics
- Any reader on any project must be able to follow the guide

## Official documentation links

- Back every significant technical claim with an inline link to its primary source (provider docs, tool websites, specs, seminal papers)
- Each URL must appear **at most once** per guide — link it the first time; use the name only on subsequent references
- Sources must be official — not blog posts or secondary sources
- External link count (body + `## Resources` section combined) must be **between 3 and 7**
  - Fewer than 3 → under-linked; key claims unsupported, weak SEO authority signals
  - More than 7 → over-linked; dilutes link equity and risks being flagged
  - Hard cap: **10** — when you'd exceed the cap, consolidate into a `## Resources` section instead of adding more inline links
- A `## Resources` section exists at the end **only** when it lists sources not already linked inline (foundational papers, additional reading, or a consolidated reference list)
- The `## Resources` section must contain **actual markdown links** (`[Name](url)`) — prose descriptions of sources with no clickable links are not acceptable

## Inline link anchor text

Anchor text must be **concise** — it names the resource, feature, or key term (ideally ≤5 words). The cited claim stays as readable prose; the link sits only on the resource name.

- ✅ `[OpenAI's evals guide](url) recommends tracking behavior as prompts change`
- ✅ `temperature is documented in [Google's parameter guide](url) as a randomness control`
- ✅ `[chain-of-thought paper](url)`
- ❌ `[OpenAI recommends evals to track behavior as prompts and models change](url)`
- ❌ `[Google documents temperature as a randomness control and lists 1.0 as the default](url)`

## Verify before writing

Check API shapes, configuration option names, and defaults against official docs. Mention the version when behavior is version-specific.
