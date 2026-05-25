---
id: llm-production
order: 6
difficulty: advanced
tags: [IA, LLM, production, security, observability]
---

Your MVP works. Beautifully, in fact — you've shown it to the team, they're impressed, and now it needs to go to production. That's when you discover that an LLM call isn't just a function call. It's a concentrated point of latency spikes, unpredictable costs, security attack surface, and quiet failures that don't throw exceptions. The code that ran fine on your laptop now needs a completely different level of care.

## Observability

The first production incident with an LLM tends to follow a pattern: something is wrong, you don't know if it's the model, the prompt, the infrastructure, or your code, and you have no logs that would tell you which one. That's when you realize you've been running blind.

You need to log the full execution envelope, not just "the response." What actually helps during an incident: which prompt was sent, to which provider, with which model, how many tokens went in and came out, how long the call took, how much it cost, how it terminated (`finish_reason`), whether there were retries, what request ID came back, and whether tools or retrieval were involved. For sensitive payloads, keep the raw prompt in restricted storage and send only a redacted preview plus a stable hash to general logs.

The middleware below is the minimum viable starting point: one structured event on success, one on failure, both correlated with application traces.

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

From there, LangSmith and Helicone give you more LLM-native inspection. OpenTelemetry keeps everything in your existing pipeline. The brand of tooling matters less than having enough evidence to explain what happened — after the fact, without having to reproduce it.

## Security: prompt injection

Prompt injection is the attack vector that trips up nearly every team the first time. It's not a buffer overflow or an auth bypass — it's a manipulation of the instruction layer. A user pastes crafted text, a partner PDF contains a hidden instruction, a RAG chunk pulled from a web page tells the model to ignore the system policy and exfiltrate data. The model, having no way to distinguish "instructions from the developer" from "instructions embedded in retrieved content," may comply.

Direct injection is obvious once you know to look for it. Indirect injection — arriving through external data your system fetches and injects into the prompt — is nastier. The main defense is separation: treat retrieved content as untrusted data, never as execution policy. Keep system instructions structurally distinct from user content. Validate inputs before they reach tools. Sandbox agent tools with allowlists, short-lived credentials, and restricted network access. And assume some injections will land. Design for a small blast radius when they do, not for perfect prevention.

## Cost optimization

The bill looks fine during development. Then traffic grows, and something that seemed cheap at prototype scale compounds into a real expense. The issue is rarely a single bloated prompt — it's usually an accumulation: conversation histories that grow without bounds, retrieval that returns more than needed, wrong model for the task, no caching.

Start with caching. Exact-match cache on normalized prompts is cheap to implement and eliminates redundant calls on frequently asked questions. Semantic caching reuses responses for equivalent questions even when phrased differently, but needs embeddings — it's a second step, not the first.

Then tackle the structural levers: remove duplicated instructions, summarize history instead of appending it forever, route classification and extraction to small models and reserve the expensive ones for synthesis or hard reasoning, batch offline work where latency permits, and cap `max_tokens` so the model doesn't quietly pad every response.

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

Single-provider architectures have a hidden property: they're fine until the day they're not. An outage, a quota limit, a regional degradation, a policy change — any of these can take down an LLM-dependent feature with no warning. The solution is to build a provider-agnostic interface over your actual adapters, then define your fallback policy explicitly rather than discovering it during an incident.

My preferred policy: aggressive timeout (2–3 seconds), one retry on transient errors, then switch to a secondary provider. Circuit breakers prevent retry storms from turning one provider's problem into your SLO's problem.

The fallback is not free. Providers differ on JSON mode, tool calling, context window limits, and safety filters. Don't normalize everything — only normalize the capabilities you actually need. Keep prompts portable across providers, maintain golden test cases that run on both, and measure quality drift during failover rather than assuming the outputs will be equivalent.

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

Model selection is an engineering decision, not a brand preference. The right model for a task is the one that meets your constraint budget — latency, quality, cost, data residency — not the most impressive one in a benchmark. I'd pick the cheapest model that can reliably do the job, and upgrade only when I have evidence that quality is the bottleneck.

| Constraint           | Recommended default      | Why                                                      | Main tradeoff                        |
| -------------------- | ------------------------ | -------------------------------------------------------- | ------------------------------------ |
| Latency < 500 ms     | Haiku / GPT-4o mini      | Best chance of hitting interactive UX budgets            | Lower reasoning depth                |
| Maximum quality      | GPT-4o / Claude Sonnet   | Better synthesis, tool use, and long-context reliability | Higher cost and latency              |
| Cost < $0.01/request | Small models             | Scales better under heavy traffic                        | More routing and QA work             |
| Sensitive data       | Ollama / vLLM on-premise | Stronger data control and residency guarantees           | You own uptime, GPU cost, and tuning |

Beyond the matrix: factor in SLAs, regional availability, quota behavior, eval results on your actual domain, and contract terms around data retention and training. The "best" model in production is the one that satisfies your error budget, your privacy boundary, and your unit economics — simultaneously, not in isolation.
