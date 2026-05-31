---
id: structure-of-a-good-prompt
order: 2
difficulty: beginner
tags: [prompting, tokens, llm]
publishedAt: 2026-12-31
updatedAt: 2026-05-31
---

The blank chat box is a trap. It makes it look like one messy paragraph will do, then you wonder why the model confidently answers the question you meant to ask, not the one you actually wrote.

If you want a beginner-safe default, I'd use four parts almost every time: the **task**, the **context**, the **constraints**, and the **output**. It's not holy scripture, but it's very close to the habits [OpenAI's guide](https://platform.openai.com/docs/guides/prompt-engineering) recommends when you want more reliable results. Most tutorials skip structure and jump straight to clever wording, which is exactly why prompting feels random at first.

### 1. Start with the task

Lead with the job to be done. If the model has to guess whether you want an explanation, a rewrite, a checklist, or an opinion, you have already made the task harder than it needs to be.

I like writing the task as a verb: explain, compare, summarize, classify, rewrite, brainstorm. Verbs force clarity. "Help with this" feels friendly, but it tells the model almost nothing. [Anthropic's best practices](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/claude-prompting-best-practices) make the same point in a more polite tone: be explicit about scope, because the model will usually follow what you literally asked for.

### 2. Add the context it cannot invent responsibly

Context is the background information the model should rely on: audience, domain, source text, business goal, or anything else that changes what a good answer looks like. [Azure's components](https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/prompt-engineering) split prompts into instructions plus the content the model must work from, which is a useful way to think about it.

If you're asking for copy, say who it is for. If you're asking for code, say the language and the environment. If you're asking for feedback, say what "good" means. The model can fill in blanks, sure, but that is exactly the risky part: it fills them with plausible guesses.

### 3. State constraints before the model improvises

Constraints are your guardrails: length, tone, must-have points, things to avoid, or boundaries like "don't invent data." Beginners often add these only after a bad answer. I'd rather state them upfront and save the back-and-forth.

This simple skeleton is the one I come back to most often.

```text
Task:
Context:
Constraints:
Output:
```

When I want fewer avoidable mistakes, I mentally expand that skeleton into a fuller checklist. Task / context / constraints / output do most of the work. Role and examples are optional, but they are often the difference between a decent answer and one you can actually reuse.

| Component     | Purpose                                                         | Bad Example                 | Good Example                                                    |
| ------------- | --------------------------------------------------------------- | --------------------------- | --------------------------------------------------------------- |
| Role          | Set the model's angle when expertise or stance matters.         | "Be smart."                 | "Act as a staff frontend engineer reviewing a pull request."    |
| Task          | Say what job must be done, ideally with a verb.                 | "Help me with caching."     | "Explain what caching is to a junior frontend developer."       |
| Context       | Provide the facts the model cannot invent responsibly.          | "You know the app already." | "This is a React SPA with slow product pages and no CDN."       |
| Constraints   | Add guardrails before the model improvises.                     | "Make it good."             | "Use under 150 words, avoid jargon, and do not invent metrics." |
| Output Format | Ask for the shape you want to receive.                          | "Answer however you want."  | "Return one short paragraph and then 3 bullet points."          |
| Examples      | Show the pattern when consistency matters more than creativity. | "You get the idea."         | "Use this format: issue → likely cause → next action."          |

### 4. Ask for a specific output

If you know the shape of the answer, ask for it. A paragraph, a bullet list, a table, JSON, three options ranked by confidence, whatever helps you use the result quickly. [Gemini's intro](https://ai.google.dev/gemini-api/docs/prompting-intro) explicitly recommends naming constraints and response format, and I'd follow that advice every time unless I truly do not care what the answer looks like.

Here's how the structure looks in a real beginner-friendly prompt.

```text
Task: Explain what caching is.
Context: The reader is a junior frontend developer.
Constraints: Use under 150 words, avoid jargon, include one analogy.
Output: One short paragraph followed by two bullet points titled "Why it helps".
```

My rule is simple: if the request matters or you know you'll be annoyed by a vague answer, write all four parts. If it's a throwaway prompt, be lazy on purpose and accept the mess.
