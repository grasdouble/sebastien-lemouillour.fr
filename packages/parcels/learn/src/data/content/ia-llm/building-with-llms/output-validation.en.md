---
id: output-validation
order: 13
difficulty: intermediate
tags: [LLM, Zod, Pydantic, validation, schema]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

The model returns JSON 95% of the time. The other 5%, it wraps the JSON in a polite paragraph and your worker falls over before sunrise.

I stopped trying to “prompt harder” a long time ago. If the output feeds a database write, a webhook, or a customer-facing decision, the model does not get to improvise the shape. Provider features like [structured outputs](https://platform.openai.com/docs/guides/structured-outputs) help a lot because they constrain generation to a schema. That removes a whole class of formatting bugs. It does not remove your app-level checks.

That second layer matters because valid JSON is not the same thing as valid business data. A model can return `"priority": "urgent"` when your system only accepts `low | medium | high`. In JavaScript, I reach for [Zod](https://zod.dev/) because it gives me parsing and readable errors in one place. In Python, [Pydantic](https://docs.pydantic.dev/) fills the same role. I care less about the library choice than about having one contract that every caller obeys.

The part most tutorials skip is control flow. Validation is not a nice extra after generation, it decides what happens next. Do you retry once with the validation error? Do you repair fields locally? Do you drop the response and alert? If you do none of that, you did not build a pipeline, you built a coin flip with great branding.

This is the shape I would ship in TypeScript:

```ts
import { z } from 'zod';

const TicketSummary = z.object({
  sentiment: z.enum(['positive', 'neutral', 'negative']),
  // Keep categories narrow, wide enums invite drift.
  category: z.enum(['billing', 'bug', 'feature', 'account']),
  // Bound free text so bad outputs fail fast.
  summary: z.string().min(20).max(280),
  needsHuman: z.boolean(),
});

export async function parseTicketSummary(rawText: string) {
  const parsed = TicketSummary.safeParse(JSON.parse(rawText));

  if (parsed.success) return parsed.data;

  throw new Error(
    `Invalid LLM output: ${parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join(', ')}`
  );
}
```

A few practical rules saved me money. Keep schemas narrower than your instinct. Cap retries to one or two, because every “just try again” burns tokens and pushes you toward rate limits. Log the raw response when parsing fails, but scrub secrets before it reaches observability tooling. If you need optional fields everywhere, that is usually a sign your prompt or task split is sloppy.

My rule is simple: if the output triggers an action, validate it. If the output is only there to help a human think, you can be looser. The moment a bad response can page you at 3am, schema validation stops being optional.
