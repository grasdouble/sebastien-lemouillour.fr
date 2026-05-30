---
id: ai-application-scalability
order: 23
difficulty: advanced
tags: [LLM, scalability, vLLM, LiteLLM]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

The demo handled fifty users and everybody relaxed. Then one customer pasted a giant ticket history, another opened five tabs, and suddenly your queue time is longer than inference. AI scalability problems rarely start with CPU. They start with too much work per request.

At scale, there are only four levers that matter: shrink the prompt, reduce unnecessary retrieval, batch inference, and route requests by SLA. Throwing more machines at a bad prompt pipeline just buys you a more expensive failure. This is why [vLLM](https://docs.vllm.ai/) is important. Its serving model is designed for high-throughput inference, and features like continuous batching change the economics of concurrent traffic. The gateway layer matters too. With [LiteLLM](https://docs.litellm.ai/), routing and fallback policy can live outside product code, which is how you keep one traffic spike from turning into a rewrite.

I scale AI systems in this order. First, remove useless tokens. Second, split traffic by task criticality. Third, batch or cache aggressively. Fourth, add capacity. Most teams start at step four because buying capacity feels simpler than arguing with prompt owners. They also skip the ugly load test, the one with long conversations, mixed tenant sizes, and retrieval misses, which is exactly where the queue starts lying to you.

Here is the kind of routing policy I want before traffic gets serious.

```yaml
model_list:
  - model_name: fast-lane
    litellm_params:
      model: gpt-4.1-mini
  - model_name: quality-lane
    litellm_params:
      model: gpt-4.1

router_settings:
  routing_strategy: usage-based-routing
  fallbacks:
    - fast-lane: ['quality-lane']
```

That only works if the rest of the architecture cooperates. [Martin Fowler's patterns](https://martinfowler.com/articles/building-with-genai.html) are a good reminder that orchestration, memory, and domain logic should not collapse into one service. If they do, you cannot scale them independently. You also need explicit backpressure: queue limits, tenant quotas, timeout budgets, and cancellation when the client disappears. Silent work on abandoned requests is how AI systems burn money and still miss latency objectives.

Do not obsess over raw QPS without looking at tokens per second, prompt growth, and tool fan-out. Those are usually the real bottlenecks. My rule is blunt: if P95 latency misses your target while serving infrastructure is comfortably underutilized, your problem is request design, not hardware.
