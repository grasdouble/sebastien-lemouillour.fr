---
id: what-is-a-prompt
order: 1
difficulty: beginner
tags: [prompting, llm]
publishedAt: 2026-12-31
updatedAt: 2026-05-31
---

You've typed something into ChatGPT, hit enter, and gotten an answer so vague it was useless. Most of the time, that is not the model being dumb. It is the prompt being lazy.

A **prompt** is the input, usually text, that tells a language model what job to do. That input can include an instruction, background information, constraints, examples, and the format you want back. [OpenAI's guide](https://platform.openai.com/docs/guides/prompt-engineering), [Anthropic's overview](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview), and [Gemini's strategies](https://ai.google.dev/gemini-api/docs/prompting-strategies) all push the same useful recipe: say what you want, add the missing context, show examples when precision matters, and ask for the output shape you actually need.

What beginners usually miss is this: a prompt is not a magic spell. The model is not waiting for one secret phrase. It is reading whatever you give it as **context**, meaning the information available before it starts generating a reply. If that context is fuzzy, the answer is usually fuzzy too.

### A prompt is closer to a brief than a keyword

People often start with something like "marketing ideas" or "explain APIs." That feels natural because search engines trained us to type fragments. A chat model behaves differently. It is much better at following a brief than guessing your unstated goal.

This is the contrast I would show anyone on day one.

```text
Weak prompt:
Explain APIs.

Better prompt:
Explain what an API is to a beginner web developer in under 120 words.
Use one real-world analogy and end with one common mistake to avoid.
```

The second version wins because it answers the questions the model cannot safely guess on its own: audience, length, and outcome. I would write prompts this way almost every time unless I truly do not care what shape the answer takes.

### Small details change the result a lot

A prompt can ask for tone, format, level of depth, or boundaries. "Give me three options" is not the same request as "pick the best option and justify it." "Summarize this" is not the same job as "summarize this for a busy manager who has not read the original."

That sensitivity is why prompting feels weird at first. You are not programming in the classic sense, but you are still specifying behavior. Don't worry if this feels abstract. It clicked for me once I started treating the model like a very fast intern: helpful, capable, and absolutely unable to read my mind.

### The useful mental model

If the output is bad, check four things before blaming the model: the task you asked for, the context you supplied, the constraints you set, and the format you requested. Beginner prompting usually improves the moment those four become explicit.

My rule of thumb is boring on purpose: rewrite the prompt twice before blaming the model. If two rewrites still produce mush, you probably do not need cleverer wording. You need better context, a better example, or a different tool.
