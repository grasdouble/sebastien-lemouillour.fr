---
id: llm-agents
order: 3
difficulty: advanced
tags: [IA, LLM, agents, function-calling]
publishedAt: 2026-05-29
updatedAt: 2026-05-29
---

## When a single API call stops being enough

You've built a support workflow. It starts with a user complaint, and for a while, one LLM call does the job: read the message, generate a response. Then a request comes in that needs account data. Fine, you add a lookup. Then another that requires checking payment history. Then cross-referencing an incident log. Suddenly you're writing branching code to handle every combination, and the workflow is longer than it is smart.

An agent is the answer to this kind of combinatorial growth, but not in the way it's usually sold. The magic isn't autonomy. The value is a control loop: observe the current state, choose an action, execute it, see what you get, then decide whether you're done or need another step. That loop is what lets the system adapt to what it discovers, instead of requiring you to code every possible path in advance.

The tradeoff is real, though. An agent is harder to test, more expensive to run, and significantly harder to debug than a deterministic function. If your workflow has a predictable shape (even a complex one), explicit code is usually the right answer. I reach for agents when the environment is genuinely unknown at runtime, and the next action depends on what the previous one returned.

## Function calling / Tool use

The first thing that makes an agent possible is giving the model a way to act on the world. Not by executing code itself: the model returns a structured decision (a tool name and arguments), and your application validates and runs the actual call. The result gets injected back into the conversation, and the model keeps going.

The tool schema is where most teams underinvest. It's not boilerplate: it's a contract. `properties` defines what the model can request. `required` removes ambiguity. `enum` prevents it from inventing values. Descriptions act as routing hints. A tight schema dramatically narrows the space of things the model can do wrong before it even takes a step.

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

A single tool call is already useful on its own: structured retrieval, deterministic dispatch, typed results. The loop comes next.

## The ReAct pattern

A tool call gives the model one action. ReAct (Reason + Act) gives it a reasoning loop: the model breaks the task into a sequence of thought → action → observation steps, adjusting its plan based on what each step returns.

The value isn't "smarter AI": it's explicitness. You can look at the trace and see why the agent checked deployments before metrics, what observation changed the plan, and where it got stuck. That's genuinely useful for debugging, and for building trust that the system is doing what you think it's doing.

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

The cost is real: more tokens per request, and the risk of the loop spending cycles reasoning instead of converging. A fixed plan (where you know the steps in advance) is almost always cheaper and safer. ReAct earns its place when the plan itself can't be written ahead of time.

## Building a minimal agent loop

The loop is just a bounded state machine. What matters in production isn't elegance: it's the guardrails: an explicit iteration cap, strict tool dispatch, structured error propagation, and a log at every step. Without those, debugging an agent failure becomes guesswork.

The example below parses tool arguments directly from JSON. In production, validate them against your schema before dispatch: the model will eventually send arguments that fail your business rules, and you want to surface that as a tool error, not a silent bug.

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

`max_iterations` is the first guardrail everyone adds and the first one everyone underestimates. An agent can stay within its cap while still producing zero useful information: calling the same tool with slightly rephrased arguments, getting the same result, and continuing anyway. Loop-level telemetry, duplicate-action detection, and escalating stop conditions all matter as much as the cap itself.

Tool argument hallucination is the other failure mode nobody warns you about until they hit it. The model invents unsupported enum values, omits required fields, or sends semantically invalid combinations. The fix isn't prompt engineering: it's validation at the tool boundary. Validate before execution, return a structured error the model can read, and the loop often recovers on its own.

Cost in multi-turn agents compounds fast. Every iteration replays the full message history (prior reasoning, tool calls, observations), so the bill scales with depth, not just count. Budget accordingly, and log enough to explain why an agent ran twelve iterations instead of three when it inevitably does.

My honest recommendation: if the workflow can be expressed as deterministic code, express it as deterministic code. Agents are genuinely powerful for tasks that are open-ended, require conditional branching based on real-time data, and where you can't enumerate the branches in advance. For anything else, the operational overhead isn't worth it.
