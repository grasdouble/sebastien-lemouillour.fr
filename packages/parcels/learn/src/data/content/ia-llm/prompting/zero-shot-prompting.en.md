---
id: zero-shot-prompting
order: 4
difficulty: beginner
tags: [prompting, llm]
publishedAt: 2026-12-31
updatedAt: 2026-05-31
---

Sometimes you just need the model to stop being clever and do the job. No dataset, no curated examples, no afternoon to burn tuning prompts. Zero-shot is the first thing I would try.

**Zero-shot prompting** is simply asking the model to perform a task with instructions alone, without putting a worked example in the prompt, which is exactly how the [Gemini guide](https://ai.google.dev/gemini-api/docs/prompting-strategies) presents it. If you are a beginner, starting here is usually the least annoying choice.

### Why zero-shot is the default

For common tasks like summarizing, extracting fields, rewriting tone, or classifying obvious sentiment, a clear instruction gets you surprisingly far. That bias is built into current API guidance too: OpenAI explicitly says GPT models benefit from more explicit instructions about how to accomplish tasks in its [OpenAI guide](https://developers.openai.com/api/docs/guides/prompt-engineering).

The catch is that zero-shot does **not** mean zero context. Anthropic recommends defining your success criteria before you start tuning prompts in its [Anthropic overview](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview), and that advice matters a lot here. If you skip the audience, the boundary, or the output shape, the model will happily improvise. Sometimes that improvisation is useful. Sometimes it is chaos wearing a tie.

### What a good zero-shot prompt looks like

I like zero-shot because it stays readable. You can hand the prompt to a teammate and it still looks like a normal instruction, not a wizard spell somebody copy-pasted from a forum in 2023.

Here is the kind of prompt I would actually ship first.

```text
Classify the sentiment of this customer message as positive, neutral, or negative.
Reply with only one label.

Message:
"The new dashboard is easier to use, but exports still fail half the time."
```

This works because the task is narrow, the allowed labels are explicit, and the output format is constrained. Anthropic's [best practices](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/claude-prompting-best-practices) make the same point in a more polite way: clarity and concrete output guidance do a lot of the heavy lifting before you ever add examples.

### When zero-shot starts to wobble

Zero-shot gets shaky when the task depends on subtle style, custom labels, tricky edge cases, or rules that only make sense inside your team. "Classify this ticket as P1, P2, or P3" sounds easy until you realize every company has invented its own religion around priority levels.

My rule is simple: start zero-shot for common tasks, then switch to few-shot as soon as you need house labels, house tone, or the model misses the same edge case twice. That is usually the moment when keeping the prompt short stops being the smart choice.
