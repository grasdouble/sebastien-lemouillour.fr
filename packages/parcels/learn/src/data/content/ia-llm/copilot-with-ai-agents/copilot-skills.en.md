---
id: copilot-skills
order: 4
difficulty: intermediate
tags: [copilot, skills, ai-agents]
---

You have a workflow you repeat often: create a new component in the right directory, with the right files, in the right order, without forgetting to update the barrel. You could write it in `AGENTS.md`. But a seven-step procedure with conditions, files to create, validations to run — that doesn't fit in three lines. That's where Skills become useful.

## What a Skill is

A Skill is a markdown file that describes a complete procedure for the agent to follow. Where `AGENTS.md` encodes permanent rules ("always use pnpm"), a Skill encodes a workflow: an ordered sequence of steps to accomplish a specific task.

Concretely, a Skill is a `.md` file in a directory Copilot can discover (depending on the tool: `_skills/`, `_bmad/`, or `.agents/skills/`). The agent reads it and executes it like a procedure.

## When to write a Skill instead of an instruction

The key distinction is between **rule** and **procedure**. Here's the practical test:

If you can express the instruction in one or two lines with ✅/❌ examples, it's a rule: it goes in `AGENTS.md`.

If the instruction involves multiple steps in a precise order, files to create following patterns, or conditions to verify, it's a procedure: it goes in a Skill.

Examples that belong in `AGENTS.md`:

- "Always use pnpm"
- "Never commit"
- "Add aria-hidden on decorative SVGs"

Examples that deserve a Skill:

- Creating a new React component with its complete file structure
- Generating a changeset by checking modified packages
- Running a structured code review in multiple passes

## Structure of a well-written Skill

A Skill looks like an operational procedure. Context first, so the agent understands the situation. Steps next, in the order they should be executed. Triggers last, so the agent knows when to use this Skill without being explicitly asked.

Here's a full example to illustrate the pattern:

```markdown
# Skill: Create a Design System component

## Context

This Skill guides the creation of a React component in the Design System.
It ensures the file structure and conventions are respected.

## Triggers

Use this Skill when the user asks:

- "create a <Name> component"
- "add a component to the DS"

## Steps

### 1. Create the file structure

- `src/components/<Name>/index.ts` (barrel, re-exports only)
- `src/components/<Name>/<Name>.tsx` (implementation)
- `src/components/<Name>/<Name>.module.css`
- `src/components/<Name>/__tests__/<Name>.test.tsx`

### 2. Write the test first (TDD)

The test should describe the expected behaviour before implementing the component.

### 3. Implement the component

Minimal implementation to make the test pass.

### 4. Update the global barrel

Add the export to `src/components/index.ts`.

### 5. Validate

- `pnpm typecheck`
- `pnpm lint`
- `pnpm test`
```

## Triggers

The "Triggers" section is what makes Skills genuinely useful: the agent recognises situations where it should apply the Skill without you having to say "use Skill X". In practice this feels like understanding, even if it's pattern matching.

A good trigger is a natural phrase you'd write in chat. Not an artificial keyword.

## Organisation in the project

```
_skills/
  create-component.md
  create-parcel.md
  generate-changeset.md
  run-code-review.md
```

One file per Skill, named descriptively in kebab-case. If the project uses BMAD (like this site), Skills live in `_bmad/` with a slightly different format. In either case the principle is the same: one markdown file per reproducible workflow.
