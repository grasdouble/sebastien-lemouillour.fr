---
id: llm-api-patterns
order: 1
difficulty: intermediate
tags: [IA, LLM, API]
publishedAt: 2026-05-12
updatedAt: 2026-05-30
---

The demo lies to you. One prompt, one answer, everybody is happy. Then the real traffic shows up: users stare at a blank screen, a 429 lands in the middle of checkout, one giant attachment blows the token budget, and the monthly bill suddenly becomes somebody's problem.

If you're starting today, I would build on the [Responses API](https://developers.openai.com/api/reference/responses/overview) instead of starting a new integration on older request shapes. One interface for text generation, tool calls, and usage data is less to babysit.

## Stream the first token

The first UX bug is silence. If the model needs a few seconds, people assume the button failed. OpenAI documents HTTP streaming in the [Streaming guide](https://developers.openai.com/api/docs/guides/streaming-responses), but the operational shortcut is simpler: stream from your server, never from a browser with a raw provider key.

Reuse this client in the next snippets.

```typescript
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY');
}

async function streamAnswer(prompt: string): Promise<string> {
  const stream = await client.responses.create({
    model: 'gpt-5-mini', // cheap default for chat-like UX
    input: prompt, // same shape you can reuse for logs and tests
    stream: true, // emit events instead of waiting for the full body
  });

  let fullText = '';

  for await (const event of stream) {
    if (event.type === 'response.output_text.delta') {
      process.stdout.write(event.delta);
      fullText += event.delta;
    }

    if (event.type === 'error') {
      throw new Error(event.error?.message ?? 'Streaming failed');
    }
  }

  return fullText;
}

await streamAnswer('Explain SSE streaming for LLM APIs in 3 bullet points.');
```

I turn streaming on for any route where a user is waiting. Fancy token animation is optional; visible progress is not.

## Retry only the failures that deserve it

Once the UX feels alive, the next trap is pretending every failure is temporary. OpenAI publishes both [Rate limits](https://developers.openai.com/api/docs/guides/rate-limits) and the main [Error codes](https://developers.openai.com/api/docs/guides/error-codes). My rule is boring on purpose: retry timeouts, 429s, and 5xx; fail fast on 400, 401, and 403.

Before you wire this into a route, make the policy explicit.

```typescript
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function isRetriableStatus(status?: number): boolean {
  return status === 429 || (status !== undefined && status >= 500);
}

function backoffMs(attempt: number): number {
  const base = 500 * 2 ** attempt;
  const jitter = Math.floor(Math.random() * 250);
  return base + jitter;
}

async function createAnswer(prompt: string): Promise<string> {
  const maxRetries = 4;

  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    try {
      const response = await client.responses.create({
        model: 'gpt-5-mini',
        input: prompt,
        max_output_tokens: 300, // keep retries bounded
      });

      return response.output_text;
    } catch (error) {
      const status =
        typeof error === 'object' && error !== null && 'status' in error
          ? Number((error as { status?: number }).status)
          : undefined;

      if (attempt < maxRetries && isRetriableStatus(status)) {
        await sleep(backoffMs(attempt));
        continue;
      }

      throw error;
    }
  }

  throw new Error('Retries exhausted');
}

console.log(await createAnswer('Summarize HTTP caching in 5 lines.'));
```

If a request keeps failing because the prompt is too big, retries are theater. Trim the payload, summarize old context, or route the job to a model with a larger window.

## Put budgets in code, not in a spreadsheet

The next pain is cost drift. Character counts and gut feeling are bad proxies once tools, images, or long histories enter the request. For exact preflight counts, use [Token counting](https://developers.openai.com/api/docs/guides/token-counting). For current per-token prices, check the provider pricing page and keep the numbers in config, not in the handler. I keep both limits in code so a hot path cannot silently get more expensive.

Use the same payload for counting and generation, otherwise your estimate lies.

```typescript
type RouteBudget = {
  maxInputTokens: number;
  maxOutputTokens: number;
};

const summaryBudget: RouteBudget = {
  maxInputTokens: 2_000,
  maxOutputTokens: 250,
};

async function createBudgetedSummary(prompt: string): Promise<string> {
  const inputCount = await client.responses.inputTokens.count({
    model: 'gpt-5-mini',
    input: prompt,
  });

  if (inputCount.input_tokens > summaryBudget.maxInputTokens) {
    throw new Error(`Prompt too large: ${inputCount.input_tokens} input tokens.`);
  }

  const response = await client.responses.create({
    model: 'gpt-5-mini',
    input: prompt,
    max_output_tokens: summaryBudget.maxOutputTokens,
  });

  console.log(response.usage);

  return response.output_text;
}

console.log(await createBudgetedSummary('Write a concise release note for a caching feature.'));
```

Do not wait for finance to tell you which route is expensive. Log `usage`, aggregate it per feature, and page yourself before the monthly bill does.

## Parallelize carefully

Once single calls are stable, batch work is the next temptation. Classification, enrichment, and extraction parallelize well, but uncontrolled fan-out is how you discover the rate limit page the hard way. Start small, then raise concurrency only when your telemetry stays calm.

This queue is dull, which is exactly why I like it.

```typescript
async function classifyTicket(text: string): Promise<string> {
  const response = await client.responses.create({
    model: 'gpt-5-mini',
    input: [
      {
        role: 'developer',
        content: 'Return one label: bug, feature, billing, or other.',
      },
      {
        role: 'user',
        content: text,
      },
    ],
    max_output_tokens: 20, // labels do not need essays
  });

  return response.output_text.trim().toLowerCase();
}

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

const tickets = [
  'The API returns 500 when uploading a PDF.',
  'Can you add SSO for enterprise customers?',
  'My invoice is missing last month charges.',
  'Where can I change my avatar?',
];

console.log(await runWithConcurrency(tickets, 2, classifyTicket));
```

If you do not know your safe concurrency yet, pick 2, ship it, and let real 429 data argue for 4 later.

## Pick the smallest model that survives contact with reality

Model choice is where teams burn money to feel safe. The current [OpenAI models](https://platform.openai.com/docs/models) page pushes you toward flagship models for complex reasoning, while the [Claude models](https://docs.anthropic.com/en/docs/about-claude/models/overview) page makes the same trade-off clear with Haiku, Sonnet, and Opus. I still start from the cheap, fast side and promote only the routes that fail evals or human review.

If a route breaks when downgraded to the smaller model, pay for the bigger one. If it passes with the smaller one, keep the cheaper default and spend the budget somewhere users can actually feel.
