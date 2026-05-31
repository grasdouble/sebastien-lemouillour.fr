---
id: copilot-agents-md-setup
order: 2
difficulty: beginner
tags: [agents, copilot]
publishedAt: 2026-05-15
updatedAt: 2026-05-30
---

You have probably seen this already: Copilot solves one task, opens the next file, and suddenly acts like your project has no history. It forgets the test command, invents a naming rule, and edits the wrong layer with cheerful confidence.

GitHub calls these files custom instructions: repository-wide `.github/copilot-instructions.md`, path-specific `.instructions.md`, and agent instruction files such as `AGENTS.md` [GitHub Docs](https://docs.github.com/en/copilot/concepts/about-customizing-github-copilot-chat-responses). If you are setting up agent workflows, I would start with `AGENTS.md`. The [support matrix](https://docs.github.com/en/copilot/reference/custom-instructions-support) shows that GitHub's cloud agent and Copilot CLI both read that filename, which makes it the safest single file when you want one place for agent-facing rules.

## What `AGENTS.md` solves

`AGENTS.md` is just a Markdown file that tells an agent the boring context you do not want to repeat: how to test, what not to change, and which conventions are real. In VS Code, that context affects chat and agent mode, not inline suggestions as you type [VS Code Docs](https://code.visualstudio.com/docs/copilot/customization/custom-instructions). That limitation surprises beginners, so it helps to know it early.

Once the file exists, you stop stuffing every prompt with the same reminders. The file carries the project rules, and your prompt can focus on the task.

## Start with one root file

GitHub says Copilot agents can use `AGENTS.md` files throughout a repository and pick the nearest one, but the VS Code setup guide also says subfolder `AGENTS.md` support is still off by default there today [setup guide](https://docs.github.com/en/copilot/how-tos/configure-custom-instructions-in-your-ide/add-repository-instructions-in-your-ide?tool=vscode). That is why I would keep day one boring: put one `AGENTS.md` at the repository root, see whether it removes the repeated mistakes, and split later only if one folder truly needs different rules.

This is the smallest version I would actually ship first.

```markdown
# AGENTS.md

## Working rules

- Run the documented test command before you finish a change.
- Ask before adding a new runtime dependency.
- Update docs when public behavior changes.
```

## If you also use Claude Code

Portability gets messy fast. [OpenAI Docs](https://developers.openai.com/codex/guides/agents-md) say Codex reads `AGENTS.md` directly and layers broader instructions with nearer ones. [Claude docs](https://code.claude.com/docs/en/memory) say Claude Code uses `CLAUDE.md` files for project instructions. Because of that mismatch, I would mirror only the few rules that matter most instead of trying to build a clever setup on day one.

This tiny companion file is enough when you want both tools to start from the same habits.

```markdown
# CLAUDE.md

## Working rules

- Run the documented test command before you finish a change.
- Ask before adding a new runtime dependency.
- Update docs when public behavior changes.
```

## What to put in it

Keep the file short, specific, and a little opinionated. A good `AGENTS.md` reads like notes from a careful teammate, not like a policy poster. Name the important folders, list the real test command, and write down the two or three mistakes you never want repeated.

This template is generic on purpose, so you can copy the shape without copying someone else's project.

```markdown
# AGENTS.md

## Project map

- The application code lives in `packages/my-app`.
- Shared utilities live in `packages/my-shared`.

## Coding rules

- Prefer imports from `@my/shared` over copying helpers.
- Keep functions focused and name them after what they return or change.

## Workflow

- Run `pnpm --filter my-app test` after changing behavior in `packages/my-app`.
- Ask before introducing a new runtime dependency.

## Definition of done

- Update tests when behavior changes.
- Update docs when setup or public behavior changes.
```

If one root file already stops the repeated mistakes, stop there. Add path-specific instructions only when a folder needs rules that would confuse the rest of the repository. Next, read the guide on `.instructions.md` files so you know when to split.
