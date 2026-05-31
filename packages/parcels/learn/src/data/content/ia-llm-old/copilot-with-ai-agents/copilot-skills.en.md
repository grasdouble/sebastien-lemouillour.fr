---
id: copilot-skills
order: 4
difficulty: intermediate
tags: [agents, copilot]
publishedAt: 2026-05-15
updatedAt: 2026-05-30
---

You know the moment: you have typed the same review prompt three times this week, Copilot still forgot one step, and now you are wondering whether the fix is another giant `AGENTS.md` file. I learned this the stubborn way. Turning a two-minute shortcut into an always-on rule is a great way to annoy Future Me.

## The first trap is using instructions for everything

The answer starts with [VS Code custom instructions](https://code.visualstudio.com/docs/copilot/customization/custom-instructions). They cover two different jobs: always-on rules in `.github/copilot-instructions.md` and `AGENTS.md`, plus targeted `.github/instructions/**/*.instructions.md` files that apply when matching files or tasks are in play. They are there to shape behavior over time, not to hold a checklist you only want when a specific task shows up.

That distinction matters even more because support is not identical everywhere. GitHub publishes a [GitHub Copilot support matrix](https://docs.github.com/en/copilot/reference/custom-instructions-support), and it is worth checking before you assume that custom instructions behave the same way in VS Code, GitHub.com, the CLI, and every other Copilot surface.

So if your real pain is, “I want one reusable command for one recurring job,” instructions are the wrong tool. You need something you opt into.

## Prompt files are the lightest answer

For that problem, [VS Code prompt files](https://code.visualstudio.com/docs/copilot/customization/prompt-files) are still the smallest useful unit. In VS Code, they are Markdown files with a `.prompt.md` extension, usually stored in `.github/prompts/` for a workspace. For personal reuse, VS Code stores them in your profile's user data. You run them manually as slash commands, from **Chat: Run Prompt**, or from the play button in the editor. The frontmatter can define `description`, `name`, `argument-hint`, `agent`, `model`, and `tools`.

Here is the smallest prompt file I would actually keep around:

```markdown
---
name: prepare-pr
description: Prepare a pull request draft for the current change
agent: agent
---

Review the current change before opening a pull request.

1. Identify the user-visible change.
2. Summarize it in three bullets.
3. List risks, migrations, and follow-up work.
4. Draft:
   - a pull request title
   - a short description
   - a verification checklist
```

I prefer prompt files when the workflow still fits in one chat interaction. They are quick to write, easy to test, and cheap to throw away when the ritual turns out to be less useful than I thought.

## Skills are what people usually mean when the workflow gets serious

The problem with prompt files is that they stay prompt-shaped. If you need scripts, templates, examples, or reuse across compatible agents, [VS Code Agent Skills](https://code.visualstudio.com/docs/copilot/customization/agent-skills) are a better fit. A skill is a folder with a `SKILL.md` file and any supporting resources it references. VS Code can load project skills from `.github/skills/`, `.claude/skills/`, or `.agents/skills/`, and personal skills from the corresponding folders in your home directory. The `name` and `description` fields are required, `user-invocable` defaults to `true`, `disable-model-invocation` defaults to `false`, and `context: fork` is currently experimental.

When the job deserves a skill, the folder starts with a `SKILL.md` like this:

```markdown
---
name: review-pr
description: Review a pull request for risks and release notes. Use this when asked to prepare or review a PR.
user-invocable: true
disable-model-invocation: false
---

# PR review skill

1. Inspect the current diff.
2. Group changes by user impact.
3. Call out migrations, risky assumptions, and missing tests.
4. Draft release notes in plain language.
5. If needed, reuse the checklist in [release-template](./release-template.md).
```

This is the point where I stop calling the thing a “saved prompt.” If Copilot needs extra files to do the job well, it is a skill-shaped problem.

## Custom agents solve a different headache

Sometimes the pain is not repetition. Sometimes the pain is that you want Copilot to behave like a planner, reviewer, or debugger with a specific tool belt. That is where [VS Code custom agents](https://code.visualstudio.com/docs/copilot/customization/custom-agents) come in. They use `.agent.md` files, can restrict tools, choose a model or model list, and define handoffs. I would not reach for one just to save a prompt. I would reach for one when the role itself needs to be stable, or when I want the planning step to stay read-only so Copilot cannot "help" by editing files too early.

## Picking the right file without overthinking it

My rule is boring, but it has saved me time. Use custom instructions for rules that should fade into the background. Use a prompt file when the job fits in one explicit chat command. Use a skill when the workflow needs files, scripts, or portability across agents. If you still want to cram that workflow into always-on instructions, that is usually the threshold where a skill or agent is cheaper than one more permanent rule.
