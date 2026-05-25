---
id: llm-api-patterns
order: 3
difficulty: intermediate
tags: [IA, LLM, API]
---

## Streaming responses

Streaming improves perceived latency because you can render tokens as they arrive instead of waiting for the full answer. In practice, you send `stream: true` and read Server-Sent Events from the `ReadableStream` returned by `fetch`. This is useful for chat UIs, live summaries, or code generation where fast feedback matters.

Keep the API key on the server side, even if your frontend consumes the stream. The browser should call your backend, and your backend should call the LLM provider. That keeps secrets out of the client and gives you one place to enforce logging, quotas, and moderation.

```typescript
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY');
}

async function streamChatCompletion(prompt: string): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      stream: true,
      temperature: 0.2,
      messages: [
        { role: 'system', content: 'You are a concise technical assistant.' },
        { role: 'user', content: prompt },
      ],
    }),
  });

  if (!response.ok || !response.body) {
    throw new Error(`Streaming request failed with status ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let fullText = '';

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const events = buffer.split('\n\n');
    buffer = events.pop() ?? '';

    for (const event of events) {
      for (const line of event.split('\n')) {
        if (!line.startsWith('data: ')) continue;

        const payload = line.slice(6).trim();
        if (payload === '[DONE]') {
          return fullText;
        }

        const json = JSON.parse(payload) as {
          choices?: Array<{ delta?: { content?: string } }>;
        };

        const token = json.choices?.[0]?.delta?.content ?? '';
        if (token) {
          process.stdout.write(token);
          fullText += token;
        }
      }
    }
  }

  return fullText;
}

await streamChatCompletion('Explain SSE streaming for LLM APIs in 3 bullet points.');
```

Key parameters: `model` controls quality and cost, `stream: true` enables incremental delivery, and `temperature` keeps the answer stable. Always handle the case where the stream ends early or returns malformed chunks.

## Error handling

Production integrations fail for normal reasons: slow networks, temporary 429 rate limits, or requests that exceed the model context window. A robust client should use a timeout, classify retryable errors, and retry with exponential backoff. It should also stop retrying on permanent errors such as invalid credentials or an oversized prompt.

```typescript
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY');
}

type ChatCompletion = {
  choices: Array<{ message: { content: string } }>;
  error?: { message?: string };
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function createCompletionWithRetry(userPrompt: string): Promise<string> {
  const maxRetries = 4;

  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(20_000),
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          max_tokens: 300,
          messages: [{ role: 'user', content: userPrompt }],
        }),
      });

      const data = (await response.json()) as ChatCompletion;

      if (response.ok) {
        return data.choices[0]?.message.content ?? '';
      }

      if (response.status === 400 && /token|context length/i.test(data.error?.message ?? '')) {
        throw new Error('Prompt too large for the selected model. Trim context or choose a larger context window.');
      }

      if (response.status === 429) {
        const retryAfterHeader = response.headers.get('retry-after');
        const retryAfterMs = retryAfterHeader ? Number(retryAfterHeader) * 1_000 : 0;
        const backoffMs = Math.max(retryAfterMs, 500 * 2 ** attempt);
        await sleep(backoffMs);
        continue;
      }

      if (response.status >= 500 && attempt < maxRetries) {
        await sleep(500 * 2 ** attempt);
        continue;
      }

      throw new Error(data.error?.message ?? `Request failed with status ${response.status}`);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'TimeoutError' && attempt < maxRetries) {
        await sleep(500 * 2 ** attempt);
        continue;
      }

      throw error;
    }
  }

  throw new Error('Retries exhausted');
}

const answer = await createCompletionWithRetry('Summarize HTTP caching in 5 lines.');
console.log(answer);
```

Log status codes, retry count, and model name, but never log raw secrets or private prompts unless your policy explicitly allows it. If a request repeatedly hits token limits, fix the payload instead of hiding the problem behind more retries.

## Cost management

LLM cost is driven mostly by tokens: input tokens for what you send, output tokens for what the model generates. You should estimate cost before sending expensive prompts, then cap output with `max_tokens` so one bad request does not create a surprise bill. Estimates are approximate, but they are good enough to reject oversized requests early.

```typescript
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY');
}

const pricing = {
  inputPerMillion: 0.15,
  outputPerMillion: 0.6,
};

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

function estimateCost(inputText: string, maxOutputTokens: number): number {
  const inputTokens = estimateTokens(inputText);
  return (inputTokens / 1_000_000) * pricing.inputPerMillion + (maxOutputTokens / 1_000_000) * pricing.outputPerMillion;
}

async function createBudgetedCompletion(prompt: string): Promise<void> {
  const maxTokens = 250;
  const estimatedCost = estimateCost(prompt, maxTokens);

  if (estimatedCost > 0.02) {
    throw new Error(`Estimated request cost too high: $${estimatedCost.toFixed(4)}`);
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  const data = (await response.json()) as {
    usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
    choices: Array<{ message: { content: string } }>;
  };

  console.log(data.choices[0]?.message.content ?? '');
  console.log('Usage:', data.usage);
}

await createBudgetedCompletion('Write a concise release note for a caching feature.');
```

In real systems, store per-feature budgets, track usage by user or workspace, and prefer shorter prompts over higher `max_tokens`. If you can summarize context before reuse, you usually save more money than by chasing tiny parameter tweaks.

## Parallel requests

Parallelism is useful for classification, extraction, or batch enrichment. `Promise.all` gives the lowest latency when you have a small batch, but uncontrolled fan-out quickly hits rate limits. A simple concurrency queue is often enough: keep a fixed number of in-flight requests and process the next job only when one finishes.

```typescript
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY');
}

async function classifyPrompt(prompt: string): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      max_tokens: 50,
      temperature: 0,
      messages: [
        { role: 'system', content: 'Return one label: bug, feature, billing, or other.' },
        { role: 'user', content: prompt },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  const data = (await response.json()) as {
    choices: Array<{ message: { content: string } }>;
  };

  return data.choices[0]?.message.content.trim() ?? 'other';
}

const prompts = [
  'The API returns 500 when uploading a PDF.',
  'Can you add SSO for enterprise customers?',
  'My invoice is missing last month charges.',
  'Where can I change my avatar?',
];

const directResults = await Promise.all(prompts.map((prompt) => classifyPrompt(prompt)));
console.log('Direct:', directResults);

async function runWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  worker: (item: T) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let nextIndex = 0;

  async function runWorker(): Promise<void> {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      results[currentIndex] = await worker(items[currentIndex]);
    }
  }

  await Promise.all(Array.from({ length: concurrency }, () => runWorker()));
  return results;
}

const queuedResults = await runWithConcurrency(prompts, 2, classifyPrompt);
console.log('Queued:', queuedResults);
```

This pattern is simple, predictable, and provider-agnostic. Start with low concurrency, watch 429 rates, then increase only when your telemetry says it is safe.

## Choosing the right model

Model choice is an engineering trade-off, not a branding decision. Small models are ideal for high-volume helpers, while larger models are better for multi-step reasoning, ambiguous instructions, or outputs with a high cost of failure. Benchmark with your own prompts because the “best” model depends on your latency target, quality bar, and budget.

| Model         | Best for                                                    | Typical latency | Cost profile   |
| ------------- | ----------------------------------------------------------- | --------------- | -------------- |
| GPT-4o mini   | Classification, rewriting, extraction, chat UX              | Very low        | Low            |
| GPT-4o        | Production assistants, multimodal flows, stronger reasoning | Low to medium   | Medium         |
| Claude Haiku  | Fast summaries, routing, lightweight enterprise tasks       | Very low        | Low            |
| Claude Sonnet | Deeper analysis, long-form drafting, complex code help      | Medium          | Medium to high |

A practical default is: start with a mini or Haiku-class model, measure failures, then upgrade only the routes that need better quality. Re-evaluate vendor pricing regularly because latency and cost change faster than most application code.
