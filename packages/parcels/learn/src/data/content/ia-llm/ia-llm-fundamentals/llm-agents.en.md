---
id: llm-agents
order: 5
difficulty: advanced
tags: [IA, LLM, agents, function-calling]
---

## What is an agent?

An agent is not "an LLM with a long prompt". In production terms, an agent is a control loop that combines four capabilities: an LLM for policy selection, tools for side effects, memory for carrying forward relevant state, and a planner or iteration loop that decides what to do next from intermediate results. A single API call maps input to output once. An agent inspects the current state, chooses an action, executes it, observes the result, and decides whether another step is required.

That distinction matters architecturally. A simple API call is easier to bound, test and cost-model. An agent is useful when the task is open-ended, requires conditional branching, or depends on external systems: multi-step support workflows, investigation over several data sources, orchestration across internal APIs, or constrained autonomous remediation. If the workflow is already known, deterministic, and latency-sensitive, an agent is often the wrong abstraction. You pay in tokens, orchestration code, observability requirements, and debugging complexity. Use agents when the environment is partially unknown at runtime; do not use them to replace a pipeline that can already be expressed as explicit code.

## Function calling / Tool use

Function calling lets the model choose from a set of tools described by JSON schema. The model does not execute code itself. It returns a tool name and arguments, your application validates and executes the call, then reinjects the tool result into the conversation so the model can continue. The tool description is therefore part API contract, part policy boundary.

The schema matters more than most teams expect. `properties` expose the callable surface, `required` reduces ambiguity, `enum` prevents drift on bounded values, and descriptions act as routing hints. Good schemas narrow the action space and reduce argument hallucination.

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

## The ReAct pattern

ReAct stands for Reason + Act. The model decomposes a task into a sequence of reasoning steps, tool invocations, and observations. In practice, the value is not mystical autonomy; it is explicit intermediate state. You can inspect why the agent queried system A before system B, which observation changed the plan, and where it became stuck. In providers that do not expose private chain-of-thought, persist concise decision summaries or action rationales instead of raw internal reasoning.

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

For architecture work, ReAct is valuable because it improves auditability and debugging. You can persist each action/observation pair, reconstruct decisions after incidents, and build guardrails at the tool boundary. The downside is token overhead and the risk of over-delegating reasoning to a loop when a fixed plan would have been cheaper and safer.

## Building a minimal agent loop

A minimal agent loop is just a bounded state machine. The key production features are: explicit iteration limits, strict tool dispatch, structured error propagation, and logs for every step. For brevity, the example parses tool arguments as JSON directly; in production, validate them against the same runtime schema before dispatch.

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

The first failure mode is the infinite or low-value loop. `max_iterations` is mandatory, but not sufficient; you also want loop-level telemetry, duplicate-action detection, and escalating stop rules when the agent keeps querying the same tool with minor prompt variations. Second, tool arguments hallucinate. The model may invent unsupported enum values, omit required fields, or pass semantically invalid requests. Validate before execution and return machine-readable tool errors so the model can self-correct.

Third, multi-turn agents are expensive. Every iteration replays prior messages and tool results. Cost is not just model spend; it is also latency, queue pressure, and more places for partial failure. Fourth, debugging requires full step logs: prompt version, tool schema version, requested arguments, execution result, duration, retries, and final answer. Without this, postmortems become guesswork.

The final tradeoff is autonomy versus control. If the task can be encoded as a deterministic state machine, workflow engine, or retrieval pipeline, prefer that. Agents are strongest at local decision-making under uncertainty, not at replacing clear business logic. A good production design constrains the agent to the smallest surface where model judgment adds value, and keeps everything else explicit, typed and observable.
