---
id: ai-system-architecture
order: 22
difficulty: advanced
tags: [LLM, architecture, orchestration, systems]
publishedAt: 2099-12-31
updatedAt: 2026-05-31
---

Your first outage will not come from the model. It will come from the moment retrieval slows down, one tool runner stalls, and 10,000 concurrent users pile onto the same path. That is the point where architecture stops being a slide and starts being an SLA.

Treat the model as one dependency, not the application. Microsoft's [agent architecture](https://learn.microsoft.com/en-us/agents/architecture/components-of-agent-architecture) separates client, storage, orchestrator, model, and tools for a reason. I would still keep conversation state outside the orchestrator. Stateless workers autoscale better, fail cleaner, and are far less annoying to debug at 3 a.m.

There are four boxes I want to see drawn separately. First, an ingress layer that authenticates, rate-limits, and tags requests. Second, an orchestration layer that builds context and decides which capabilities may run. Third, isolated tool runners with deadlines and idempotency. Anthropic's [tool use](https://docs.anthropic.com/en/docs/agents-and-tools/tool-use/overview) makes that boundary explicit: the application executes client tools, not the model. Fourth, a model access layer, often through [LiteLLM](https://docs.litellm.ai/) or another gateway, so routing and failover are not hardcoded into product flows. If you self-host, [vLLM](https://docs.vllm.ai/) belongs in the serving layer, not in orchestration code.

Before this turns into architecture fan fiction, force a latency budget into the design. This is the minimum shape I trust.

```yaml
request_budget_ms: 4000
stages:
  auth_and_routing: 150
  retrieval: 600
  orchestration: 300
  model_inference: 2400
  tool_calls: 400
  output_validation: 150
fallback: cached-answer-or-human
```

That budget matters because every extra hop steals time from inference and increases failure fan-out. If you really need multi-minute work, queue it and poll status; [background mode](https://platform.openai.com/docs/guides/background) exists for exactly that shape. Security boundaries also belong in the diagram, not in a cleanup ticket. If the model can influence tool parameters or consume untrusted documents, the [OWASP LLM Top 10](https://genai.owasp.org/llm-top-10/) should shape interface boundaries from day one.

I prefer architectures that degrade in layers. Lose retrieval, return a narrower answer. Lose a premium model, route low-risk traffic to a cheaper fallback. Lose a tool, keep the chat useful and explicit about the limitation. If one dependency outage takes the whole feature down, you built a chain, not a system.

My rule is blunt: once one request can fan out to more than two external systems, add deadlines, circuit breakers, and fallback paths before you ship another capability.
