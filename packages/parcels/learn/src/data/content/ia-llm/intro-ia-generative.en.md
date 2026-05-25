## What is Generative AI?

Generative AI refers to models capable of producing original content (text, images, code, audio) from a prompt. These models are trained on large quantities of data and learn to model the statistical distribution of that data.

## Large Language Models (LLMs)

An LLM (Large Language Model) is a transformer neural network trained on billions of tokens. GPT-4, Claude, Gemini and Llama are examples. They can reason, summarize, translate and generate code.

### Key concepts

- Token: basic unit of text processing (approximately 4 characters)
- Context window: maximum number of tokens the model can process at once
- Temperature: parameter controlling the creativity of the model (0 = deterministic, 1 = creative)
- Prompt engineering: the art of crafting effective instructions

## Example: calling an LLM via API

```typescript
const response = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: 'Explain LLMs in 3 sentences.' }],
  }),
});
const data = await response.json();
console.log(data.choices[0].message.content);
```
