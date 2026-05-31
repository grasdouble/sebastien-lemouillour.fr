---
id: ai-logs
order: 14
difficulty: intermediate
tags: [LLM, observability, logs, OpenTelemetry]
publishedAt: 2026-05-31
updatedAt: 2026-05-31
---

Your agent blew up at 02:00 and the only clue says "tool call returned null". That is the moment when generic app logs stop being enough for AI systems.

My bias is simple: I optimize logs for the second incident, not the first demo. The final answer is rarely the useful part. I want the execution envelope around it: provider, requested model, actual model if it changed, tokens, latency, response status, retry or fallback path, tool calls, and whether a safety policy blocked anything before the user saw it.

I start with [OpenTelemetry logs](https://opentelemetry.io/docs/concepts/signals/logs/) and shape every record so it can correlate with traces and metrics. For AI-specific fields, I would align names with the [GenAI semantic conventions](https://opentelemetry.io/docs/specs/semconv/gen-ai/) because they already define a shared vocabulary for providers, models, and token usage. If your field names drift between services, the alert that worked last week quietly dies.

At the provider boundary, I flatten every response into one attempt record. The [OpenAI Responses API](https://developers.openai.com/api/reference/resources/responses/methods/create) shows the fields I actually care about in production: `id`, `status`, `usage`, `error`, and `incomplete_details`. Emit one event per attempt, not one per user request. Retries, fallbacks, and tool loops are where latency and cost hide.

The trap I fell into was logging raw prompts everywhere. The [OWASP Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html) is the right reminder here: log enough for investigation, but do not spray sensitive data across every sink. I keep a short redacted preview in the hot path, store the full prompt in restricted storage, and hash the full prompt so I can correlate incidents without copying secrets into search indexes.

If you want a UI for drilling into traces, [Langfuse](https://langfuse.com/docs) is a solid add-on. I still would not let it become the only source of truth. Vendor tooling is great for inspection; incident response still needs normalized logs you control.

Before the code, here is the shortcut I wish I had earlier: derive the preview and the hash once, right where the provider response is normalized, so every retry and fallback uses the same shape.

```typescript
import { createHash } from 'node:crypto';

type LlmAttemptLog = {
  traceId: string; // Correlates logs with traces and spans.
  conversationId: string; // App-level session or thread identifier.
  provider: string; // openai, anthropic, bedrock, etc.
  requestedModel: string; // Model requested by your code.
  actualModel?: string; // Model that actually served the response.
  latencyMs: number; // End-to-end attempt latency.
  inputTokens?: number; // Provider-reported prompt tokens.
  outputTokens?: number; // Provider-reported completion tokens.
  responseStatus: string; // completed, incomplete, failed, etc.
  stopReason?: string | null; // Provider-specific stop or incomplete reason.
  toolNames: string[]; // Tools touched during this attempt.
  usedFallback: boolean; // True when a backup path handled the request.
  safetyIntervention: boolean; // True when policy or filtering changed the result.
  responseId?: string; // Provider response identifier.
  errorCode?: string; // Useful for 429s and other provider failures.
  promptPreview: string; // Redacted preview for quick triage only.
  promptHash: string; // SHA-256 of the full prompt text.
};

const redactPreview = (prompt: string, maxLength = 160) => prompt.replace(/\s+/g, ' ').slice(0, maxLength);

const hashPrompt = (prompt: string) => createHash('sha256').update(prompt).digest('hex');

export function buildLlmAttemptLog(
  input: Omit<LlmAttemptLog, 'promptPreview' | 'promptHash'> & { rawPrompt: string }
): LlmAttemptLog {
  const promptPreview = redactPreview(input.rawPrompt);

  return {
    ...input,
    promptPreview,
    promptHash: hashPrompt(input.rawPrompt),
  };
}
```

My rule is picky on purpose: if one attempt log cannot tell you which model ran, whether a retry or fallback happened, what it cost, and whether you handled sensitive input safely, you are still debugging blind.
