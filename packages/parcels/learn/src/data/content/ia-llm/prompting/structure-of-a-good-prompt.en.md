---
id: structure-of-a-good-prompt
order: 2
difficulty: beginner
tags: [prompting, tokens, llm]
publishedAt: 2026-06-01
updatedAt: 2026-06-01
---

The blank chat box is sneaky. It invites you to type one fuzzy paragraph, then the model, meaning the AI system answering you, replies to the version it guessed instead of the one you meant.

A **prompt** is the instruction you send to that model. For a beginner-safe default, I recommend four parts: **task**, **context**, **constraints**, and **output**. That is not an official law, just a practical shortcut that lines up with the [OpenAI guide](https://developers.openai.com/api/docs/guides/prompt-guidance): describe the goal, share the useful evidence, state the constraints, and say what the final answer should contain. It makes prompting feel less like mind reading and more like filling out a short order form.

### 1. Start with the task

The **task** is the job you want done. Put it first. The [Anthropic guide](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/claude-prompting-best-practices) keeps coming back to clear instructions, and that matters because models usually follow the literal request you give them.

I like writing the task as a verb: explain, compare, summarize, classify, rewrite. "Help with this" sounds friendly, but it leaves too much guessing. If you are unsure which verb to use, ask yourself what a finished answer should let you do.

That fixes the first source of confusion, but a clear verb still does not tell the model which situation you mean.

### 2. Add the context it should rely on

If the task says what to do, **context** says what to trust. The [Azure guide](https://learn.microsoft.com/en-us/azure/foundry/openai/concepts/prompt-engineering) separates instructions from the content the model should work from, which is a helpful beginner mental model.

Say who the answer is for, what material the model should use, and what situation you are in. If you skip that, the model fills the gap with plausible guesses. Sometimes that is fine, but for anything important it is where confusion starts.

That removes a lot of guessing, but it still leaves room for answers that are too long, too vague, or too risky.

### 3. State the constraints before the model improvises

**Constraints** are the guardrails: length, tone, required points, banned moves, or limits such as "do not invent data." The [Gemini guide](https://ai.google.dev/gemini-api/docs/prompting-strategies) starts with clear and specific instructions, which is why I strongly recommend stating your limits and the format you want back whenever they matter.

This structure improves clarity, not truth. If your source text is weak or missing, a neat prompt can still produce a neat mistake.

Before you write the full request, this tiny skeleton gives you headings to fill in:

```text
Task:
Context:
Constraints:
Output:
```

When I want fewer avoidable mistakes, I mentally expand that skeleton. Task, context, constraints, and output do most of the work. Role and examples are optional, but they are often the difference between a decent answer and one you can actually reuse.

| Component     | Purpose                                                         | Bad Example                 | Good Example                                                    |
| ------------- | --------------------------------------------------------------- | --------------------------- | --------------------------------------------------------------- |
| Role          | Set the model's angle when expertise or stance matters.         | "Be smart."                 | "Act as a staff frontend engineer reviewing a pull request."    |
| Task          | Say what job must be done, ideally with a verb.                 | "Help me with caching."     | "Explain what caching is to a junior frontend developer."       |
| Context       | Provide the facts the model cannot invent responsibly.          | "You know the app already." | "This is a React SPA with slow product pages and no CDN."       |
| Constraints   | Add guardrails before the model improvises.                     | "Make it good."             | "Use under 150 words, avoid jargon, and do not invent metrics." |
| Output Format | Ask for the shape you want to receive.                          | "Answer however you want."  | "Return one short paragraph and then 3 bullet points."          |
| Examples      | Show the pattern when consistency matters more than creativity. | "You get the idea."         | "Use this format: issue → likely cause → next action."          |

### 4. Ask for a specific output

Even a useful answer becomes annoying if it comes back in a shape you cannot reuse. The **output** is the shape of the answer you want back: a paragraph, a table, or JSON, which is a text format with named fields and values. I have a strong preference here: if you already know how you want to use the answer, name the format. It saves far more time than it costs.

Before using the pattern in real work, it helps to see one filled-in example:

```text
Task: Explain what caching is.
Context: The reader is a junior web developer who has never studied performance.
Constraints: Use fewer than 150 words, avoid jargon, include one everyday analogy, and do not invent metrics.
Output: One short paragraph followed by two bullet points titled "Why it helps".
```

If this feels manageable, read **zero-shot prompting** next, then **prompt templates** when you start reusing the same structure. My rule is simple: once a prompt needs more than four fields or keeps getting copied around, stop polishing it and turn it into a template.
