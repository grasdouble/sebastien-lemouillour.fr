---
id: llm-agents
order: 5
difficulty: advanced
tags: [IA, LLM, agents, function-calling]
---

## What is an agent?

Imagine a support workflow that starts with a simple user complaint but quickly turns into a multi-step investigation. You need to check the user's account, query a payments API, cross-reference with an incident log, then formulate a response. A single API call cannot do that reliably: it performs one input → output transformation. An agent adds a control loop: observe current state, choose an action, execute it, observe the result, then decide whether another step is needed.

That distinction matters architecturally. A simple API call is easier to bound, test, and cost-model. An agent becomes useful when the environment is partially unknown at runtime and the next step depends on what you discover along the way. You pay for that flexibility in tokens, orchestration code, observability complexity, and debugging effort. If the workflow is already expressible as explicit code, deterministic, and latency-sensitive, an agent is usually the wrong abstraction.

## Function calling / Tool use

The first brick of an agent is the ability to call external tools. Rather than hardcoding logic, you describe available tools as JSON schemas. The model doesn't execute code itself — it returns a tool name and arguments, your application validates and runs the call, then reinjects the result into the conversation.

The schema matters more than most teams expect. `properties` define the callable surface, `required` removes ambiguity, `enum` prevents drift on bounded values, and descriptions act as routing hints. A good schema reduces the action space before the model ever takes a step.

```typescript
import OpenAI from 'openai';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function lookupWeather(city: string, unit: 'celsius' | 'fahrenheit') {
  return JSON.stringify({
    city,
    unit,
    temperature: unit === 'celsius' ? 18 : 64,
    conditions: 'windy',
  });
}

async function main() {
  const tools = [
    {
      type: 'function' as const,
      function: {
        name: 'lookup_weather',
        description: 'Get the current weather for a city.',
        parameters: {
          type: 'object',
          properties: {
            city: {
              type: 'string',
              description: 'City name, for example Paris or Tokyo.',
            },
            unit: {
              type: 'string',
              enum: ['celsius', 'fahrenheit'],
              description: 'Temperature unit expected by the user.',
            },
          },
          required: ['city', 'unit'],
          additionalProperties: false,
        },
      },
    },
  ];

  const messages = [
    { role: 'system' as const, content: 'You may use tools when needed. Be precise.' },
    { role: 'user' as const, content: 'What is the weather in Paris in celsius?' },
  ];

  const first = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages,
    tools,
  });

  const message = first.choices[0]?.message;
  const toolCall = message?.tool_calls?.[0];

  if (!toolCall || toolCall.function.name !== 'lookup_weather') {
    throw new Error('Model did not call the expected tool.');
  }

  const args = JSON.parse(toolCall.function.arguments) as {
    city: string;
    unit: 'celsius' | 'fahrenheit';
  };

  const toolResult = await lookupWeather(args.city, args.unit);

  const final = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      ...messages,
      message,
      {
        role: 'tool' as const,
        tool_call_id: toolCall.id,
        content: toolResult,
      },
    ],
    tools,
  });

  console.log(final.choices[0]?.message?.content);
}

main().catch(console.error);
```

Once tools exist, the next problem is coordination. The model now has ways to act on the world, but it still needs a pattern for deciding when to call which tool and how to use the result.

## The ReAct pattern

Once tools exist, you need a way to chain them intelligently. ReAct (Reason + Act) is the pattern: the model decomposes the task into a sequence of reasoning steps, tool calls, and observations. In practice, the interest isn't “magical” autonomy, but explicit intermediate state — you can inspect why the agent queried system A before system B, what observation changed the plan, and where it got stuck.

```text
User: Find why checkout latency increased after the last deployment.
Thought: I need to compare recent deploys with current service health and latency signals.
Action: get_recent_deployments(service="checkout", limit=3)
Observation: v2025.09.14 was deployed 42 minutes ago.
Thought: I should verify whether the latency regression started after that deployment.
Action: query_metrics(metric="checkout_p95_latency", window="2h")
Observation: p95 jumped from 420ms to 1.8s 35 minutes ago.
Thought: The timing aligns. I need an error signal to distinguish load from a bad release.
Action: query_metrics(metric="checkout_error_rate", window="2h")
Observation: error rate is flat.
Thought: Errors are flat, so this looks like a performance regression rather than an outage.
Action: summarize_findings()
Observation: likely regression introduced by v2025.09.14; rollback or profile DB calls.
```

In architecture, ReAct is useful because it improves auditability and debugging. Its cost is extra tokens and the risk of delegating too much reasoning to a loop when a fixed plan would have been cheaper and safer.

## Building a minimal agent loop

A minimal agent loop is just a bounded state machine. What really matters in production: an explicit iteration limit, strict tool dispatch, structured error propagation, and logs at every step. For brevity, the example parses tool arguments as JSON directly; in production, validate them against the same runtime schema before dispatch.

```typescript
import OpenAI from 'openai';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const MAX_ITERATIONS = 8;

const tools = [
  {
    type: 'function' as const,
    function: {
      name: 'search_docs',
      description: 'Search internal documentation for a technical topic.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Precise search query.' },
        },
        required: ['query'],
        additionalProperties: false,
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'get_service_status',
      description: 'Fetch the current status of a production service.',
      parameters: {
        type: 'object',
        properties: {
          service: { type: 'string', description: 'Service identifier.' },
        },
        required: ['service'],
        additionalProperties: false,
      },
    },
  },
];

const handlers: Record<string, (args: Record<string, unknown>) => Promise<string>> = {
  async search_docs(args) {
    return JSON.stringify({
      query: args.query,
      hits: ['Runbook: Checkout latency', 'Playbook: Database pool saturation'],
    });
  },
  async get_service_status(args) {
    return JSON.stringify({
      service: args.service,
      status: 'degraded',
      p95LatencyMs: 1800,
    });
  },
};

async function runAgent(userRequest: string) {
  const messages = [
    {
      role: 'system' as const,
      content:
        'You are an ops investigation agent. Use tools when needed, cite evidence, and stop when you can answer confidently.',
    },
    { role: 'user' as const, content: userRequest },
  ];

  for (let iteration = 1; iteration <= MAX_ITERATIONS; iteration += 1) {
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      tools,
      temperature: 0,
    });

    const choice = response.choices[0];
    const message = choice?.message;

    if (!message) {
      throw new Error('Missing assistant message.');
    }

    console.log(`[agent] iteration=${iteration} finish_reason=${choice.finish_reason}`);
    messages.push(message);

    if (choice.finish_reason === 'stop') {
      return message.content ?? '';
    }

    const toolCalls = message.tool_calls ?? [];

    for (const toolCall of toolCalls) {
      const handler = handlers[toolCall.function.name];

      if (!handler) {
        messages.push({
          role: 'tool' as const,
          tool_call_id: toolCall.id,
          content: JSON.stringify({ error: `Unknown tool: ${toolCall.function.name}` }),
        });
        continue;
      }

      try {
        const args = JSON.parse(toolCall.function.arguments) as Record<string, unknown>;
        const result = await handler(args);

        messages.push({
          role: 'tool' as const,
          tool_call_id: toolCall.id,
          content: result,
        });
      } catch (error) {
        messages.push({
          role: 'tool' as const,
          tool_call_id: toolCall.id,
          content: JSON.stringify({
            error: error instanceof Error ? error.message : 'Tool execution failed',
          }),
        });
      }
    }
  }

  throw new Error(`Agent stopped after reaching max iterations (${MAX_ITERATIONS}).`);
}

runAgent('Investigate whether checkout is degraded and explain why.')
  .then((answer) => console.log(answer))
  .catch((error) => console.error(error));
```

## Tradeoffs and failure modes

The first failure mode is infinite or low-value loops. `max_iterations` is mandatory, but not sufficient. Once you deploy a real agent, you discover that it can keep calling the same tool with slightly different wording and produce no new information. That is why loop-level telemetry, duplicate-action detection, and escalating stop rules matter.

Then you hit the second problem: tool arguments hallucinate. The model invents unsupported enum values, omits required fields, or sends semantically invalid requests. If you validate before execution and return machine-readable tool errors, the loop can often recover instead of failing silently.

Next comes cost. Multi-turn agents replay prior messages and tool results on every iteration, so the bill is not only model spend but also latency, queue pressure, and more opportunities for partial failure. Finally, debugging becomes its own system requirement: prompt version, tool schema version, requested arguments, execution result, duration, retries, and final answer all need to be logged if you want postmortems to be based on evidence instead of guesswork.

The final trade-off is autonomy vs control. If the task can be encoded as a deterministic state machine, a workflow engine, or a document retrieval pipeline, prefer that. Agents excel at local decision-making under uncertainty — not at replacing clear business logic.
