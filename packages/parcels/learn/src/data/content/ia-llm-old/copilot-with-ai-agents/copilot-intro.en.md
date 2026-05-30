---
id: copilot-intro
order: 1
difficulty: beginner
tags: [copilot, ai-agents, github]
publishedAt: 2026-05-15
updatedAt: 2026-05-30
---

Copilot gets strange fast when it uses `npm` in a `pnpm` project, invents a test command, or edits the wrong file with total confidence. Most of the time, the model is not the real problem. The real problem is asking one generic tool to behave well inside a very specific project.

That is why I think of GitHub Copilot as three different jobs, not one fuzzy assistant. Once I made that mental split, its behavior started making a lot more sense.

## Three jobs, one brand

[Code suggestions](https://docs.github.com/en/copilot/concepts/completions/code-suggestions) are the proposals that appear directly in your editor while you type. In some IDEs, that includes ghost text, which is faded text shown ahead of your cursor, and next edit suggestions, which propose a bigger follow-up change. I use this when I already know what I want to write and just want less typing.

[Copilot Chat](https://docs.github.com/en/copilot/concepts/about-github-copilot-chat) is the conversational version. You ask a question in plain language, and Copilot answers in a chat window on GitHub, in several IDEs, on GitHub Mobile, or in Copilot CLI. This is the right tool when you want an explanation, a refactor draft, or a first test draft that you will still review yourself. Helpful, yes. Magical, no.

When the task is bigger than one reply, [Copilot cloud agent](https://docs.github.com/en/copilot/concepts/agents/cloud-agent/about-cloud-agent) can research a repository, create a plan, make code changes on a branch, which is an isolated line of work in Git, and run tests or lint checks, which are automated quality checks, in its own temporary environment before you decide whether to open a pull request. That is the moment where Copilot starts acting less like autocomplete and more like a very fast junior teammate who still needs supervision.

## Why context stops being optional

Once you move from suggestions to chat or agent work, vague prompts get expensive. GitHub Copilot CLI supports [custom instructions](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/add-custom-instructions), including repository-wide instructions, path-specific instructions, and agent instructions such as `AGENTS.md`. I would choose written instructions long before I tried to write a clever mega-prompt, because files are visible, repeatable, and easier to review.

A small `AGENTS.md` file is often enough to prevent the most predictable mistakes, so this is the kind of baseline I would start with:

```md
# AGENTS.md

- Use pnpm, never npm.
- Run tests and lint checks before saying the work is done.
- Do not edit generated files by hand.
- Prefer accessible HTML and visible focus states.
```

## What memory changes, and what it does not

[Copilot Memory](https://docs.github.com/en/copilot/concepts/agents/copilot-memory) is in public preview. It can store repository facts and, for Copilot Pro, Pro+, or Max users, personal preferences for later work. I like it, but I would not start there. Unused memories are deleted after 28 days, so I treat memory as a helper and versioned instruction files as the source of truth.

## Where I would start

If Copilot mainly helps you finish code you already understand, start with code suggestions. If you want explanations or rough drafts, use chat. If you want it to edit several files or run commands, write repository instructions first. If that boundary still feels fuzzy, read the next guide about custom instructions before you try agents. My rule is simple: no repo instructions, no agent for anything bigger than a tiny cleanup.
