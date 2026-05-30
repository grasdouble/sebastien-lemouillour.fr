---
id: model-routing
order: 24
difficulty: advanced
tags: [routing, latency, cost, fallback, LiteLLM]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

If you send every task to your most expensive model, you are not being safe. You are refusing to measure. Classification, extraction, moderation, long-form synthesis, and code review do not need the same model profile, so pretending they do is how token bills get stupid.

The job of routing is to send each task to the cheapest model that still clears your quality bar. The [OpenAI models guide](https://platform.openai.com/docs/models) makes it obvious that capability, latency, and price vary meaningfully across the lineup. That should push you toward task classes, not one default model.

I like a routing table with four fields per task class: quality floor, latency ceiling, cost ceiling, and fallback target. The task comes in already classified, then the router picks the cheapest viable model. Do not let the model choose itself. That is the kind of autonomy that quietly turns into spend.

This is the minimum policy I want captured in code:

```python
from dataclasses import dataclass
from typing import Optional

@dataclass
class ModelSpec:
    name: str
    quality_floor: float
    latency_ceiling_ms: int
    cost_ceiling_per_1k: float
    fallback: Optional[str] = None

ROUTES = {
    "classification": ModelSpec("gpt-4o-mini", 0.88, 500, 0.005, fallback="gpt-4o"),
    "extraction":     ModelSpec("gpt-4o-mini", 0.90, 700, 0.005, fallback="gpt-4o"),
    "synthesis":      ModelSpec("gpt-4o", 0.92, 4000, 0.040, fallback=None),
}
```

Once you have policy, you need transport. [LiteLLM](https://docs.litellm.ai/) is useful because it normalizes provider APIs and gives you fallback and load-balancing primitives without forcing your routing logic into the SDK. Keep routing above the transport layer. The abstraction should make swapping providers easier, not hide the economics from you.

This is the handoff point I usually implement next:

```python
import litellm

def call_route(task_class: str, messages: list[dict]) -> str:
    spec = ROUTES[task_class]
    try:
        response = litellm.completion(model=spec.name, messages=messages)
        return response.choices[0].message.content
    except litellm.exceptions.APIError:
        if not spec.fallback:
            raise
        response = litellm.completion(model=spec.fallback, messages=messages)
        return response.choices[0].message.content
```

Routing is never finished. Providers update models, quality shifts, and yesterday's premium route becomes today's waste. That is why I want weekly evals feeding the routing table, not tribal knowledge. The orchestration lesson from [Semantic Kernel](https://learn.microsoft.com/en-us/semantic-kernel/overview/) still applies here: abstractions help, but only if your policies stay explicit and testable.

One threshold tells you the table is wrong: if more than 30% of production traffic lands on the fallback model for a route, your primary route is misconfigured. Fix the policy. The fallback is insurance, not the real path.
