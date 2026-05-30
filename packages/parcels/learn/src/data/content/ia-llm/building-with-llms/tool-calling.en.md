---
id: tool-calling
order: 15
difficulty: intermediate
tags: [LLM, Anthropic, OpenAI, tools, orchestration]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

One tool feels clever. Three tools, two retries, and one timeout later, you realize you accidentally built a tiny distributed system inside a chat feature.

That is why I separate function calling from tool calling. Function calling is the payload format. Tool calling is the runtime loop around it. The model asks to use a tool, your app decides whether that call is allowed, executes it, then sends the result back. Anthropic documents that loop in [tool use](https://docs.anthropic.com/en/docs/build-with-claude/tool-use), OpenAI wraps the same idea in its [Agents guide](https://platform.openai.com/docs/guides/agents), and the older [function calling guide](https://platform.openai.com/docs/guides/function-calling) is still the cleanest place to understand the argument shape.

The important bit is not the JSON. The important bit is who owns the loop. It should be your runtime, not the model. The model can suggest the next action. It should never decide budgets, side effects, or whether retry number four is a good idea.

Before the code, here is the shortcut I wish somebody had given me: treat every tool like an unreliable network dependency, even when it is just a local function today. That mindset forces you to add timeouts, idempotency, and logs before production teaches you the lesson the expensive way.

This is the control loop I would actually keep in an app:

```ts
const MAX_TOOL_HOPS = 4;

for (let hop = 0; hop < MAX_TOOL_HOPS; hop += 1) {
  const response = await callModel(messages, tools);
  const toolRequest = extractToolRequest(response);

  if (!toolRequest) return response;

  assertAllowedTool(toolRequest.name); // allowlist
  const args = validateArgs(toolRequest.name, toolRequest.input); // schema check

  const result = await runWithTimeout(
    () => executeTool(toolRequest.name, args),
    4_000 // milliseconds
  );

  messages.push(response);
  messages.push({
    role: 'tool',
    tool_call_id: toolRequest.id,
    content: JSON.stringify(result),
  });
}

throw new Error('Tool loop exceeded max hops');
```

A few production habits matter immediately. Put a hard cap on tool hops, otherwise a confused model will spend your budget in circles. Make write operations idempotent, because the same call may be retried after a partial failure. Log tool name, latency, and outcome for every hop, because “the agent was weird” is not a useful incident report. And if a tool can touch money, email, or customer data, add a human approval step before execution.

I use tool calling when the model genuinely needs external state to finish the task. If the tool result does not change the next decision, skip the loop and call the service directly. You will get the same outcome with fewer moving parts.
