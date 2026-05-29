---
id: copilot-agents-md-best-practices
order: 3
difficulty: intermediate
tags: [copilot, agents-md, best-practices]
---

You've set up `AGENTS.md`. You've added some rules. And yet the agent keeps doing things you didn't expect. The problem is almost never the number of rules: it's how they're phrased.

## The rule about rules: observable or pointless

An instruction you can't verify doesn't change the agent's behaviour.

Test yourself on these:

- "Be careful about security" — How would you know if the agent respected it?
- "Use best practices" — Which ones exactly?
- "Think about performance" — This sentence can mean a hundred things depending on context.

These formulations seem reasonable. They don't work because they don't encode a decision. An observable behaviour, on the other hand, lets you check after the fact:

- ✅ "Never call `tsc` directly. Use `pnpm typecheck` instead."
- ✅ "Never run `git add` or `git commit`. Leave all staging to the user."
- ✅ "Every decorative SVG must have `aria-hidden=\"true\"`."

For each of these, you can look at what the agent did and immediately see whether the rule was followed. That's the criterion.

## The format that works

Section headings in the form "subject — directive" are particularly effective because they communicate the gist before the body is even read:

```markdown
## Package Manager — Always use pnpm

## Git — No commits, no staging

## TypeScript — Never call tsc directly

## Accessibility — Non-negotiable
```

For the body of each rule, add a sentence explaining the _why_ when it isn't obvious. The agent handles constraints better when it understands where they come from. Here's a complete example for a rule where the "why" genuinely changes what's expected:

```markdown
## TypeScript — Never call tsc directly

The tsconfig files have `declaration: true`. Running tsc without `--noEmit`
emits .js, .d.ts and .map files into src/. Always use the project scripts.

- ✅ `pnpm typecheck`
- ✅ `ide-get_diagnostics`
- ❌ `tsc`, `pnpm tsc`, `tsc -p tsconfig.json`
```

Without the explanation, the prohibition seems arbitrary. With it, the agent understands the concrete risk it needs to avoid.

## What belongs in the file and what doesn't

A common confusion: `AGENTS.md` is not project documentation, and it's not a duplicate of your ESLint config.

**Put in `AGENTS.md`:**

- Tool choices the agent can't guess (package manager, builder, validation scripts)
- Git behaviours that are off-limits
- Project conventions not encoded in tools (naming, folder structure, changeset rules)
- Accessibility rules you want applied systematically
- Monorepo structure if it's non-standard

**Don't put in `AGENTS.md`:**

- Rules already covered by ESLint or Prettier — the agent will respect them through the tools, no need to double up
- Stylistic preferences (indentation, quotes) — that's Prettier's job
- Task-specific instructions ("for this PR, use this message") — ephemeral information doesn't belong here
- Functional documentation about the project

## Capitalise on real mistakes

This is the point people forget most often, and it's the most important one.

Every time the agent does something you have to correct, ask yourself: was this rule missing from `AGENTS.md`? If yes, add it in the same session. Not later. Now.

A well-maintained `AGENTS.md` isn't built by trying to anticipate every possible case upfront. It's built by observing real behaviour and codifying what was missing. Three months of working with Copilot produces a far more useful `AGENTS.md` than two hours of speculative planning.
