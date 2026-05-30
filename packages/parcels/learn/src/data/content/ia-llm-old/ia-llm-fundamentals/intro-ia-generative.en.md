---
id: intro-ia-generative
order: 1
difficulty: beginner
tags: [IA, LLM]
publishedAt: 2026-05-20
updatedAt: 2026-05-30
---

You copy-paste a customer complaint into ChatGPT and get a polished support reply in five seconds. Your designer friend types a vibe into an image generator and gets something usable before you have even finished your coffee. Different tools, different outputs, but the same unsettling feeling: software that creates, rather than software that obeys.

That feeling is exactly why generative AI matters. If you're a developer, you do not need the math on day one, but you do need a reliable mental model before you build anything serious with it.

## Not rules, patterns

Traditional software does exactly what you tell it to. A function that validates an email does not "understand" email: it matches a regex. Generative AI works differently. Instead of encoding rules by hand, you train a model on huge amounts of examples until it learns patterns well enough to produce new ones.

The jazz-musician analogy still helps me here. After years of listening and playing, a musician does not improvise randomly. They draw on patterns they absorbed and assemble something new. Generative models do something similar with text, images, audio, or code.

## What's an LLM, actually?

An **LLM** (Large Language Model) is the part that generates text in tools like ChatGPT, Claude, or Gemini. In plain language, it keeps predicting what text should come next.

If that still feels abstract, do not worry. It usually clicks once you see the few moving parts that shape every answer.

Four concepts explain most of what you will notice in practice:

- **Token**: models process text in chunks called [tokens](https://developers.openai.com/api/docs/concepts). Long prompts get expensive because both your input and the model's output are counted.
- **Context window**: the amount of text the model can "see" in one request. It is the model's working memory for that call. On the current [GPT-4o](https://developers.openai.com/api/docs/models/gpt-4o) page, OpenAI lists a 128K-token context window.
- **Temperature**: the [temperature](https://developers.openai.com/api/docs/api-reference/responses/create) setting controls randomness. Lower values make output more consistent. Higher values make it more varied. For factual or structured work, I keep it low.
- **Prompt**: the instruction you send. This matters more than most beginners expect. The same model with a different prompt can behave very differently, which is why prompt writing is a real skill.

## What an API call actually looks like

The quickest way to make this feel real is to send one request yourself. OpenAI now recommends the [Responses API](https://developers.openai.com/api/docs/guides/text-generation) for new text-generation apps, so that is the shape I would learn first.

```typescript
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const response = await client.responses.create({
  model: 'gpt-4o',
  instructions: 'You are a concise technical assistant.',
  input: 'Explain LLMs in 3 sentences.',
  temperature: 0.3,
});

console.log(response.output_text);
```

Four things matter immediately here:

- **`model`**: you choose which model handles the request. Capabilities, latency, and price vary a lot, so I would not default to the biggest model for every job.
- **`instructions`**: this is where you set the assistant's behavior.
- **`input`**: this is the actual task or question you want answered.
- **`temperature`**: 0.3 is a reasonable starting point when you want answers that stay stable. For brainstorming, I would push it higher.

## The parts that usually trip people up

These are the limits I wish someone had made painfully clear to me earlier.

**No automatic memory unless you ask for it.** A plain request is stateless. If you want continuity, you either resend prior turns or use [conversation state](https://developers.openai.com/api/docs/guides/conversation-state).

**Freshness is still your job.** The model will not magically know your latest deploy, yesterday's outage, or a private handbook. If you need current or private facts, you have to pass them in, often through [file search](https://developers.openai.com/api/docs/guides/tools-file-search) or your own retrieval step, meaning a layer that fetches useful documents for the model.

**Hallucinations are normal behavior, not a weird edge case.** The official [GPT-4 report](https://cdn.openai.com/papers/gpt-4.pdf) is still the right reminder: these systems can sound sure and still be wrong. I treat model output as draft material until I have checked anything important.

## Where I'd go next

If I were starting today, I would learn prompting first because it is the cheapest lever. I would add retrieval as soon as freshness matters, and I would only reach for agents once a plain prompt plus retrieval stops being enough. My rule is simple: if the cost of a mistake is high, verify before you trust. If this already clicks, the next guide I would read is the one on prompting.
