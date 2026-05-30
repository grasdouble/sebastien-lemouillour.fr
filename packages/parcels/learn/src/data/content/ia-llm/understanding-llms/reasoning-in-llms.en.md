---
id: reasoning-in-llms
order: 19
difficulty: intermediate
tags: [LLM, raisonnement]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

The most annoying LLM failure mode is not nonsense. It is a polished, step-by-step answer that feels convincing and is still wrong. That is why I do not treat “reasoning” as a vibe or a marketing badge. I treat it as a capability you have to buy, prompt, and verify carefully.

## Reasoning is not one switch

A model reasons well when three things line up: the base model has the latent capability, the prompt exposes the task structure, and the runtime budget lets the model explore enough intermediate steps. The original [chain-of-thought](https://arxiv.org/abs/2201.11903) paper showed that large models can improve on multi-step tasks when prompted to produce intermediate reasoning. That result mattered, but it also created a bad habit: people started asking every model to “think step by step” whether the task needed it or not.

I would not do that by default. Long visible reasoning increases token usage, latency, and review cost. On APIs that meter output tokens aggressively, that cost is immediate. On sensitive workflows, it can also expose intermediate thoughts you did not actually want to store or show.

## What prompting actually buys you

Prompting helps most when the task is decomposable and the answer can be checked. The [self-consistency](https://arxiv.org/abs/2203.11171) result is a good example: sample multiple reasoning paths, then pick the consensus answer. Expensive? Yes. Useful for math, symbolic tasks, and structured decision problems? Also yes.

When the task needs external evidence or action, I prefer the [ReAct](https://arxiv.org/abs/2210.03629) pattern over pure internal reasoning. Make the model reason a bit, call a tool, inspect the result, then continue. That is usually more reliable than paying for a longer monologue detached from reality.

Provider behavior matters too. OpenAI’s [reasoning guide](https://platform.openai.com/docs/guides/reasoning) and Anthropic’s [extended thinking](https://docs.anthropic.com/en/docs/build-with-claude/extended-thinking) both make the tradeoff explicit: more reasoning budget can improve quality, but it also increases latency and cost. That matches real usage. You feel the tax quickly on high-volume workloads.

## What I would choose in practice

For production flows, I prefer short visible answers plus either hidden reasoning support from the provider or explicit tool use that I can audit. I only ask for long natural-language reasoning when the reasoning itself is part of the deliverable, like tutoring or worked examples.

I also do not confuse reasoning with knowledge. A model cannot reason its way to a missing fact. If the answer depends on a current price, a policy change, or a database row, the right fix is retrieval or tool access, not a fancier “think harder” prompt.

My rule: pay for extra reasoning only on tasks that are genuinely multi-step and externally checkable. Otherwise you are often buying longer guesses, not better decisions.
