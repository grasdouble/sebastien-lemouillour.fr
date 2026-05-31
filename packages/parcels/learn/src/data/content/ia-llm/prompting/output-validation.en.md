---
id: output-validation
order: 13
difficulty: intermediate
tags: [prompting, evaluation, llm]
publishedAt: 2026-12-31
updatedAt: 2026-05-31
---

The model returns JSON 95% of the time. The other 5%, it wraps the payload in a polite paragraph and your background job explodes at 2am.

I stopped trying to “prompt harder” this away a while ago. If the output feeds a database write, a webhook, or a customer-facing decision, the model does not get to freestyle the shape. Features like [Structured Outputs](https://platform.openai.com/docs/guides/structured-outputs) are the sane default because they enforce a JSON Schema and block missing required keys or bogus enum values. I still validate in app code, because “matches the transport schema” and “safe for my business logic” are two very different sentences.

That second layer is where bugs hide. A model can happily return `"priority": "urgent"` when your system only accepts `low | medium | high`, or hand you an empty summary that technically counts as a string. In TypeScript, I pick [Zod](https://zod.dev/basics) because `.safeParse()` gives me the parsed value and the failure path in one go. In Python, [Pydantic models](https://docs.pydantic.dev/latest/concepts/models/) give me the same contract. If you force me to choose, I would rather have one boring schema than ten clever prompts.

Most guides stop at “validate the object” and skip the annoying bit: control flow. Validation decides what happens next. Do you retry once with the exact validation error? Do you patch a harmless field locally? Do you drop the response and alert someone? Skip that part and you do not have a pipeline, you have a slot machine with great DX.

This is the TypeScript shape I would actually ship:

```ts
import { z } from 'zod';

const TicketSummary = z.object({
  sentiment: z.enum(['positive', 'neutral', 'negative']),
  category: z.enum(['billing', 'bug', 'feature', 'account']),
  summary: z.string().min(20).max(280),
  needsHuman: z.boolean(),
});

export function parseTicketSummary(rawText: string) {
  let json: unknown;

  try {
    json = JSON.parse(rawText);
  } catch {
    throw new Error('LLM output is not valid JSON');
  }

  const parsed = TicketSummary.safeParse(json);

  if (parsed.success) return parsed.data;

  throw new Error(
    `Invalid LLM output: ${parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join(', ')}`
  );
}
```

Then the practical rules. Keep schemas narrower than your instinct. Cap retries to one or two, because “just try again” is how you light tokens on fire and drift into rate-limit fun. Log the raw response when parsing fails, but scrub secrets before it hits observability. And if every field ends up optional, that is usually your prompt or task split telling you it hates you.

My rule: if the output can trigger an action, validate it with a schema and decide the failure path up front. If it is only there to help a human think, loosen up. Once a bad payload can wake you up at 3am, “we will catch it later” stops being a serious plan.
