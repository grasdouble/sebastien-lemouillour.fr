---
id: llm-agents
order: 3
difficulty: advanced
tags: [IA, LLM, agents, function-calling]
publishedAt: 2026-05-12
updatedAt: 2026-05-30
---

## When a single API call stops being enough

You start with one prompt and one response. Then the workflow needs account data, a billing check, a log lookup, maybe a web search. Now the branch logic is bigger than the business problem, and every new edge case lands in application code nobody wants to own.

That is the moment to think about an agent. Not because “autonomy” is impressive, but because a control loop is cheaper than hand-coding every runtime branch. The useful definition is still the boring one: a model observes state, chooses a tool, receives the result, and decides whether to stop or continue. OpenAI documents the same tool-calling loop in its [function calling](https://platform.openai.com/docs/guides/function-calling) guide, and Anthropic describes the same pattern with `tool_use` and `tool_result` blocks in its [Anthropic docs](https://docs.anthropic.com/en/docs/agents-and-tools/tool-use/overview).

The tradeoff is brutal. Agents are harder to test, harder to bound, and much harder to explain during an incident. If the workflow has a known shape, write explicit code. I reach for an agent only when the next step depends on data I cannot know before execution starts.

## Tool schemas are where reliability starts

Most teams waste time on prompts and underinvest in schemas. That is backwards. `required` removes ambiguity, `enum` blocks invented values, `additionalProperties: false` cuts off garbage, and strict schema enforcement moves failure to the tool boundary instead of production state.

This is the smallest loop worth shipping to a staging environment.

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
      name: 'lookup_weather',
      description: 'Get the current weather for a city.',
      strict: true,
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
  ];

  const input: any[] = [{ role: 'user', content: 'What is the weather in Paris in celsius?' }];

  const first = await client.responses.create({
    model: 'gpt-5',
    tools,
    input,
  });

  input.push(...first.output);

  for (const item of first.output) {
    if (item.type !== 'function_call' || item.name !== 'lookup_weather') {
      continue;
    }

    const args = JSON.parse(item.arguments) as {
      city: string;
      unit: 'celsius' | 'fahrenheit';
    };

    input.push({
      type: 'function_call_output',
      call_id: item.call_id,
      output: await lookupWeather(args.city, args.unit),
    });
  }

  const final = await client.responses.create({
    model: 'gpt-5',
    tools,
    input,
  });

  console.log(final.output_text);
}

main().catch(console.error);
```

A single tool call is already useful: deterministic dispatch, typed inputs, observable failure. The agentic part starts only when you let the loop continue.

## ReAct is useful, but hidden reasoning is not your interface

The ReAct idea still matters because it gives you an operational shape: inspect state, take one action, inspect the result, then choose again. LangChain uses almost that exact definition for agents in its [LangChain agents](https://docs.langchain.com/oss/javascript/langchain/agents) docs. What does not belong in your architecture is any dependency on seeing the model’s private chain-of-thought. Some providers expose reasoning items, some redact them, and none of that is a contract you should build policy around.

Treat the next trace as a teaching device, not as something your production system must persist verbatim.

```text
User: Find why checkout latency increased after the last deployment.
Plan: Compare the latest deploy with current latency and error signals.
Action: get_recent_deployments(service="checkout", limit=3)
Observation: v2026.05.30 was deployed 42 minutes ago.
Decision: Check whether the latency jump starts after that deploy.
Action: query_metrics(metric="checkout_p95_latency", window="2h")
Observation: p95 jumped from 420ms to 1.8s 35 minutes ago.
Decision: Separate load from a bad release.
Action: query_metrics(metric="checkout_error_rate", window="2h")
Observation: error rate is flat.
Decision: Likely performance regression, not a broad outage.
Action: summarize_findings()
Observation: probable regression introduced by v2026.05.30; rollback or profile database calls.
```

If you already know the full plan before the first call, skip ReAct and encode the graph yourself. The loop earns its keep only when observations change the next action.

## Build the loop as a bounded state machine

Production agents fail less because the model is smarter and more because the runtime is stricter: cap the number of steps, log every step, reject unknown tools, validate arguments, and return structured errors the model can recover from.

This is what that loop looks like when you stop pretending the model is deterministic.

```typescript
import OpenAI from 'openai';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const MAX_STEPS = 8;

const tools = [
  {
    type: 'function' as const,
    name: 'search_runbooks',
    description: 'Search runbooks for a technical issue.',
    strict: true,
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Precise search query.' },
      },
      required: ['query'],
      additionalProperties: false,
    },
  },
  {
    type: 'function' as const,
    name: 'get_service_status',
    description: 'Fetch current latency and availability for a service.',
    strict: true,
    parameters: {
      type: 'object',
      properties: {
        service: { type: 'string', description: 'Service identifier.' },
      },
      required: ['service'],
      additionalProperties: false,
    },
  },
];

const handlers: Record<string, (args: Record<string, unknown>) => Promise<string>> = {
  async search_runbooks(args) {
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
  const input: any[] = [
    {
      role: 'system',
      content:
        'You investigate service issues. Use tools when needed, cite evidence, and stop as soon as the answer is defensible.',
    },
    { role: 'user', content: userRequest },
  ];

  for (let step = 1; step <= MAX_STEPS; step += 1) {
    const response = await client.responses.create({
      model: 'gpt-5',
      tools,
      input,
    });

    input.push(...response.output);

    const toolCalls = response.output.filter(
      (item): item is Extract<(typeof response.output)[number], { type: 'function_call' }> =>
        item.type === 'function_call'
    );

    console.log(`[agent] step=${step} tool_calls=${toolCalls.length}`);

    if (toolCalls.length === 0) {
      return response.output_text;
    }

    for (const toolCall of toolCalls) {
      const handler = handlers[toolCall.name];

      if (!handler) {
        input.push({
          type: 'function_call_output',
          call_id: toolCall.call_id,
          output: JSON.stringify({ error: `Unknown tool: ${toolCall.name}` }),
        });
        continue;
      }

      try {
        const args = JSON.parse(toolCall.arguments) as Record<string, unknown>;
        const result = await handler(args);

        input.push({
          type: 'function_call_output',
          call_id: toolCall.call_id,
          output: result,
        });
      } catch (error) {
        input.push({
          type: 'function_call_output',
          call_id: toolCall.call_id,
          output: JSON.stringify({
            error: error instanceof Error ? error.message : 'Tool execution failed',
          }),
        });
      }
    }
  }

  throw new Error(`Agent stopped after reaching max steps (${MAX_STEPS}).`);
}

runAgent('Investigate whether checkout is degraded and explain why.')
  .then((answer) => console.log(answer))
  .catch((error) => console.error(error));
```

Once that loop is stable, decide whether you even need a framework. OpenAI already exposes hosted capabilities and remote MCP servers through the `tools` parameter in its [built-in tools](https://platform.openai.com/docs/guides/tools) guide. MCP itself is now a public interoperability layer, not a vendor rumor, and the official [MCP](https://modelcontextprotocol.io/docs/getting-started/intro) docs are the place to check what “standardized tool access” actually means before you buy into any framework story.

## Failure modes that matter in production

`MAX_STEPS` is the obvious guardrail, and it is not enough. Agents can stay under the cap while doing useless work: same tool, same result, slightly different wording. Track duplicate actions, repeated observations, latency per step, and cost per successful outcome. If you cannot explain why one request took seven steps and the previous one took two, you do not have an agent system yet. You have a slot machine with logs.

Tool argument hallucination is the other chronic failure. The model invents enum values, omits required fields, or sends combinations your business logic cannot accept. The fix is not more prompt poetry. The fix is validation at the tool boundary and error payloads that let the model retry with better arguments.

Cost also compounds faster than most teams expect. Each step adds more state, more tool outputs, and more surface area for retries. If the workflow can be drawn as a finite graph before you write code, build the graph and skip the agent. Keep the agent for cases where the graph only appears after the first tool result.
