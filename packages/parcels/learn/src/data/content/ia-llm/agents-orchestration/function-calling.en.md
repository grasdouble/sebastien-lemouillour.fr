---
id: function-calling
order: 14
difficulty: intermediate
tags: [prompting, tools, llm]
publishedAt: 2026-05-31
updatedAt: 2026-05-31
---

You know the annoying version of AI features: the model proudly says “done,” and your app did absolutely nothing.

Function calling exists to kill that lie. Across [OpenAI](https://platform.openai.com/docs/guides/function-calling), [Anthropic](https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview), and [Gemini](https://ai.google.dev/gemini-api/docs/function-calling), the core loop is the same: the model returns a structured tool request, your application executes it, and you can send the result back for a final answer. I like this pattern because the dangerous part, real side effects, stays in normal code where auth, retries, and audit logs belong.

What most tutorials get wrong is the schema. If your tool takes `query: string`, `options: object`, and `metadata: any`, you did not define a function, you gave the model a flamethrower. Treat the schema like an API contract. The boring parts from [JSON Schema](https://json-schema.org/understanding-json-schema/) matter more than the prompt because enums, required fields, and `additionalProperties: false` are what save you from weird calls at 2 a.m. If you are using OpenAI, I would also turn on [Structured Outputs](https://platform.openai.com/docs/guides/structured-outputs) with strict schemas instead of hoping the model magically respects your format.

Here is the trap I fell into: function calling makes demos look smarter than the product really is, so people let the model choose too much. In production, I want a tiny menu of safe actions, not a backend-shaped playground.

In OpenAI-style syntax, this is the kind of definition I trust:

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

Then keep the guardrails on. Re-validate tool arguments before they touch SQL, shell commands, or third-party APIs. Keep auth and tenancy checks outside the model loop, because the model has no clue who is allowed to do what. Also budget for latency: the standard tool flow is multi-step, so one tool call can easily mean another model turn before the user gets a final answer.

My rule is simple: use function calling when the model only needs to choose from a handful of well-named operations. If you keep adding near-duplicate tools to patch product ambiguity, stop and redesign the workflow first.
