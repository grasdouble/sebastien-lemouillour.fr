---
id: agent-traces
order: 15
difficulty: intermediate
tags: [LLM, observability, tracing, LangSmith, Langfuse]
publishedAt: 2099-12-31
updatedAt: 2026-05-31
---

The user says your agent "randomly stopped after searching twice". The logs show one timeout and one 200 response. That still does not tell you what happened. Agent systems fail between steps, not just inside one API call, and that is exactly why traces matter.

A trace gives you the execution story: planner step, retrieval step, tool call, retry, guardrail, final answer. Without that chain, you are left reconstructing behavior from timestamps and guesswork. I do not consider agents debuggable until I can open one request and see the whole path from user input to side effect.

The vendor-neutral foundation is [OpenTelemetry traces](https://opentelemetry.io/docs/concepts/signals/traces/). Even if you later add a prettier interface, starting from spans and attributes keeps your instrumentation portable. Then you can plug into tools like [LangSmith](https://docs.smith.langchain.com/) or [Langfuse](https://langfuse.com/docs) when you want step-level inspection built for LLM workflows.

The mistake I see all the time is tracing too little. Teams create one span called `agent.run`, attach total latency, and call it observability. That is decoration. I want child spans for planning, each model call, each tool call, each retrieval hop, and each validation layer. I also want attributes that explain the decision surface: selected tool, retry count, token usage, cost estimate, and a safe preview of inputs and outputs. Keep those previews short: full prompt text balloons your export volume and can trigger rate limits on your tracing backend faster than you expect. For attribute naming, the [GenAI semantic conventions](https://opentelemetry.io/docs/specs/semconv/gen-ai/) (currently in development) define a standard schema for model and agent spans; adopting them now means your dashboards survive a backend swap.

This becomes even more important once you add fallback logic. A model call that looks healthy in isolation may still be part of a broken trace because the agent asked the wrong tool first, retried with stale context, then returned a polite lie. Logs catch fragments. Traces catch sequence.

I like to model spans close to the workflow itself, so the instrumentation mirrors the agent graph instead of sitting in a generic HTTP wrapper.

```typescript
import { trace } from '@opentelemetry/api';

const tracer = trace.getTracer('agent-runtime');

export async function runSupportAgent(question: string) {
  return tracer.startActiveSpan('agent.run', async (agentSpan) => {
    agentSpan.setAttribute('agent.name', 'support-agent');
    agentSpan.setAttribute('user.question.preview', question.slice(0, 120)); // truncate: never log raw prompts in full

    const plan = await tracer.startActiveSpan('llm.plan', async (planSpan) => {
      const tool = question.includes('invoice') ? 'billing.search' : 'docs.search';
      planSpan.setAttribute('agent.selected_tool', tool); // capture the routing decision
      planSpan.end();
      return tool;
    });

    const toolResult = await tracer.startActiveSpan(`tool.${plan}`, async (toolSpan) => {
      toolSpan.setAttribute('tool.name', plan);
      toolSpan.setAttribute('tool.retry_count', 0); // increment on each retry so you can spot retry storms
      const result = await searchKnowledgeBase(question, plan);
      toolSpan.setAttribute('tool.result_count', result.length); // empty results are a signal, not just a value
      toolSpan.end();
      return result;
    });

    agentSpan.setAttribute('agent.tool_result_count', toolResult.length);
    agentSpan.end(); // end the root span last, after all children

    return toolResult;
  });
}
```

My threshold is simple: if a trace cannot show you the last successful step and the next failed dependency in under 30 seconds, it is pretty telemetry, not useful telemetry.
