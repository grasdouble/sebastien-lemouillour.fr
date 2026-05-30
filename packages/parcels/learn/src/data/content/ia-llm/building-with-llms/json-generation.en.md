---
id: json-generation
order: 11
difficulty: intermediate
tags: [LLM, JSON, Prompting, validation]
publishedAt: 2099-12-31
updatedAt: 2099-12-31
---

Your parser never breaks in the demo. It breaks three weeks later, when the model adds “Sure, here’s the JSON” before the first brace and your background job starts throwing exceptions at 2 a.m.

When parseability is the actual problem, JSON generation is still the cheapest useful contract. OpenAI’s [JSON mode guide](https://platform.openai.com/docs/guides/text-generation#json-mode) lets you force syntactically valid JSON instead of politely asking for it and hoping the model cooperates. That alone removes a lot of brittle cleanup code.

The trap, and this is the part everybody learns in production, is that valid JSON is not the same as useful JSON. OpenAI’s [Structured Outputs guide](https://platform.openai.com/docs/guides/structured-outputs) is blunt about it: JSON mode guarantees valid JSON, not schema adherence. A response can parse perfectly while still skipping a required field or inventing a key because the model got in a creative mood.

That is why I use plain JSON generation for light extraction, routing hints, and low-risk metadata. It is great when the shape is small and still moving. I would not let it drive billing, permissions, or business branches unless I enjoy debugging preventable nonsense.

When I just need a compact payload and the shape is still evolving, this is the pattern I actually use:

```ts
const response = await client.responses.create({
  model: 'gpt-4.1-mini',
  input: [
    {
      role: 'developer',
      content: 'Extract sentiment, urgency, and product from the user message. Return JSON only.',
    },
    { role: 'user', content: ticketText },
  ],
  text: {
    format: { type: 'json_object' }, // valid JSON, not schema validation
  },
});

const payload = JSON.parse(response.output_text);
```

Even here, I still validate the parsed object on the server and I cap retries hard. OpenAI’s [evals guide](https://platform.openai.com/docs/guides/evals) is right to push iteration and measurement, because repair loops are ridiculously easy to add and annoyingly easy to leave running forever. My default is one retry for parse failure, one retry for validation failure, then a visible error path.

If you are working without strict schema enforcement, Anthropic’s [consistency guidance](https://docs.anthropic.com/en/docs/test-and-evaluate/strengthen-guardrails/increase-consistency) is a good reminder that prefilling the assistant response and giving examples can reduce friendly preambles. I still treat that as a stopgap, not a contract.

My rule is simple. Use JSON mode when parseability is the main issue and the schema can stay soft. If a wrong key can trigger money movement, permission checks, or automation, skip the bargaining and use structured outputs on day one.
