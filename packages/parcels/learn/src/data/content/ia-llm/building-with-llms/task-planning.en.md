---
id: task-planning
order: 19
difficulty: advanced
tags: [agent, planning, orchestration, budget, ReAct]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

Your agent finished the task. Sort of. It took 47 tool calls, looped twice, and handed back a result that looked plausible until somebody checked it. That is usually blamed on the model. Most of the time, the model is not the real problem. The missing piece is planning.

The reason this breaks is simple: once an agent starts acting without decomposition, every next step is shaped by the last messy step. The [ReAct paper](https://arxiv.org/abs/2210.03629) works because reasoning and acting stay grounded in a small, explicit objective. If you throw a large goal at an agent and let it improvise, you get drifting scope, duplicated work, and token burn with no clean recovery path.

I would not let an agent touch tools until it emits a plan I can validate. That plan should be a graph, not a paragraph: subtasks, dependencies, completion criteria, retry limits, and a token budget per node. The [OpenAI Agents guide](https://platform.openai.com/docs/guides/agents) gives you the execution primitives, but the part most tutorials skip is budget ownership. The agent should not decide how expensive a task is allowed to become.

This is the sort of structure I want locked down before the first tool call:

```python
from pydantic import BaseModel
from typing import List, Optional

class Subtask(BaseModel):
    id: str
    goal: str
    depends_on: List[str]
    done_when: str
    tool_hint: Optional[str] = None
    max_tokens: int
    max_retries: int = 2

class ExecutionPlan(BaseModel):
    objective: str
    subtasks: List[Subtask]
    total_token_budget: int
```

If `sum(subtask.max_tokens)` exceeds `total_token_budget`, reject the plan. If a subtask has no `done_when`, reject the plan. If two subtasks depend on each other, reject the plan. Planning is not a vibe check. It is admission control.

After that, run the graph with state, not with a giant growing transcript. [LangGraph](https://langchain-ai.github.io/langgraph/) is useful here because it forces you to think in nodes, edges, and checkpoints instead of one endless loop. Persist the result of each node, compress the signal that matters, and pass only that forward. Raw tool output should not keep following the agent around like luggage.

Replanning is necessary, but only once in a while. If a node discovers a missing dependency or blows the estimated scope by 30%, pause and replan. If you are replanning every few steps, your top-level goal is underspecified and no clever prompt is going to save it.

My rule is blunt: if the task graph regularly exceeds 12 nodes, or staging shows more than 20% replans, stop making the agent smarter and make the task smaller.
