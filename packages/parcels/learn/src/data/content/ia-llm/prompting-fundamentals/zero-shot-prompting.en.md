---
id: zero-shot-prompting
order: 4
difficulty: beginner
tags: [prompting, llm]
publishedAt: 2026-06-07
updatedAt: 2026-06-07
---

You ask for a short label, and the model sends back a tiny essay with opinions you never requested. That kind of wobble is common when you are starting out, and zero-shot prompting is the first fix I would try.

**Zero-shot prompting** means asking a model to do a task using instructions only, with no worked example in the prompt, which is how [Gemini](https://ai.google.dev/gemini-api/docs/prompting-strategies) introduces it. For a beginner, that is usually the calmest place to start because you can see what the instruction itself is doing.

### Why zero-shot is the default

For common tasks like summarizing, extracting fields, rewriting tone, or classifying obvious sentiment, a clear instruction often gets you far enough. [OpenAI](https://developers.openai.com/api/docs/guides/prompt-engineering) says GPT models benefit from explicit instructions about how to accomplish tasks, so I would spend effort on clarity before I start collecting examples.

The catch is simple: zero-shot does **not** mean zero context. The [Anthropic overview](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview) recommends defining success criteria before you tune prompts, and that advice saves beginners a lot of frustration. If you do not say who the answer is for, what to include, and what shape the output should take, the model fills the gaps on its own.

### What a good zero-shot prompt looks like

A **label** is just the short category name you want back, such as `positive` or `negative`. I like zero-shot because it stays readable. You can show it to a teammate and still recognize it as a normal instruction instead of a pile of prompt tricks.

Before the model can follow a format, you need to name that format in plain language.

```text
Classify the sentiment of this customer message as positive, neutral, or negative.
Reply with only one label.

Message:
"The new dashboard is easier to use, but exports still fail half the time."
```

This works because the task is narrow, the allowed labels are explicit, and the output format is constrained. [Research on prompting strategies](https://arxiv.org/abs/2102.07350) shows that explicit task definitions improve model reliability, and this prompt does exactly that.

### When zero-shot starts to wobble

Zero-shot gets shaky when the task depends on subtle style, custom labels, or edge cases, meaning awkward cases that sit near the boundary between two answers. "Classify this ticket as P1, P2, or P3" sounds simple until you notice that every team defines those labels a little differently.

I take a clear stance here: do not keep stretching zero-shot once it starts missing the same pattern. What next: move to one-shot prompting if one clean example would settle the format, and move to few-shot prompting, where you provide a few examples, if the model misses the same kind of edge case twice.
