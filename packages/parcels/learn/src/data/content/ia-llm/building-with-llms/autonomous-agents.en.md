---
id: autonomous-agents
order: 20
difficulty: advanced
tags: [agent, autonomy, monitoring, escalation, AutoGen]
publishedAt: 2026-05-31
updatedAt: 2026-05-31
---

You gave an agent permission to clean stale records, and it wiped out half a table because nobody defined what stale meant. That is not a funny demo failure. That is what unbounded autonomy looks like in production.

The wrong question is, "How autonomous can this agent become?" The right one is, "What is the minimum autonomy this task needs, and what hard stop prevents the agent from freelancing past that boundary?" The [HITL docs](https://openai.github.io/openai-agents-python/human_in_the_loop/) push tool-level approval rules and interruptions for a reason. If an action can write, delete, publish, or send, the boundary belongs in the executor, not in the prompt.

I use three limits every time: action budget, wall-clock budget, and irreversibility threshold. The first two control cost and latency. The third one controls regret. Agents should be allowed to browse, summarize, and draft far more freely than they are allowed to mutate state.

This is the kind of envelope I want every tool call to pass through:

```python
import time

class AutonomyEnvelope:
    def __init__(self, max_actions: int, max_seconds: int, allow_irreversible: bool):
        self.max_actions = max_actions
        self.deadline = time.time() + max_seconds
        self.allow_irreversible = allow_irreversible
        self.action_count = 0

    def check(self, is_irreversible: bool = False) -> None:
        if self.action_count >= self.max_actions:
            raise RuntimeError("Action budget exhausted")
        if time.time() > self.deadline:
            raise RuntimeError("Time budget exhausted")
        if is_irreversible and not self.allow_irreversible:
            raise PermissionError("Blocked by policy")
        self.action_count += 1
```

The agent never gets to redefine these limits mid-run. If it wants more budget, it escalates.

The next thing most teams skip is monitoring. Logs tell you what happened after the damage. Monitors tell you when to cut power. LangGraph's [persistence docs](https://docs.langchain.com/oss/python/langgraph/persistence) and [interrupts docs](https://docs.langchain.com/oss/python/langgraph/interrupts) matter here: checkpoints give you durable state, and interrupts give you a clean pause point for review. Loop detection still belongs to you, but once the runtime persists state at each step, hashing `(tool_name, input)` and killing the run after three identical calls with no new evidence stops being a vague "we should probably add that" ticket.

Autonomy also needs an exit strategy. I prefer two escalation paths: a soft pause for ambiguity, and a hard stop for irreversible actions, repeated failures, or cost acceleration. [AutoGen](https://microsoft.github.io/autogen/stable/user-guide/agentchat-user-guide/tutorial/termination.html) is useful to study here because it makes termination conditions a real API surface instead of a TODO buried in orchestration glue.

My threshold is simple: if a task cannot complete safely inside 50 actions and one approval boundary, the task is too big for an autonomous agent. Split the task. Do not raise the leash length and call it architecture.
