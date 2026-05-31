---
id: ai-application-scalability
order: 23
difficulty: advanced
tags: [production, llm]
publishedAt: 2026-12-31
updatedAt: 2026-05-31
---

The demo survived fifty users, so everybody pretended the system was ready. Then one customer pasted a year of ticket history, another opened five tabs, and your queue time passed inference time. Scalability pain in AI apps usually starts with too much work per request, not with a lack of GPUs.

The first fix is boring, which is why teams dodge it. The [latency guide](https://developers.openai.com/api/docs/guides/latency-optimization) says output tokens dominate latency and prompt trimming helps less unless contexts are already huge. Repeated prefixes should use [prompt caching](https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching), because recomputing the same system prompt on every call is self-inflicted pain. If you serve your own weights, [vLLM](https://docs.vllm.ai/) exists for high-throughput inference, and the [vLLM paper](https://arxiv.org/abs/2309.06180) is still the reference for why paged KV memory and continuous batching hold up under concurrent load. For the gateway, I would start with [LiteLLM routing](https://docs.litellm.ai/docs/routing), not a homegrown router, and I would keep its documented `simple-shuffle` default until real traffic proves you need something more expensive.

I scale AI systems in this order. First, remove useless tokens. Second, separate traffic by business criticality. Third, cache or batch the paths that repeat. Fourth, add capacity. Most teams start at step four because buying capacity is politically easier than telling prompt owners they are wasting half the latency budget. They also skip the ugly load test, the one with long conversations, mixed tenant sizes, retrieval misses, and client cancellations. That is exactly where the queue starts lying.

This is the routing shape I would ship first.

```yaml
model_list:
  - model_name: fast-lane
    litellm_params:
      model: openai/gpt-4.1-mini
      weight: 3
  - model_name: fast-lane
    litellm_params:
      model: openai/gpt-4.1
      weight: 1
  - model_name: quality-lane
    litellm_params:
      model: openai/gpt-4.1

router_settings:
  routing_strategy: simple-shuffle
```

That keeps the policy readable. The product chooses `fast-lane` or `quality-lane` by SLA, and the router stays on the lowest-overhead strategy until you have measurements that justify latency-based or usage-based routing. I would also make backpressure explicit: queue caps, tenant quotas, timeout budgets, and cancellation when the client disappears. Silent work on abandoned requests is how you burn margin and still miss latency objectives.

My decision rule is blunt: if P95 misses the target while serving infrastructure is comfortably underutilized, redesign the request path. If utilization is high and queues still grow after prompt cleanup, caching, and batching, then buy capacity.
