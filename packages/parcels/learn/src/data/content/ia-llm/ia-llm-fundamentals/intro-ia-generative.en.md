---
id: intro-ia-generative
order: 1
difficulty: beginner
tags: [IA, LLM]
---

## What is Generative AI?

Generative AI refers to systems capable of creating original content: text, images, code, audio. What sets them apart from traditional software is that they don't follow predefined rules — they have _learned_ from billions of examples.

Think of a musician who has listened to thousands of songs: they don't improvise at random, but draw on everything they have absorbed. Generative models work the same way, with text instead of notes.

## Large Language Models (LLMs)

An **LLM** (Large Language Model) is the type of model behind ChatGPT, Claude, or Gemini. Trained on billions of texts (books, articles, source code), it has learned to predict and generate coherent language.

### Four concepts to remember

- **Token** — text is split into small pieces called tokens (roughly one word or syllable). This is the model's processing unit.
- **Context window** — the amount of text the model can "see" at once. Beyond this limit, it forgets. GPT-4o can handle the equivalent of about 300 pages in a single request.
- **Temperature** — a slider between precision and creativity. At 0, the model is very predictable; at 1, it is more inventive but less reliable.
- **Prompt** — the message you send to give the model a task. How you phrase it directly impacts the quality of the response.

## How to interact with an LLM?

The most direct way is to call a provider's API (OpenAI, Anthropic, Google…). You send a structured message, you receive a text response.

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

Three key parameters to understand:

- **`model`** — which model to use (each model has different capabilities and costs)
- **`messages`** — the conversation: `system` defines the model's behavior, `user` contains your request
- **`temperature`** — set to 0.3 here for consistent, factual responses

## Key limitations to know

LLMs are powerful, but they come with important constraints to anticipate:

- **No persistent memory** — each API call starts fresh. The model has no memory of previous exchanges unless you retransmit the context.
- **Frozen data** — the model only knows what existed at training time. It has no real-time internet access (unless a tool is provided).
- **Hallucinations** — the model can generate plausible but false information. Always verify critical information before using it.

## What's next?

The following guides in this catalog go deeper:

- **Prompt engineering** — how to craft effective instructions to get better results
- **RAG** — how to connect an LLM to your own data to go beyond the frozen data limitation
- **Agents** — how to give tools and autonomy to an LLM so it can act in the real world
