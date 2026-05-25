## What is Generative AI?

Generative AI refers to models capable of producing original content (text, images, code, audio) from a prompt. These models are trained on large quantities of data and learn to model the statistical distribution of that data. Unlike rule-based systems, they do not follow explicit instructions — they infer patterns from examples.

## Large Language Models (LLMs)

An LLM (Large Language Model) is a transformer neural network trained on billions of tokens. GPT-4o, Claude 3.5 Sonnet, Gemini 1.5 Pro and Llama 3 are examples. They can reason, summarize, translate and generate code.

### Key concepts

- **Token**: basic unit of text processing (approximately 4 characters or ¾ of a word)
- **Context window**: maximum number of tokens the model can process at once (e.g. 128 k tokens for GPT-4o)
- **Temperature**: parameter controlling the creativity of the model (0 = deterministic, 1 = creative)
- **Top-p / Top-k**: sampling strategies that constrain the set of candidate tokens at each step
- **Prompt engineering**: the art of crafting effective instructions to guide the model
- **Inference**: the process of running a trained model to generate output

## How does a transformer work?

A transformer relies on a self-attention mechanism: each token in the input can "attend" to all other tokens, allowing the model to capture long-range dependencies. The model processes all tokens in parallel (unlike RNNs, which process them sequentially), which explains both its speed and its ability to handle long contexts.

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

## Embeddings and RAG

LLMs are stateless — they do not retain information between calls. To give them access to your own data, two common patterns exist:

- **Fine-tuning**: re-train the model on your dataset (expensive, rarely needed)
- **RAG (Retrieval-Augmented Generation)**: at query time, retrieve relevant documents from a vector database and inject them into the context

```text
User query → Embed query → Search vector DB → Inject top-K chunks → LLM → Answer
```

Popular vector databases: Pinecone, Weaviate, pgvector (PostgreSQL extension).
