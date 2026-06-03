---
id: json-generation
order: 11
difficulty: intermediate
tags: [prompting, evaluation, llm]
publishedAt: 2026-06-08
updatedAt: 2026-06-08
---

Your parser does not fail during the demo. It fails when one polite sentence lands before the first brace and a cron job starts choking on it at 2 a.m.

For that mess, I separate two jobs. If I only need parseable output, I can still ask for JSON or use OpenAI’s [JSON mode](https://platform.openai.com/docs/guides/text-generation#json-mode) with `text.format: { type: 'json_object' }`. That older mode is useful for lightweight extraction, but OpenAI is explicit: it guarantees valid JSON, not schema adherence.

When a bad key could trigger automation, I stop negotiating with the model. OpenAI recommends [Structured Outputs](https://platform.openai.com/docs/guides/structured-outputs), Anthropic tells you to leave prompt tricks behind when you need guarantees in its [consistency tips](https://docs.anthropic.com/en/docs/test-and-evaluate/strengthen-guardrails/increase-consistency), and Gemini exposes [structured output](https://ai.google.dev/gemini-api/docs/structured-output). The useful mental model is simple: prompting and JSON mode reduce formatting drift; schema APIs are the contract.

When the shape is still moving, this lighter pattern is usually enough:

```ts
import OpenAI from 'openai';

const client = new OpenAI();

const response = await client.responses.create({
  model: 'gpt-4o-mini', // cheap model for light extraction
  input: [
    {
      role: 'developer',
      content: 'Extract sentiment, urgency, and product. Return JSON only.', // output instructions
    },
    { role: 'user', content: ticketText }, // raw user message
  ],
  text: {
    format: { type: 'json_object' }, // valid JSON only, no schema enforcement
  },
});

const payload = JSON.parse(response.output_text);
```

Even on the cheap path, parse is not the end of the job. Validate enums and required fields on your server, and cap retries hard. Every repair call burns tokens and request budget, so a sloppy retry loop can turn a tiny extraction task into a cost and [rate limits](https://platform.openai.com/docs/guides/rate-limits) problem.

When the payload will drive code paths, switch to a schema instead of adding more prompt text. Claude now uses [structured outputs](https://docs.anthropic.com/en/docs/build-with-claude/structured-outputs) via `output_config.format`, Anthropic flags `output_format` as the old beta shape, and the same guide says the guarantee comes from constrained decoding. Gemini uses the same idea with `application/json` plus a schema, exposed as `responseFormat` in JavaScript and `response_format` in Python.

Before that stricter call, I want the schema to do the boring policing for me:

```ts
import OpenAI from 'openai';

const client = new OpenAI();

const response = await client.responses.create({
  model: 'gpt-4o-mini', // model family that supports Structured Outputs
  input: [
    {
      role: 'developer',
      content: 'Classify the ticket and return only the requested fields.', // task definition
    },
    { role: 'user', content: ticketText }, // raw message to analyze
  ],
  text: {
    format: {
      type: 'json_schema',
      name: 'ticket_triage', // schema name for logging and reuse
      strict: true, // enforce the schema shape
      schema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          sentiment: {
            type: 'string',
            enum: ['positive', 'neutral', 'negative'],
          },
          urgency: {
            type: 'string',
            enum: ['low', 'medium', 'high'],
          },
          product: { type: 'string' },
        },
        required: ['sentiment', 'urgency', 'product'],
      },
    },
  },
});

const payload = JSON.parse(response.output_text);
```

One security rule survives every provider: parsed JSON is still untrusted input. Use allowlists for downstream actions, keep schemas small, and strip fields you did not ask for. My threshold is blunt: if a human can review the result before it matters, soft JSON is fine; if the output can spend money, change permissions, or trigger side effects, use a schema before you ship.
