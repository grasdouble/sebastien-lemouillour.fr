---
id: intro-ia-generative
order: 1
difficulty: beginner
tags: [IA, LLM]
publishedAt: 2026-12-31
updatedAt: 2026-12-31
---

You copy-paste a customer complaint into ChatGPT and get a polished support reply in five seconds. Your designer friend types a vibe into Midjourney and gets something better than what took three hours in Figma last month. Different tools, different outputs, but the same disorienting feeling: software that creates, rather than software that obeys.

That shift is what generative AI is about. And if you're a developer, it's worth understanding what's actually happening under the hood before you start building on top of it.

## Not rules: learned patterns

Traditional software does exactly what you tell it to. A function that validates an email does not "understand" email: it matches a regex. Generative AI is different: instead of encoding rules, you train a model on massive amounts of examples until it learns patterns well enough to produce new ones.

The classic analogy is a jazz musician. After years of listening and playing, they don't improvise randomly: they draw on thousands of absorbed patterns and make something new from them. Generative models do the same thing, just with tokens instead of notes, and at a scale that makes the analogy feel almost quaint.

## What's an LLM, actually

An **LLM** (Large Language Model) is the engine behind ChatGPT, Claude, Gemini, and most of what you'll actually work with. It was trained on a huge corpus: books, articles, source code, web pages, and learned one thing: given some text, what comes next?

That sounds deceptively simple. It isn't.

Four concepts will explain 80% of what you observe when working with these models:

- **Token**: models don't process characters or words, they process tokens (roughly one word, sometimes a syllable, sometimes punctuation). Everything has a cost in tokens, which is why long prompts get expensive fast.
- **Context window**: the amount of text the model can "see" in one request. It's the model's working memory. Go beyond the limit and older content is gone. GPT-4o can handle roughly 300 pages at once, which sounds like a lot until you're trying to feed it an entire codebase.
- **Temperature**: the creativity dial. At 0, the model picks the most probable next token every time (predictable, slightly boring). At 1, it takes more risks (interesting, occasionally wrong). For anything factual or structured, I keep this below 0.5.
- **Prompt**: the instruction you send. This one matters more than people expect. The same model with a different prompt produces radically different results, which is why there's a whole discipline dedicated to it.

## What an API call actually looks like

The cleanest way to understand LLMs is to call one directly instead of going through a chat interface. You send a structured message, you get a text response. Here's the minimal version:

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

Three things worth noticing here:

- **`model`**: you pick which model handles the request. Capabilities and price vary significantly between models; don't default to the most powerful one for everything.
- **`messages`**: the conversation is a list. The `system` message is your standing instruction; the `user` message is what someone (or your code) is asking.
- **`temperature`**: 0.3 here because I want factual, consistent answers. For creative tasks I'd push it higher.

## The parts that will trip you up

This is the section I wish I'd read before shipping my first LLM feature.

**No memory between calls.** Every API call starts cold. If you're building a chatbot, you have to resend the entire conversation history in every request. The model doesn't remember the last message: it literally can't, by design. This gets expensive and requires careful management as conversations grow.

**Frozen training data.** The model knows nothing after its training cutoff. It can't tell you about your latest product update, yesterday's outage, or anything that happened after it was trained. If your use case needs current information, you'll need to inject it (which is what RAG is for).

**Hallucinations are real and dangerous.** The model generates the most plausible continuation of your prompt. "Plausible" and "true" are not the same thing. A confident, well-formatted answer can still be completely wrong. This isn't a bug they're going to fix: it's a fundamental property of how these models work. Design your system accordingly.

## Where to go from here

The guides that follow build on these foundations:

- **Prompt engineering**: most of the variance in output quality comes from how you phrase the instruction. This one's worth your time.
- **RAG**: how to connect an LLM to your own data so the frozen training cutoff stops being a blocker.
- **Agents**: how to give an LLM tools and let it take actions, not just produce text.
