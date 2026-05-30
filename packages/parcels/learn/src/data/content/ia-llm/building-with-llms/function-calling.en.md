---
id: function-calling
order: 14
difficulty: intermediate
tags: [LLM, OpenAI, function-calling, schema]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

The embarrassing version of function calling is when the model says “I booked the meeting” and nothing actually happened.

Function calling exists to stop that nonsense. With [function calling](https://platform.openai.com/docs/guides/function-calling), the model does not perform the action itself. It returns a structured request saying which function it wants and which arguments it thinks are needed. Your code still owns execution, permissions, retries, and error handling. That split is the whole point.

What most tutorials underdesign is the schema. If your tool takes `query: string`, `options: object`, and `metadata: any`, you did not define a function, you handed the model a footgun. Treat the schema like an API contract. The simpler and tighter it is, the fewer weird calls you will debug later. The rules from [JSON Schema](https://json-schema.org/understanding-json-schema/) are useful here, because they force you to be explicit about enums, required fields, and nested objects. If you want the model to stay inside those rails, pair the tool definition with [strict schemas](https://platform.openai.com/docs/guides/structured-outputs).

Before the code, here is the trap I fell into: function calling makes demos feel magical, so people let the model choose too much. In production, I want the model to choose between a few safe operations, not invent a mini query language for my backend.

This is the kind of tool definition I trust:

```ts
const tools = [
  {
    type: 'function',
    function: {
      name: 'lookup_order',
      description: 'Fetch a customer order by public order number.',
      strict: true,
      parameters: {
        type: 'object',
        properties: {
          orderNumber: {
            type: 'string',
            description: 'Human-facing order number, for example ORD-1042.',
          },
          includeRefundStatus: {
            type: 'boolean',
            description: 'Set true only when the user explicitly asks about refunds.',
          },
        },
        required: ['orderNumber', 'includeRefundStatus'],
        additionalProperties: false,
      },
    },
  },
];
```

A few rules make this reliable. Never let tool arguments flow straight into SQL, shell commands, or third-party APIs without another validation pass. Attach auth and tenancy checks outside the model loop, because the model has no idea who is allowed to do what. Expect extra latency too: every tool call usually means another model roundtrip, so budget for it and surface loading states in the UI.

I use function calling when the model needs to pick from a small menu of actions. If you find yourself adding twenty vaguely similar functions, stop. That is usually the moment where the tool surface is hiding a product design problem.
