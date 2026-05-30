---
id: what-is-a-prompt
order: 1
difficulty: beginner
tags: [LLM, prompting, prompts]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

You've typed something into ChatGPT, hit enter, and gotten an answer so vague it was useless. That's usually not a model problem. It's a prompt problem.

A **prompt** is the text you give a language model so it knows what job to do. That can include an instruction, background information, constraints, examples, and the format you want back. Providers keep repeating the same advice in [OpenAI's prompting guide](https://platform.openai.com/docs/guides/prompt-engineering), [Anthropic's overview](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview), and [Gemini's strategies](https://ai.google.dev/gemini-api/docs/prompting-strategies): be clear, give context, and show the shape of the answer when it matters.

What beginners usually miss is this: a prompt is not a magic spell. The model is not waiting for one secret phrase. It is reading the text you provide as **context**, the information available before it starts generating a reply. If the context is fuzzy, the answer will usually be fuzzy too.

### A prompt is closer to a brief than a keyword

People often start with something like "marketing ideas" or "explain APIs." That feels natural because search engines trained us to type fragments. A chat model behaves differently. It is better at following a brief than guessing your unstated goal.

Here's the contrast I would show anyone on day one.

```text
Weak prompt:
Explain APIs.

Better prompt:
Explain what an API is to a beginner web developer in under 120 words.
Use one real-world analogy and end with one common mistake to avoid.
```

The second version works better because it answers the questions the model cannot safely guess on its own: audience, length, and outcome. I would choose this style every time unless I truly do not care what shape the answer takes.

### Small details change the result a lot

A prompt can ask for tone, format, level of depth, or boundaries. "Give me three options" is different from "pick the best option and justify it." "Summarize this" is different from "summarize this for a busy manager who has not read the original."

That sensitivity is why prompting feels weird at first. You are not programming in the classic sense, but you are still specifying behavior. Don't worry if this feels abstract. It clicked for me once I started treating the model like a very fast intern: helpful, capable, and absolutely unable to read my mind.

### The useful mental model

If the output is bad, check four things before blaming the model: what task you asked for, what context you supplied, what constraints you set, and what format you requested. Most beginner prompting improves the moment those four become explicit.

So my rule is simple: when an answer feels off, rewrite the prompt before you switch models. If you want a practical way to do that, the next guide is the one I would read immediately, because structure beats clever wording almost every time.
