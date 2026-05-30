---
id: json-generation
order: 11
difficulty: intermediate
tags: [LLM, JSON, Prompting, validation]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

Your parser never breaks on the demo. It breaks three weeks later, when the model adds “Sure, here’s the JSON” before the first brace and your background job starts throwing exceptions at 2 a.m.

When parseability is the problem, JSON generation is still the cheapest useful contract. OpenAI’s [JSON mode guide](https://platform.openai.com/docs/guides/text-generation#json-mode) lets you force syntactically valid JSON instead of politely asking for it and hoping the model behaves. That alone removes a lot of brittle regex cleanup.

The catch, and this is the part everybody learns in production, is that valid JSON is not the same as useful JSON. OpenAI’s [structured outputs guide](https://platform.openai.com/docs/guides/structured-outputs) makes the distinction explicit: JSON mode guarantees valid JSON, not that the output matches your schema. A response can parse perfectly while still omitting a required field or inventing a new key because the model felt creative.

That is why I use JSON generation for light extraction, routing decisions, and low-risk metadata. It is great when the shape is small and still evolving. I do not trust it for contracts that drive billing, permissions, or branching business logic.

This is the version I reach for when I want a small JSON payload without moving to full schema enforcement yet:

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

Even here, I still validate the parsed object on the server and I cap retries hard. OpenAI’s [prompt engineering guide](https://platform.openai.com/docs/guides/prompt-engineering) keeps coming back to evals and iteration for a reason: repair loops are easy to add and easy to leave running forever. My default is one retry for parse failure, one retry for validation failure, then a visible error path.

There is also a security angle people hand-wave away. JSON content is still untrusted input. A string field can contain prompt injection text, HTML, SQL fragments, or garbage you absolutely should not feed into another system without checks.

My rule is simple. Use JSON mode when parseability is the main issue and the schema can stay soft. The moment downstream code starts depending on exact fields or enums, stop negotiating with “pretty good JSON” and move to structured outputs.
