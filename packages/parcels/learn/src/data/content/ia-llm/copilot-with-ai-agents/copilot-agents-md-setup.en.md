---
id: copilot-agents-md-setup
order: 2
difficulty: beginner
tags: [copilot, agents-md, configuration]
publishedAt: 2026-12-31
updatedAt: 2026-12-31
---

You have probably seen this already: Copilot gets one task right, then opens the next file and acts like it has never met your project before. It forgets the test command, invents a naming convention, and edits the wrong layer with suspicious confidence.

Repository instructions fix that. GitHub currently splits them into three buckets: `.github/copilot-instructions.md` for repository-wide guidance, `.instructions.md` files for path-specific rules, and agent instruction files such as `AGENTS.md`, `CLAUDE.md`, or `GEMINI.md` [GitHub Docs][gh-response]. For agent-driven work, I prefer `AGENTS.md` because GitHub's cloud agent and Copilot CLI both recognize that filename [GitHub support matrix][gh-support].

## What `AGENTS.md` actually does

`AGENTS.md` gives an agent the boring but essential context before you type a prompt: how to test, what to avoid, and which conventions are real. VS Code also makes one limitation explicit: custom instructions influence chat and agent flows, not inline completions in the editor [VS Code Docs][vscode-custom].

That changes the conversation. Instead of retyping "run the documented test command" or "ask before adding a dependency," you store the rule once and stop babysitting the prompt.

## Start with one root file

The safest default is a single `AGENTS.md` at the repository root. GitHub says Copilot agents can use `AGENTS.md` files anywhere in a repository and choose the nearest one, but the same setup guide points out that subfolder `AGENTS.md` support in VS Code is still off by default today [GitHub setup guide][gh-setup].

So I would not get fancy on day one. One root file gives you most of the value, and you can split it later if one part of the project genuinely needs different rules.

## Making the file portable

This is where the topic gets a little annoying. Codex reads `AGENTS.md` files directly and merges broader guidance with closer overrides [OpenAI Docs][openai-agents]. Claude Code does not read `AGENTS.md` by itself. Its docs recommend a `CLAUDE.md` that imports `AGENTS.md`, or a symlink if you do not need Claude-specific notes [Claude Code Docs][claude-memory].

I prefer the import. It is less clever than a symlink, and "less clever" ages beautifully.

This is the smallest `AGENTS.md` I would actually ship.

```markdown
# AGENTS.md

## Working rules

- Run the documented test command before you finish a change.
- Ask before adding a new runtime dependency.
- Update docs when public behavior changes.
```

If you also use Claude Code, add a tiny compatibility file so both tools read the same source of truth.

```markdown
# CLAUDE.md

@AGENTS.md

## Claude Code

- Use plan mode for larger refactors.
```

## What to write in it

Anthropic recommends keeping `CLAUDE.md` concise and human-readable, and that advice carries over nicely here too [Anthropic guide][anthropic-claude-md]. A good `AGENTS.md` should read like instructions a senior teammate would leave for future-you, not like a corporate wall poster.

This template is generic on purpose, so you can steal the shape without inheriting somebody else's baggage.

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

If a rule only matters for one slice of the repository, that is your cue to use a path-scoped instructions file or a nested `AGENTS.md`, not to turn the root file into a junk drawer.

## Resources

- [GitHub Docs on Copilot response customization][gh-response]
- [GitHub Docs on repository custom instructions and support matrices][gh-support]
- [VS Code Docs on custom instructions][vscode-custom]
- [OpenAI Docs on `AGENTS.md` in Codex][openai-agents]
- [Claude Code Docs on memory and `CLAUDE.md`][claude-memory]
- [Anthropic's guide to `CLAUDE.md`][anthropic-claude-md]

[gh-response]: https://docs.github.com/en/copilot/concepts/about-customizing-github-copilot-chat-responses
[gh-support]: https://docs.github.com/en/copilot/reference/custom-instructions-support
[vscode-custom]: https://code.visualstudio.com/docs/copilot/customization/custom-instructions
[gh-setup]: https://docs.github.com/en/copilot/how-tos/configure-custom-instructions-in-your-ide/add-repository-instructions-in-your-ide?tool=vscode
[openai-agents]: https://developers.openai.com/codex/guides/agents-md
[claude-memory]: https://code.claude.com/docs/en/memory
[anthropic-claude-md]: https://claude.com/blog/using-claude-md-files
