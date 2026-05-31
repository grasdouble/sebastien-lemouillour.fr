---
id: ai-cost-optimization
order: 24
difficulty: advanced
tags: [production, llm]
publishedAt: 2026-12-31
updatedAt: 2026-05-31
---

If finance is quoting your model bill before anyone mentions latency, you are late. Cost optimization starts when the same feature works in staging and explodes in production because every retry, fallback, and oversized context window compounds quietly.

The first mistake is tracking total spend instead of cost per successful task. I would not approve any routing change without the same dashboard showing accepted-answer rate, retry rate, fallback rate, cache hit rate, and human-handoff rate. Provider-side prompt caching only pays when the prefix is stable and repeated, and OpenAI documents in [Prompt Caching](https://platform.openai.com/docs/guides/prompt-caching) that exact-prefix matching is what produces the cheaper path. If you cannot tell which expensive requests still ended in failure, you are not optimizing anything.

Once the metrics are honest, centralize policy. I would put routing and spend controls behind one gateway, not inside product code. [LiteLLM routing](https://docs.litellm.ai/docs/routing) gives you load balancing, retries, fallbacks, and cost-based strategies in one place, while [LiteLLM cost tracking](https://docs.litellm.ai/docs/proxy/cost_tracking) exposes spend tracking across keys, users, and teams. That setup does two useful things: it stops teams from hardcoding premium models, and it lets you change policy without redeploying five services.

If traffic is predictable and high enough, hosted APIs stop being the obvious choice. [vLLM](https://docs.vllm.ai/en/latest/) is built for high-throughput serving with continuous batching, prefix caching, and quantization. I would only take that path when utilization is steady enough to keep GPUs busy, because self-hosting without high utilization is just an expensive hobby.

Before anyone asks for a provider discount, make the cost policy executable.

```yaml
task: support-answer
max_input_tokens: 6000
preferred_tier: small
upgrade_if:
  - low_confidence
  - premium_account
cache_strategy: exact_prefix
batch_if_latency_budget_seconds_gte: 300
human_handoff_if_cost_usd_gt: 0.08
```

I also keep one brutally simple table next to that policy, because cost debates get vague the moment nobody writes down the bargain.

| Optimization lever | Typical saving                                  | Trade-off                                                         |
| ------------------ | ----------------------------------------------- | ----------------------------------------------------------------- |
| Model downgrade    | 30–80% on eligible traffic                      | Lower reasoning quality and more careful routing thresholds       |
| Prompt compression | 10–40% on input-token spend                     | Higher risk of dropping context that quietly mattered             |
| Caching            | 50–90% on repeated prefixes or repeated answers | Invalidation, stale responses, and lower freshness                |
| Batching           | Up to 50% on offline or delay-tolerant jobs     | Worse turnaround time and less control over urgent work           |
| Quantization       | 20–60% on self-hosted serving cost              | Possible quality loss plus more evaluation and serving complexity |

That kind of policy is boring, which is why it works. It forces the real questions: which flows deserve premium reasoning, which ones should reuse cached prefixes, and which ones can wait in an async queue. For offline jobs, I would choose the [Batch API](https://platform.openai.com/docs/guides/batch) before I touch the prompt again, because OpenAI states the discount is 50% and the contract is explicit: asynchronous processing with a 24-hour turnaround. If your weekly review does not separate interactive traffic from batchable traffic and from self-hosted traffic, ignore fancy optimization ideas until that split exists.
