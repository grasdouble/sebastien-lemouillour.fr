---
id: ai-logs
order: 14
difficulty: intermediate
tags: [LLM, observability, logs, OpenTelemetry]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

Your agent failed in production. The log says "tool call returned null". That is your whole debug surface. Every observability guide covers logs, almost none cover what to log for LLM systems specifically.

My stance is blunt: the final answer is rarely the useful part of the log. What you need is the execution envelope around it. I want to know which provider answered, which model version ran, how many tokens were spent, what the stop reason was, whether a fallback happened, which tools were attempted, and whether the safety layer intervened before the user ever saw the result.

The good baseline is [OpenTelemetry logs](https://opentelemetry.io/docs/concepts/signals/logs/), because once log fields are structured you can correlate them with traces and metrics instead of grepping random strings. Then I follow the [semantic conventions](https://opentelemetry.io/docs/specs/semconv/) mindset even when a field is custom: stable names, stable units, stable IDs. If your field names keep changing, your dashboards and alerts become fiction.

For provider responses, I normalize the payload at the adapter boundary. The [OpenAI response object](https://platform.openai.com/docs/api-reference/responses/object) is a good reminder of what matters operationally: response ID, usage, finish state, and request identifiers. Do that once, then emit one event per attempt. Not one event per request, one per attempt. Retries and fallbacks are where hidden cost and latency accumulate.

Raw prompts are the trap. Logging them everywhere feels convenient until a customer pastes sensitive data. My preference is simple: log a short redacted preview for quick triage, keep the full payload in restricted storage, and attach a stable hash so you can correlate events without spraying secrets across every sink.

If you want a UI built for this workflow, [Langfuse](https://langfuse.com/docs) is useful. I still would not make it the only source of truth. Vendor dashboards are great for inspection. Incident response needs normalized application logs you own.

This is the minimum event shape I expect before I call AI logging "real".

```typescript
import { createHash } from 'node:crypto';

type LlmAttemptLog = {
  traceId: string;
  conversationId: string;
  provider: string;
  model: string;
  latencyMs: number;
  inputTokens?: number;
  outputTokens?: number;
  stopReason?: string | null;
  toolNames: string[];
  usedFallback: boolean;
  responseId?: string;
  promptPreview: string;
  promptHash: string;
};

const hashPrompt = (prompt: string) => createHash('sha256').update(prompt).digest('hex');

export function buildLlmAttemptLog(input: Omit<LlmAttemptLog, 'promptHash'>): LlmAttemptLog {
  return {
    ...input,
    promptHash: hashPrompt(input.promptPreview),
  };
}
```

My rule is harsh on purpose: if a single log line cannot tell you which model ran, what it cost, why it stopped, and which tool path it touched, you do not have production logs yet.
