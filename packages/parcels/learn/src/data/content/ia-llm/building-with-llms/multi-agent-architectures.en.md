---
id: multi-agent-architectures
order: 21
difficulty: advanced
tags: [agent, architecture, orchestration, observability, LangGraph]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

A lot of teams split one mediocre agent into five mediocre agents and call it a platform. What they actually built is extra latency, extra coordination, and a debugging story nobody wants to own.

Multi-agent architecture only earns its keep when one of three things is true: parts of the task can run in parallel, the required specializations actively conflict inside one system prompt, or you need hard tool isolation between roles. If none of that is happening, keep one agent and fix its plan. [AutoGen](https://microsoft.github.io/autogen/) and [LangGraph](https://langchain-ai.github.io/langgraph/) both make multi-agent orchestration possible, but neither of them protects you from inventing unnecessary traffic between components.

The orchestrator is where most designs go bad. I do not want the orchestrator reasoning about the business problem. I want it routing structured work to specialists and aggregating typed results. If the orchestrator prompt contains domain judgment, you misplaced the logic.

Here is the level of orchestration I trust in production:

```python
from typing import Callable

AGENTS: dict[str, Callable] = {
    "security": security_agent,
    "pricing": pricing_agent,
    "docs": docs_agent,
}

def dispatch(subtask: Subtask) -> Result:
    handler = AGENTS.get(subtask.tool_hint)
    if handler is None:
        raise ValueError(f"No agent for {subtask.tool_hint}")
    return handler(subtask)
```

No fallback to guessing. No "best effort" reroute. If the plan says a pricing specialist is required and none exists, fail loudly and fix the plan.

Observability is the part tutorials wave away, and it is the first thing that hurts in production. Every message that crosses an agent boundary should carry a `task_id`, sender, receiver, token count, latency, and exit status. Otherwise, once a run fails, you are reconstructing behavior from partial logs and hope. The same orchestration concern shows up in [Semantic Kernel](https://learn.microsoft.com/en-us/semantic-kernel/overview/): composition matters, but only if you can trace it.

The math is not negotiable. A three-agent path with 95% reliability per hop gives you about 86% end-to-end reliability before retries. Add approval gates, network variance, or tool calls, and the number gets worse fast.

My rule is boring and effective: if you cannot point to parallelism, conflicting specialization, or a security boundary, you do not need multiple agents. You need a better single-agent design.
