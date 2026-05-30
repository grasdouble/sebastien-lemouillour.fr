---
id: copilot-custom-agents
order: 6
difficulty: advanced
tags: [copilot, custom-agents, ai-agents]
publishedAt: 2026-05-15
updatedAt: 2026-05-30
---

You know the feeling: you ask Copilot to think like an architect, code like a teammate, and nitpick like a reviewer, all in one prompt, then you get an answer that is a bit of all three and convincing at none of them.

Custom agents exist for exactly that mess. They let you turn a recurring role into a reusable specialist, so planning, implementation, and review stop fighting for the same slice of attention.

## An agent file is just a contract

In VS Code, custom agents are Markdown agent profiles with YAML frontmatter and a Markdown body. The [VS Code custom agents](https://code.visualstudio.com/docs/copilot/customization/custom-agents) guide also documents editor-specific extras such as `agents`, `handoffs`, and preview `hooks`, which matters when you want a workflow instead of a single persona.

The [configuration reference](https://docs.github.com/en/copilot/reference/custom-agents-configuration) is the part I keep open in another tab because the sharp edges live there: `name` is optional, `description` is the field Copilot uses to understand the role, omitting `tools` or using `tools: ["*"]` enables all available tools, `tools: []` disables them all, `infer` is deprecated, and fields such as `model`, `target`, `mcp-servers`, `user-invocable`, and `disable-model-invocation` change where the agent runs and who can invoke it.

I prefer starting with the most boring profile I can get away with, because boring files age better. This is usually enough to prove the role is real.

```markdown
---
name: architecture-reviewer
description: Review architecture proposals, explain trade-offs, and stay out of implementation details
tools: ['read', 'search']
---

You review architecture decisions.

Rules:

- Read only the code and docs needed to understand system boundaries
- Do not write production code
- For every recommendation, explain trade-offs, migration cost, and failure modes
- Call out missing constraints before suggesting a design
```

If you already feel tempted to add ten tools and three pages of instructions, that is usually the moment the agent stops being a role and becomes a junk drawer.

## Storage follows ownership

The CLI rule is simple: custom agents are `.agent.md` files, use `.github/agents` when the agent belongs to the project, use `~/.copilot/agents` when it belongs to you, and remember that a user-level file with the same filename overrides the project one, as the [CLI custom agents guide](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/create-custom-agents-for-cli) explains.

When you want the same idea to live on GitHub.com, the [cloud agent guide](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/cloud-agent/create-custom-agents) says the official flow creates repository agents in `.github/agents`, and organization or enterprise agents in an `agents/` directory at the root of the `.github-private` repository.

## Most custom agents should stay prompt files or instructions

GitHub's [feature comparison](https://docs.github.com/en/copilot/concepts/agents/copilot-cli/comparing-cli-features) is useful because it kills a common misconception: custom instructions tell Copilot how to behave in general, skills describe how to handle a class of tasks, and custom agents define specialized abilities that the main agent can delegate through subagents.

If a rule should load automatically in the CLI, the [instructions docs](https://docs.github.com/en/copilot/how-tos/copilot-cli/add-custom-instructions) send you to `.github/copilot-instructions.md`, `.github/instructions/*.instructions.md`, or `AGENTS.md`, not to a new agent file.

If the behavior is just a reusable manual entry point, a prompt file is lighter. [VS Code prompt files](https://code.visualstudio.com/docs/copilot/customization/prompt-files) are slash-command Markdown files, which is perfect when you want to run a task on demand without inventing a permanent teammate.

That last distinction matters more than the word "expert." Plenty of tasks sound specialized but are still just prompts. The real threshold is whether the agent needs different incentives, a smaller tool budget, or a narrower context than the default agent should have.

## The maintenance bill arrives later

A custom agent is not a tiny constitution you write once and frame on the wall. Tool names change, docs drift, MCP setups move, and yesterday's clever prompt quietly turns into today's bad habit.

Create a custom agent only when the role must intentionally see less, do less, or judge by different criteria. If you cannot explain that constraint in one sentence, do not build the agent yet, write a prompt file first and wait to see whether the pain comes back twice.
