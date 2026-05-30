---
id: llm-production
order: 4
difficulty: advanced
tags: [IA, LLM, production, security, observability]
publishedAt: 2026-05-12
updatedAt: 2026-05-30
---

Your MVP works. Then the first real users arrive, latency jumps, the bill stops being cute, and one silent model failure burns half a day of incident response. An LLM call in production is not a function call. It is a failure domain with cost, security, and SLO consequences.

## Observability

The first production incident with an LLM always feels the same: something is wrong, and you cannot tell whether the break came from the model, the prompt, the network, the tool layer, or your own adapter. That is what running blind looks like.

Log the full execution envelope, not just the text output. What matters during an incident is the [response object](https://developers.openai.com/api/docs/api-reference/chat/object) or its equivalent after normalization: provider, model, token usage, latency, response ID, request ID, stop reason, retries, and whether tools or retrieval were involved. For sensitive payloads, keep raw prompts in restricted storage and send only a redacted preview plus a stable hash to general logs. Correlate that with [OpenTelemetry](https://opentelemetry.io/docs/concepts/signals/traces/) traces, or you are still guessing.

Normalize that once at the adapter boundary, then emit one event on success and one on failure.

```typescript
import { createHash } from 'node:crypto';

type ChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

type NormalizedLlmResponse = {
  responseId: string;
  model: string;
  outputText: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
  };
  stopReason: string | null;
  requestId?: string;
};

type Pricing = {
  inputUsdPer1kTokens: number;
  outputUsdPer1kTokens: number;
};

type ProviderCall = (messages: ChatMessage[]) => Promise<NormalizedLlmResponse>;
type Logger = (event: Record<string, unknown>) => void;

const estimateCostUsd = (pricing: Pricing, usage: NormalizedLlmResponse['usage']) => {
  return Number(
    (
      (usage.inputTokens / 1000) * pricing.inputUsdPer1kTokens +
      (usage.outputTokens / 1000) * pricing.outputUsdPer1kTokens
    ).toFixed(6)
  );
};

const promptFingerprint = (messages: ChatMessage[]) =>
  createHash('sha256').update(JSON.stringify(messages)).digest('hex');

const promptPreview = (messages: ChatMessage[]) =>
  messages.map(({ role, content }) => `${role}: ${content.slice(0, 300)}`).join('\n');

export const withObservability = (
  provider: string,
  model: string,
  pricing: Pricing,
  call: ProviderCall,
  logger: Logger
): ProviderCall => {
  return async (messages) => {
    const startedAt = Date.now();

    try {
      const response = await call(messages);

      logger({
        type: 'llm_call',
        status: 'success',
        provider,
        model,
        prompt_preview: promptPreview(messages),
        prompt_hash: promptFingerprint(messages),
        tokens_input: response.usage.inputTokens,
        tokens_output: response.usage.outputTokens,
        latency_ms: Date.now() - startedAt,
        cost_usd: estimateCostUsd(pricing, response.usage),
        stop_reason: response.stopReason,
        response_id: response.responseId,
        request_id: response.requestId,
      });

      return response;
    } catch (error) {
      logger({
        type: 'llm_call',
        status: 'error',
        provider,
        model,
        prompt_preview: promptPreview(messages),
        prompt_hash: promptFingerprint(messages),
        latency_ms: Date.now() - startedAt,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      throw error;
    }
  };
};
```

LangSmith or Helicone can sit on top if you want more LLM-native inspection. The brand matters less than having enough evidence to explain the failure without replaying production traffic.

## Security: prompt injection

Prompt injection is still the trap most teams underestimate. It is not a classic parser exploit. It is an instruction-layer exploit, and [OWASP](https://cheatsheetseries.owasp.org/cheatsheets/LLM_Prompt_Injection_Prevention_Cheat_Sheet.html) is explicit about the ugly part: direct injection is only half the problem. Indirect injection arrives through the documents, web pages, tickets, or emails your system fetches and stuffs into context.

The right default is separation. Treat retrieved content as untrusted data, never as policy. Keep system instructions structurally distinct from user and retrieved content. Validate inputs before they reach tools. Sandbox tools with allowlists, short-lived credentials, and narrow network permissions. Assume some injections will land anyway. Production design is about blast radius, not purity.

## Cost optimization

The bill looks harmless during development. Then traffic grows, conversation history keeps expanding, retrieval gets noisy, and a feature that looked cheap at prototype scale turns into a margin leak.

Provider-side [prompt caching](https://developers.openai.com/api/docs/guides/prompt-caching) is real money on repeated prefixes, but it is not a substitute for your own cache. Provider caches are prefix-sensitive and provider-specific. Start with an application cache on normalized prompts. Then summarize history instead of appending forever, route classification and extraction to smaller models, reserve expensive reasoning for the calls that need it, batch offline work where latency allows it, and cap the output token budget explicitly.

Build that first, then decide if semantic caching is worth the extra operational drag.

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

Single-provider architectures look fine right until one quota event, regional degradation, or policy change takes out a revenue path. If the feature matters, write down the fallback policy before the incident writes it for you.

My default for interactive workloads is blunt: 2-3 second timeout, one retry on transient failures, then fail over. Batch workloads can wait longer. User-facing flows usually should not. Circuit breakers matter because retry storms are how you turn one provider outage into your own outage.

Write that policy in code so the on-call team is not improvising at 3 a.m.

```typescript
type ProviderResult = {
  provider: string;
  text: string;
  stopReason: string | null;
};

type Provider = {
  name: string;
  generate: (prompt: string, signal: AbortSignal) => Promise<ProviderResult>;
};

type ProviderError = Error & {
  status?: number;
  code?: string;
};

const isTransientError = (error: unknown) => {
  if (!(error instanceof Error)) return false;

  const providerError = error as ProviderError;

  return (
    error.name === 'AbortError' ||
    providerError.status === 429 ||
    (typeof providerError.status === 'number' && providerError.status >= 500)
  );
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

        if (!isTransientError(error) || attempt === retries) {
          break;
        }
      }
    }
  }

  throw new Error(`All providers failed: ${errors.join(' | ')}`);
}
```

The fallback is not free. Providers differ on tool calling, structured output guarantees, context limits, and safety behavior. Do not normalize everything. Normalize only the capabilities you truly need, keep prompts portable, run the same golden cases against both providers, and measure quality drift during failover instead of assuming equivalence.

## Model selection framework

Model selection is an engineering decision, not a brand preference. I would start with the cheapest model that passes evals for the task and only move up when quality is the proven bottleneck.

| Constraint           | Recommended default                                                                                  | Why                                           | Main tradeoff                      |
| -------------------- | ---------------------------------------------------------------------------------------------------- | --------------------------------------------- | ---------------------------------- |
| Latency < 500 ms     | Smallest model that passes evals                                                                     | Best chance of protecting interactive budgets | Less reasoning headroom            |
| Maximum quality      | Flagship model                                                                                       | Better synthesis and tool reliability         | Higher cost and latency            |
| Cost pressure        | Tiered routing                                                                                       | Keeps expensive calls rare                    | More routing logic and QA work     |
| Strict data boundary | Self-hosted stack with [Ollama](https://docs.ollama.com/) or [vLLM](https://docs.vllm.ai/en/stable/) | Keeps inference inside your infra boundary    | You own uptime, GPUs, and capacity |

Factor in SLAs, regional availability, quota behavior, eval results on your domain, and contractual data-retention terms. My rule is simple: if the feature cannot hit latency, quality, and unit-cost targets with one documented fallback path, it is not production-ready yet.
