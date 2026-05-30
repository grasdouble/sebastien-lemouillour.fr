---
id: structure-of-a-good-prompt
order: 2
difficulty: beginner
tags: [LLM, prompting, instructions, context]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

The blank chat box is a trap. It makes it look like one messy paragraph will do, then you wonder why the answer rambles right back at you.

A good prompt usually needs four parts: the **task** you want done, the **context** the model needs, the **constraints** that keep it on track, and the **output format** you expect. That pattern lines up with [OpenAI's prompting guide](https://platform.openai.com/docs/guides/prompt-engineering), [Azure's prompt engineering docs](https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/prompt-engineering), and [Anthropic's overview](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview). Most tutorials skip structure and jump straight to clever wording, which is exactly why prompting feels random to beginners.

### 1. Start with the task

Lead with the job to be done. If the model has to guess whether you want an explanation, a rewrite, a checklist, or an opinion, you have already made the task harder than it needs to be.

I like writing the task as a verb: explain, compare, summarize, classify, rewrite, brainstorm. Verbs force clarity. "Help with this" feels friendly, but it tells the model almost nothing.

### 2. Add the context it cannot invent

Context is the background information the model should rely on: audience, domain, source text, business goal, or anything else that changes what a good answer looks like. This is the part most people underwrite.

If you're asking for copy, say who it is for. If you're asking for code, say the language and the environment. If you're asking for feedback, say what "good" means. The model can generate missing details, but that is exactly the problem: it will generate them, not discover them.

### 3. State constraints before the model improvises

Constraints are your guardrails: length, tone, must-have points, things to avoid, or boundaries such as "don't invent data." Beginners often add these only after a bad answer. I would rather state them upfront and save the back-and-forth.

This simple skeleton is the one I come back to most often.

```text
Task:
Context:
Constraints:
Output:
```

### 4. Ask for a specific output

If you know the shape of the answer, ask for it. A paragraph, a bullet list, a table, JSON, three options ranked by confidence, whatever helps you use the result quickly. Output format is boring compared to "prompt hacks," but boring wins.

Here's how the structure looks in a real beginner-friendly prompt.

```text
Task: Explain what caching is.
Context: The reader is a junior frontend developer.
Constraints: Use under 150 words, avoid jargon, include one analogy.
Output: One short paragraph followed by two bullet points titled "Why it helps".
```

You do not need all four parts every time, but if a prompt keeps failing, this is the first checklist I use. My rule: if the request matters, make the task, context, constraints, and output visible on purpose. If you want to see what happens when one of those pieces is missing, the next guide is full of the mistakes people make every day.
