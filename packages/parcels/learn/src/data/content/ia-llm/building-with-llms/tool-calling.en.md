---
id: tool-calling
order: 15
difficulty: intermediate
tags: [LLM, Anthropic, OpenAI, tools, orchestration]
publishedAt: 2026-05-31
updatedAt: 2026-05-31
---

You've wired your first LLM call, the demo works, then the model decides to search twice, retry a write, and ask for one more tool just to be safe. Congrats, your chat feature now has failure modes.

I separate function calling from tool calling because the distinction saves architecture mistakes. Function calling is the schema. Tool calling is the loop you own. Across providers, the contract is basically the same: you send tool definitions, the model returns a structured request when it needs one, your code executes it, then you feed the result back. OpenAI documents that as a multi-step function-calling flow, Anthropic frames it as `tool_use` plus `tool_result`, and Gemini does the same with function declarations and a call `id` you return with the result ([OpenAI](https://developers.openai.com/api/docs/guides/function-calling), [Anthropic](https://platform.claude.com/docs/en/agents-and-tools/tool-use/how-tool-use-works), [Gemini](https://ai.google.dev/gemini-api/docs/function-calling)).

The part people underestimate is not the JSON. It is control. If the model owns retries, budgets, or write access, you did not build an agent. You delegated your future incident report.

The shortcut I wish I had stolen earlier: treat every tool like a flaky remote dependency, even when it is a local helper today. That mindset pushes you toward timeouts, schema validation, idempotency, and logs before production gets opinionated on your behalf.

This is the loop I would actually ship:

```ts
const MAX_TOOL_HOPS = 4;

for (let hop = 0; hop < MAX_TOOL_HOPS; hop += 1) {
  const assistantTurn = await callModel({ messages, tools });
  const toolCalls = readToolCalls(assistantTurn);

  if (toolCalls.length === 0) {
    return assistantTurn;
  }

  const toolResults = await Promise.all(
    toolCalls.map(async (toolCall) => {
      assertAllowedTool(toolCall.name);
      const args = validateArgs(toolCall.name, toolCall.args);

      const output = await runWithTimeout(() => executeTool(toolCall.name, args), 4_000);

      return {
        callId: toolCall.id,
        output,
      };
    })
  );

  logToolHop({ hop, toolCalls, toolResults });
  messages.push(assistantTurn, formatToolResults(toolResults));
}

throw new Error('Too many tool hops');
```

A few production habits pay for themselves fast. Cap the number of hops, because confused models can burn budget in circles. Keep write tools idempotent, because partial failures love replaying the same action. Log tool name, latency, and outcome on every hop, because “the agent got weird” is not a serious postmortem. If a tool can move money, contact customers, or change data, put a human approval step in front of it.

My rule is simple: use tool calling when the model needs fresh state or has to choose between external actions. If you already know which service to call, skip the ceremony and call it yourself. Fewer loops, fewer surprises.
