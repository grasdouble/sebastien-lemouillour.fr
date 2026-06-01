---
id: common-prompting-mistakes
order: 3
difficulty: beginner
tags: [prompting, llm]
publishedAt: 2026-06-08
updatedAt: 2026-06-08
---

You asked for a short answer and got a wall of text. Then you asked for something concise, and the next reply somehow got weirder. If that keeps happening, the model is not being dramatic, it is guessing.

The reassuring part is that the official docs mostly agree. The [OpenAI guide](https://platform.openai.com/docs/guides/prompt-engineering), [Gemini guide](https://ai.google.dev/gemini-api/docs/prompting-strategies), and [Azure guide](https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/prompt-engineering) all push the same habit: give the model a clear task, the context it cannot infer, and limits it can actually follow.

Think of the model like a new teammate reading a sticky note. It can help a lot, but it cannot read your mind.

Here is the fast diagnostic I reach for when a prompt keeps producing fluff instead of useful work.

| Mistake                           | Why it fails                                                                                  | Better approach                                                                              |
| --------------------------------- | --------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Too vague                         | The model has to guess what "better" means, so it invents its own target.                     | Use an action verb and a goal: `Rewrite this email to sound warmer for a hesitant prospect.` |
| Missing context                   | The answer drifts because the audience, stakes, or constraints never made it into the prompt. | Add the real setup: audience, deadline, tone, product, or decision criteria.                 |
| Asking for five things at once    | Competing goals produce muddy output that is half-summary, half-rewrite, half-chaos.          | Split the work into steps or rank priorities: analysis first, rewrite second.                |
| No output format                  | Even a good answer becomes annoying if it comes back in the wrong shape.                      | Ask for bullets, a table, JSON, or `exactly 3 suggestions` up front.                         |
| No examples                       | Abstract instructions leave too much room for interpretation.                                 | Show a short example of the tone, structure, or label format you want.                       |
| Role not set                      | The model defaults to a generic assistant voice, which is often too broad.                    | Set a useful role: `Act as a support triage assistant for a SaaS team.`                      |
| Treating the first reply as final | The first draft is often directionally right but operationally messy.                         | Iterate once or twice, then rewrite the prompt instead of patching endlessly.                |

### Mistake 1: asking for a mood instead of a task

"Make this better" sounds clear in your head, but it leaves the model to invent the goal. Better for whom? Better by what standard?

Your safest move is to turn the request into a verb plus a target. "Rewrite this message to sound calmer for an upset customer." "Summarize this article for a non-technical manager." "Classify these support tickets by urgency." I would strongly pick that version every time.

### Mistake 2: keeping the useful context in your head

Beginners often know the missing detail and forget to write it down. The audience, deadline, tone, and hard limits stay in their head, so the answer drifts.

When the task depends on a perspective, name it. A role is simply the job you want the model to act like, such as a recruiter, teacher, or support agent. The [Anthropic guide](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/claude-prompting-best-practices) also leans on explicit instructions and examples for exactly this reason.

### Mistake 3: asking for too many jobs at once

A prompt that says "explain, summarize, critique, rewrite, and make it funny" is a bit like asking one person to be the editor, comedian, and lawyer in the same minute. The model may attempt it, but the result usually turns into soup.

Here is the kind of rewrite that often saves three frustrating follow-up messages.

```text
Weak prompt:
Review this page and improve it.

Better prompt:
Review this page copy for clarity and trust.
Audience: first-time software buyers.
Give exactly 3 issues.
Then rewrite the headline and subheading.
Do not change the product promise.
```

This works because the task is narrow, the audience is named, and the output has a limit.

### Mistake 4: forgetting to name the output shape

Even a useful answer is annoying when it arrives in the wrong format. If you need bullets, ask for bullets. If you need JSON, which is a text format other tools can read reliably, ask for JSON. If you need exactly three suggestions, say exactly three.

That is the same idea behind [Structured Outputs](https://platform.openai.com/docs/guides/structured-outputs): when your app needs a predictable schema, meaning a fixed structure with named fields, ask for that schema instead of hoping the model guesses the shape.

### Mistake 5: treating the first reply as the final one

Prompting is iterative, which simply means you look at the first draft, spot what is off, and tighten the instruction. That is normal, not a sign you are bad at this.

My stance is simple: do one or two clean rewrites, then stop patching. If the model is still missing the target after the second rewrite, reset the prompt instead of stacking more tweaks.
