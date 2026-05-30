---
id: copilot-intro
order: 1
difficulty: beginner
tags: [copilot, ai-agents, github]
publishedAt: 2026-12-31
updatedAt: 2026-12-31
---

Copilot gets weird fast when it uses `npm` in a `pnpm` project, invents a test command, or edits the wrong file with total confidence. In most cases, the problem is not the model. The problem is that you asked a general tool to act inside a very specific project.

That is why I prefer to think about GitHub Copilot as three different jobs, not one fuzzy magic assistant.

## Three jobs, one brand

[Code suggestions](https://docs.github.com/en/copilot/concepts/completions/code-suggestions) are the inline proposals that appear while you type. In some IDEs, that includes classic ghost text and next edit suggestions. I use this mode when I already know the shape of the code and just want my hands to stop doing factory work.

[Copilot Chat](https://docs.github.com/en/copilot/concepts/about-github-copilot-chat) is the conversational layer. It is available in GitHub, several IDEs, GitHub Mobile, and Copilot CLI. This is the right tool when you want an explanation, a refactor draft, or a first pass on tests that you will still review yourself. Useful, yes. Magical, no. You still have to read what it produced.

When the task is bigger than a reply, [Copilot cloud agent](https://docs.github.com/en/copilot/concepts/agents/cloud-agent/about-cloud-agent) can research a repository, create an implementation plan, make code changes on a branch, run tests and linters in its own environment, and prepare a pull request for review. That is where Copilot stops feeling like autocomplete and starts feeling like a junior teammate who works very fast and occasionally needs a reality check.

## Why context stops being optional

Once you move from suggestions to chat or agent work, vague prompts get expensive. GitHub Copilot CLI supports [custom instructions](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/add-custom-instructions), including repository-wide instructions, path-specific instructions, and agent instructions such as `AGENTS.md`. In practice, I prefer written instructions over repeating the same prompt twenty times and pretending that counts as a system.

A tiny `AGENTS.md` file is often enough to stop the dumb mistakes, so here is the kind of baseline I like to start with:

```md
# AGENTS.md

- Use pnpm, never npm.
- Run lint and build before proposing completion.
- Do not edit generated files by hand.
- Prefer accessible HTML and visible focus states.
```

## What memory changes, and what it does not

[Copilot Memory](https://docs.github.com/en/copilot/concepts/agents/copilot-memory) is in public preview. It can store repository-level facts and, for Copilot Pro, Pro+, or Max users, user-level preferences that help Copilot cloud agent, code review, and Copilot CLI in later work. I like the feature, but I would not use it as my first line of defense. Unused entries are automatically deleted after 28 days. A versioned instruction file is boring, explicit, and visible in code review, which is exactly why I trust it more.

## Where to start

If Copilot mostly helps you finish lines you were already about to write, start with code suggestions and stop there. If you want it to explain code or draft tests, use chat. If you want it to touch multiple files or run commands, add instructions to the repository first. That is my threshold: no repo instructions, no agent for anything bigger than a trivial cleanup.
