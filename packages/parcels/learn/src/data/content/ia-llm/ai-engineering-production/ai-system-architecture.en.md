---
id: ai-system-architecture
order: 22
difficulty: advanced
tags: [LLM, architecture, orchestration, systems]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

Every AI architecture diagram shows the happy path: user message, retrieval, model, answer. Nobody talks about what happens when the context window fills up mid-conversation, one tool call hangs, and 10,000 concurrent users hit the same retrieval cluster. That is where architecture starts being real.

The mistake is building the system as if the model were the application. It is not. The application is the coordination layer around state, tools, policies, and fallbacks. [Martin Fowler's GenAI patterns](https://martinfowler.com/articles/building-with-genai.html) are useful here because they separate UI, orchestration, and domain capabilities. I would go one step further: keep conversation state outside the orchestrator. Stateless workers scale better, fail cleaner, and are much easier to reason about during incidents.

There are four components I want to see drawn separately. First, an ingress layer that authenticates, rate-limits, and tags requests. Second, an orchestration layer that builds context and decides which capabilities may run. Third, isolated tool executors with timeouts and idempotency. Fourth, a model access layer, often through [LiteLLM](https://docs.litellm.ai/) or a provider gateway, so model routing is not hardcoded into product flows. If you self-host, [vLLM](https://docs.vllm.ai/) belongs in that serving layer, not mixed into orchestration code.

Before the architecture doc turns into fiction, force the latency budget into the design. This is the minimum shape I trust.

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

That budget matters because every additional tool or retrieval hop steals time from inference and increases failure fan-out. Security boundaries also belong in the architecture, not in a later checklist. If the model can influence tool parameters or consume untrusted documents, the risks described by the [OWASP LLM Top 10](https://owasp.org/www-project-top-10-for-large-language-model-applications/) should shape interface boundaries from day one.

I prefer architectures that degrade in layers. Lose a retrieval backend, return a narrower answer. Lose a premium model, route to a cheaper fallback for low-risk tasks. Lose a tool, keep the chat useful and explicit about the limitation. If one dependency outage takes the whole feature down, you built a chain, not a system.

My threshold is simple: once a single user request can fan out to more than two external systems, add deadlines, circuit breakers, and fallback paths before you add another capability.
