---
id: copilot-agents-md-setup
order: 2
difficulty: beginner
tags: [copilot, agents-md, configuration]
---

You've started using Copilot. The suggestions are useful, the chat responds well. And then you notice something annoying: every new session, it starts from scratch. It uses `npm` when your project runs on `pnpm`. It tries to commit code even though you told it not to last week. It ignores the accessibility conventions you'd already explained.

That's not a bug. Copilot has no memory between sessions. `AGENTS.md` is the fix.

## What this file does

`AGENTS.md` is a text file at the root of your project that Copilot agents read automatically at the start of a session. Whatever you put there becomes permanent context: the agent knows it without you having to repeat it.

Think of the difference between briefing a contractor at every single meeting versus having an onboarding document they read once. Same content, but you stop having to think about it.

## The symlink to copilot-instructions.md

GitHub Copilot in VS Code reads its instructions from `.github/copilot-instructions.md`. That's the official file the editor recognises.

The problem: other agents (Claude Code, OpenCode, some MCP-based tools) prefer to read `AGENTS.md` at the project root. Maintain two separate files and you'll inevitably let them drift apart.

The fix: a **symlink**. One source file, two access paths.

```bash
# From the project root
ln -s ../AGENTS.md .github/copilot-instructions.md
```

After that, you maintain exactly one file (`AGENTS.md`), and every tool reading either path gets the same instructions. The symlink itself is tracked by git, which is enough for VS Code to pick it up.

## Basic structure

A good `AGENTS.md` is short and readable. Each rule follows the same pattern: a title, one explanatory sentence, concrete examples.

```markdown
# AGENTS.md

## Package Manager — Always use pnpm

Never use npm or yarn.

- ✅ pnpm install, pnpm add <pkg>
- ❌ npm install, yarn add

## Git — No commits, no staging

Never create commits. Leave all git operations to the user.

- ✅ git diff, git status, git log
- ❌ git add, git commit
```

This format works because it's readable to a human and unambiguous to an agent. A descriptive title gives the gist, the text clarifies, the examples handle the remaining edge cases.

## Where to put it and how to version it

The file goes at the **root of the git repository**. In a monorepo, that means the root of the whole repo, not the root of an individual package.

Commit it to git like any other configuration file. It's a project artefact shared by the whole team, not a personal preference. Changes to the file go through code review, just like everything else.

Once it's in place, the next guide explains what to put in it and how to phrase rules that actually change the agent's behaviour.
