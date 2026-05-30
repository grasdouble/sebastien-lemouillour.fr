---
id: intro-ia-generative
order: 1
difficulty: beginner
tags: [IA, LLM]
publishedAt: 2026-05-20
updatedAt: 2026-05-30
---

You copy-paste a customer complaint into ChatGPT and get a polished support reply in five seconds. Your designer friend types a vibe into Midjourney and gets something better than what took three hours in Figma last month. Different tools, different outputs, but the same disorienting feeling: software that creates, rather than software that obeys.

That feeling is exactly why generative AI matters. If you're a developer, you do not need to master the math on day one, but you should know what kind of machine you're dealing with before you build on top of it.

## Not rules, patterns

Traditional software does exactly what you tell it to. A function that validates an email does not "understand" email: it matches a regex. Generative AI works differently. Instead of encoding rules by hand, you train a model on huge amounts of examples until it learns patterns well enough to produce new ones.

The jazz-musician analogy still helps me here. After years of listening and playing, a musician does not improvise randomly. They draw on patterns they absorbed and assemble something new. Generative models do something similar with text, images, audio, or code.

## What's an LLM, actually?

An **LLM** (Large Language Model) is the engine behind [ChatGPT](https://openai.com/chatgpt/overview/), [Claude](https://docs.anthropic.com/en/docs/intro-to-claude), [Gemini](https://ai.google.dev/gemini-api/docs/models), and most of what you'll actually work with. It was trained on a huge corpus of text and learned a deceptively simple task: given some text, what is the most likely next piece?

If that still feels a bit abstract, do not worry. It usually clicks once you see the few moving parts that shape every answer.

Four concepts explain most of what you will observe in practice:

- **Token**: models do not process characters or whole words, they process token pieces. [OpenAI tokenizer](https://platform.openai.com/tokenizer) makes this easier to see. Everything has a cost in tokens, which is why long prompts get expensive fast.
- **Context window**: the amount of text the model can "see" in one request. It is the model's working memory for that call. [OpenAI models](https://platform.openai.com/docs/models) lists GPT-4o with a 128K-token context window, which is a rough mental model of a few hundred pages of plain text. It sounds huge until you try to feed it a full codebase.
- **Temperature**: the creativity dial. At 0, the model sticks closer to the most likely next token. Higher values make the output more varied. For factual or structured tasks, I usually keep it low.
- **Prompt**: the instruction you send. This matters more than most beginners expect. The same model with a different prompt can behave very differently, which is why prompt writing is a real skill.

## What an API call actually looks like

The fastest way to make this concrete is to call a model yourself instead of staying inside a chat UI. The [Chat Completions API](https://platform.openai.com/docs/api-reference/chat/create) is enough to see the shape: you send structured messages, you get text back.

```typescript
const response = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: 'You are a concise technical assistant.' },
      { role: 'user', content: 'Explain LLMs in 3 sentences.' },
    ],
    temperature: 0.3,
  }),
});
const data = await response.json();
console.log(data.choices[0].message.content);
```

Three things matter immediately here:

- **`model`**: you choose which model handles the request. Capabilities, latency, and price vary a lot, so I would not default to the biggest model for every job.
- **`messages`**: the conversation is a list. The `system` message sets the behavior. The `user` message is what someone, or your code, is asking.
- **`temperature`**: 0.3 is a reasonable default when you want answers that stay stable. For brainstorming, I would push it higher.

## The parts that usually trip people up

These are the limits I wish someone had made painfully clear to me earlier.

**No built-in memory between plain API calls.** Each request starts from what you send in that request. If you are building a chatbot, you usually need to resend the conversation history yourself. That gets expensive as threads grow.

**Freshness is your job.** The model cannot know about your newest product change, yesterday's outage, or a private document unless that information is in training data or you provide it in the prompt, retrieval layer, or tool call.

**Hallucinations are normal behavior, not a weird edge case.** The [GPT-4 technical report](https://cdn.openai.com/papers/gpt-4.pdf) is a good reminder that these systems can produce confident but false output. I treat model answers as draft material until I have checked anything important.

## Where I'd go next

If I were starting today, I would learn prompting first because it is the cheapest lever. I would add RAG as soon as freshness matters, and I would only reach for agents once a plain prompt plus retrieval stops being enough. My rule of thumb is simple: if the answer would be expensive to get wrong, verify it before you trust it.
