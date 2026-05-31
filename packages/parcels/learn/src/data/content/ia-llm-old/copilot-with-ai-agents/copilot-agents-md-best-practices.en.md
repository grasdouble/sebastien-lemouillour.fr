---
id: copilot-agents-md-best-practices
order: 3
difficulty: intermediate
tags: [agents, copilot]
publishedAt: 2026-12-31
updatedAt: 2026-12-31
---

You've written `AGENTS.md`, added a rule about tests, and the agent still charges into the codebase like it is late for a train. That usually means the file is carrying the wrong kind of instruction, not that the model suddenly forgot how to read.

## Pick the file before you write the rule

GitHub documents three repository instruction types on GitHub.com: repository-wide `.github/copilot-instructions.md`, path-specific `.github/instructions/*.instructions.md`, and agent instructions such as `AGENTS.md` ([GitHub custom instructions docs](https://docs.github.com/en/copilot/customizing-copilot/adding-repository-custom-instructions-for-github-copilot), [Custom instructions support](https://docs.github.com/en/copilot/reference/custom-instructions-support)). The same support matrix also shows why the file choice matters: on GitHub.com, Copilot Chat reads repository-wide instructions, while Copilot cloud agent also reads path-specific and agent instructions. `AGENTS.md` can live anywhere in the repository, with the nearest file in the directory tree taking precedence for agent work. I prefer to decide the file first, because dumping everything into `AGENTS.md` is how you build a junk drawer with headings.

This is the split I would use in a generic project:

```text
my-app/
├─ .github/copilot-instructions.md
├─ .github/instructions/frontend.instructions.md
├─ packages/web/AGENTS.md
└─ packages/api/AGENTS.md
```

Use `copilot-instructions.md` for rules that should follow the repository everywhere, use `.instructions.md` for rules that only make sense for part of the tree, and use `AGENTS.md` for operating constraints the agent must obey while working there.

## Write rules the model can actually audit

GitHub says custom instructions work best as short, self-contained statements, reminds you that Copilot is non-deterministic, and notes that Copilot code review only reads the first 4,000 characters of any custom instruction file ([Copilot response customization](https://docs.github.com/en/copilot/concepts/prompting/response-customization)). That is why vague rules fail twice: they are hard to follow and impossible to verify.

Here is the sort of `AGENTS.md` block I trust:

```markdown
## Validation

Run the affected test suite before finishing work.

- ✅ Run `pnpm test --filter my-package`
- ✅ Report the failing command if validation does not pass
- ❌ Mark the task done without running the tests
```

"Be careful with security" sounds serious, but it does not force a decision. "Never copy values from `.env` into code, examples, or logs" is better because you can inspect whether the rule was followed.

## Keep local rules local

I like `AGENTS.md` for instructions with consequences, required validation, forbidden Git actions, secrets handling, documentation duties, and review habits that tooling will not enforce for you. If the rule is really about a folder, a language, or a framework, a scoped instructions file stays cleaner. VS Code documents `.instructions.md` files with `applyTo` frontmatter, automatic workspace support for `.github/copilot-instructions.md`, and `AGENTS.md` support for Copilot Chat, while nested `AGENTS.md` files are still experimental there ([VS Code custom instructions](https://code.visualstudio.com/docs/copilot/customization/custom-instructions)).

This is the kind of path-specific file I would reach for first:

```markdown
---
applyTo: 'packages/web/**/*.{ts,tsx}'
---

# React rules

- Prefer semantic HTML before adding ARIA roles
- Test visible state changes with React Testing Library
```

One caveat is easy to miss: on GitHub.com, that kind of path-specific rule helps Copilot cloud agent and Copilot code review, not regular Copilot Chat.

## Turn repeated pain into a rule

GitHub's general Copilot guidance is still the boring, correct answer: give better context, check the output, and iterate ([GitHub Copilot best practices](https://docs.github.com/en/copilot/using-github-copilot/best-practices-for-using-github-copilot)). So when the same mistake shows up twice, do not add a motivational slogan. Add the smallest rule that would have prevented the mistake and the easiest way to verify it.

If I had to set one threshold, it would be this: put something in `AGENTS.md` only when the mistake is expensive, repeatable, and not already enforced by your tools.
