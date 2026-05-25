---
id: llm-production
order: 6
difficulty: advanced
tags: [IA, LLM, production, security, observability]
---

Your MVP works. You're going to production. And there you discover that an LLM call is not just a function call — it's a surface for latency, cost, security attacks, and outages. The same code that worked fine on your laptop requires a completely different level of care in a real system.

## Observability

The first thing you need in production is visibility. An LLM call concentrates latency, cost, and reliability risk in a single point. Without structured logging, you can't debug a timeout, explain a cost spike, or detect a prompt injection in progress.

The middleware below represents the minimum viable: a structured event on success, another on failure, both correlated with application traces.

```typescript
import { createHash } from 'node:crypto';

type ChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

type LlmResponse = {
  id: string;
  model: string;
  outputText: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
  };
  finishReason: string;
  raw: unknown;
};

type ProviderCall = (messages: ChatMessage[]) => Promise<LlmResponse>;
type Logger = (event: Record<string, unknown>) => void;

const pricingUsdPer1kTokens: Record<string, { input: number; output: number }> = {
  'gpt-4o-mini': { input: 0.00015, output: 0.0006 },
  'claude-3-5-haiku-latest': { input: 0.0008, output: 0.004 },
};

const estimateCostUsd = (model: string, usage: LlmResponse['usage']) => {
  const pricing = pricingUsdPer1kTokens[model];
  if (!pricing) return null;

  return Number(((usage.inputTokens / 1000) * pricing.input + (usage.outputTokens / 1000) * pricing.output).toFixed(6));
};

const promptFingerprint = (messages: ChatMessage[]) =>
  createHash('sha256').update(JSON.stringify(messages)).digest('hex');

const promptPreview = (messages: ChatMessage[]) =>
  messages.map(({ role, content }) => `${role}: ${content.slice(0, 300)}`).join('\n');

export const withObservability = (
  provider: string,
  model: string,
  call: ProviderCall,
  logger: Logger
): ProviderCall => {
  return async (messages) => {
    const startedAt = Date.now();

    try {
      const response = await call(messages);
      const latencyMs = Date.now() - startedAt;

      logger({
        type: 'llm_call',
        status: 'success',
        provider,
        model,
        prompt_input: promptPreview(messages),
        prompt_hash: promptFingerprint(messages),
        tokens_input: response.usage.inputTokens,
        tokens_output: response.usage.outputTokens,
        latency_ms: latencyMs,
        cost_usd: estimateCostUsd(model, response.usage),
        finish_reason: response.finishReason,
        response_id: response.id,
      });

      return response;
    } catch (error) {
      logger({
        type: 'llm_call',
        status: 'error',
        provider,
        model,
        prompt_input: promptPreview(messages),
        prompt_hash: promptFingerprint(messages),
        latency_ms: Date.now() - startedAt,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      throw error;
    }
  };
};
```

From there, you can add LLM-native inspection with tools like LangSmith or Helicone, or keep the whole trace inside your existing OpenTelemetry pipeline. The important part is not the brand of tooling — it is having enough evidence to explain behavior after the fact.

## Security: prompt injection

The second risk you discover is prompt injection. It's an attack on the instruction layer: a user input, or data retrieved by the model, attempts to change the expected behavior. Direct injection is explicit. Indirect injection is more insidious — it arrives via a web page, PDF, or RAG chunk.

The main defense is separation. Treat retrieved content as untrusted data, never as execution policy. Keep system and developer instructions distinct from user content, validate inputs before they reach tools, and sandbox agent tools with allowlists, short-lived credentials, and restricted network access. Assume some injections will land, and design for a small blast radius when they do.

## Cost optimization

At scale, cost almost never decreases just by trimming a single prompt. Start with caching — semantic caching reuses responses for equivalent questions, though many teams start with exact-match cache or a normalized prompt before adding embeddings.

Then move to the bigger levers: remove duplicated instructions, summarize history, route lightweight work to small models, batch offline tasks, and cap `max_tokens` so verbosity does not quietly dominate the bill. The example below is deliberately simple, but it shows the first production-safe step.

```typescript
import { createHash } from 'node:crypto';

type Resolver<T> = () => Promise<T>;

type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

const completionCache = new Map<string, CacheEntry<string>>();

const normalizePrompt = (prompt: string) => prompt.trim().replace(/\s+/g, ' ');

const hashPrompt = (model: string, prompt: string) =>
  createHash('sha256')
    .update(`${model}:${normalizePrompt(prompt)}`)
    .digest('hex');

export async function cachedCompletion(
  model: string,
  prompt: string,
  ttlMs: number,
  resolver: Resolver<string>
): Promise<string> {
  const key = hashPrompt(model, prompt);
  const cached = completionCache.get(key);

  if (cached && cached.expiresAt > Date.now()) {
    return cached.value;
  }

  const value = await resolver();

  completionCache.set(key, {
    value,
    expiresAt: Date.now() + ttlMs,
  });

  return value;
}
```

## Resilience and multi-provider

A single-provider architecture introduces a hidden single point of failure: outage, saturated quota, regional degradation, or policy change can take down your product. The solution is to separate a provider-agnostic interface from its specific adapters, then define your fallback policy explicitly: aggressive timeout, one retry on transient error, then switch from OpenAI to Anthropic.

That fallback is not free. Providers differ on JSON mode, tool calling, context limits, and safety filters, so normalize only the capabilities you truly need. Keep prompts portable, maintain golden test cases across providers, and measure quality drift during failover instead of assuming parity.

```typescript
type ProviderResult = {
  provider: string;
  text: string;
  finishReason: string;
};

type Provider = {
  name: string;
  generate: (prompt: string, signal: AbortSignal) => Promise<ProviderResult>;
};

async function withTimeout<T>(timeoutMs: number, operation: (signal: AbortSignal) => Promise<T>): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await operation(controller.signal);
  } finally {
    clearTimeout(timeout);
  }
}

export async function generateWithFallback(
  prompt: string,
  providers: Provider[],
  timeoutMs = 2500,
  retries = 1
): Promise<ProviderResult> {
  const errors: string[] = [];

  for (const provider of providers) {
    for (let attempt = 0; attempt <= retries; attempt += 1) {
      try {
        return await withTimeout(timeoutMs, (signal) => provider.generate(prompt, signal));
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        errors.push(`${provider.name} attempt ${attempt + 1}: ${message}`);
      }
    }
  }

  throw new Error(`All providers failed: ${errors.join(' | ')}`);
}
```

## Model selection framework

Choose models with an explicit decision matrix, not brand loyalty. For a journey under 500ms, favor fast classes like Claude Haiku or GPT-4o mini. For customer-visible synthesis or high-stakes analysis, pay for GPT-4o or Claude Sonnet and compensate latency with caching and async UX.

If you also need hard cost caps or stronger data control, extend that matrix with budget thresholds and hosting constraints instead of making one provider your default forever.

| Constraint           | Recommended default      | Why                                                      | Main tradeoff                        |
| -------------------- | ------------------------ | -------------------------------------------------------- | ------------------------------------ |
| Latency < 500 ms     | Haiku / GPT-4o mini      | Best chance of hitting interactive UX budgets            | Lower reasoning depth                |
| Maximum quality      | GPT-4o / Claude Sonnet   | Better synthesis, tool use, and long-context reliability | Higher cost and latency              |
| Cost < $0.01/request | Small models             | Scales better under heavy traffic                        | More routing and QA work             |
| Sensitive data       | Ollama / vLLM on-premise | Stronger data control and residency guarantees           | You own uptime, GPU cost, and tuning |

Provider choice should also include SLAs, regional availability, quota behavior, eval results on your domain, and contract terms around retention and training. In production, the best model is the one that meets your error budget, privacy boundary, and unit economics simultaneously.
