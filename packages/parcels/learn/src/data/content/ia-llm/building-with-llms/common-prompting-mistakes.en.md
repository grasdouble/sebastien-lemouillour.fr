---
id: common-prompting-mistakes
order: 3
difficulty: beginner
tags: [LLM, prompting, pitfalls, iteration]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

You asked for a short answer and got a TED Talk. Then you added "be concise please," and somehow the next answer got even stranger. Welcome to beginner prompting.

Most bad prompts fail for boring reasons, not mystical ones. The recurring advice in [OpenAI's prompting guide](https://platform.openai.com/docs/guides/prompt-engineering), [Gemini's strategies](https://ai.google.dev/gemini-api/docs/prompting-strategies), and [Azure's prompt engineering docs](https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/prompt-engineering) is refreshingly unglamorous: be specific, reduce ambiguity, and iterate on the prompt instead of hoping the model will rescue a fuzzy request.

### Mistake 1: asking for vibes instead of a task

"Make this better" is not really a task. Better how, for whom, and by what standard? The model will happily invent a goal if you do not provide one.

I almost always rewrite vague requests into verbs. "Rewrite this email to sound warmer." "Summarize this article for a CTO." "Classify these tickets by urgency." Verbs give the model something concrete to optimize for.

### Mistake 2: hiding the important context in your head

Beginners know the missing detail, but the model does not. You may know the audience is a non-technical client, that the deadline is tomorrow, or that legal tone is required. If you keep that context in your own head, the output will drift.

### Mistake 3: stacking too many goals at once

One of my least favorite prompts looks like this: explain, summarize, critique, and rewrite the text, make it funny, and keep it formal. Technically, the model can try. Practically, you get mush.

This kind of rewrite usually fixes more than three follow-up messages ever will.

```text
Weak prompt:
Review this landing page copy and improve it.

Better prompt:
Review this landing page copy for clarity and trust.
Audience: first-time SaaS buyers.
Give exactly 3 issues, then rewrite the headline and subheading.
Do not change the product positioning.
```

### Mistake 4: treating the first answer as final

The first reply is often a draft, not a verdict. Prompting is iterative, which just means you refine the instruction based on what came back. That is normal, not a sign that you are doing it wrong.

What I would not do is argue with the model in circles. After two muddy replies, I prefer rewriting the whole prompt from scratch. It is faster, and honestly less annoying.

### Mistake 5: forgetting the output format

If you need bullets, say bullets. If you need JSON, ask for JSON. If you need one sentence, say one sentence. People skip this because it feels obvious. It is obvious to you, not to the model.

My rule of thumb is blunt: if a prompt produces two confusing answers in a row, stop patching it with tiny follow-ups and rewrite it with a clear task, real context, and an explicit format. If you want the simplest version of that approach, the next guide starts with zero-shot prompting, which is where I would begin most of the time.
