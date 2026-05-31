---
id: agentic-workflows
order: 22
difficulty: advanced
tags: [agent, workflow, deterministic, approval, LangGraph]
publishedAt: 2026-05-31
updatedAt: 2026-05-31
---

If your workflow misses its SLA every time the model gets weird, you do not have a workflow. You have a demo that learned to smile.

Pure agent loops are nice right until someone asks for predictability. Fully deterministic pipelines are nice right until the input stops looking like the test set. My production pick is the boring hybrid: deterministic edges, agentic nodes. [LangGraph](https://docs.langchain.com/oss/python/langgraph/overview) earns its keep because it is built for orchestration, persistence, and human-in-the-loop, not just for another chat loop. Let the graph own sequence, branching, and saved state. Let the model handle the few steps that actually need judgment.

That split is where operations stop being hand-wavy. I want SLAs, approval gates, and failure paths in code, not buried in prompt poetry. The [OpenAI Agents SDK](https://openai.github.io/openai-agents-python/) makes the same bet with a managed agent loop, tool execution, guardrails, and resumable runs. [Semantic Kernel Process Framework](https://learn.microsoft.com/en-us/semantic-kernel/frameworks/process/process-framework) pushes the Microsoft version of the argument: event-driven steps, repeatable control, and auditability around AI-enabled processes.

This is the kind of node wrapper I want before an LLM touches the graph:

```python
import time
from functools import wraps

def with_sla(timeout_seconds: float):
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            start = time.monotonic()
            result = fn(*args, **kwargs)
            elapsed = time.monotonic() - start
            if elapsed > timeout_seconds:
                metrics.record("sla_breach", {"node": fn.__name__, "elapsed": elapsed})
            return result
        return wrapper
    return decorator

@with_sla(timeout_seconds=30.0)
def classify_document(state: WorkflowState) -> WorkflowState:
    label = llm.classify(state.document_text)
    return state.with_update(label=label)
```

What matters here is the contract. No branching logic in the node, no sneaky retries, no approval decision hidden in the prompt. The node returns a result. The workflow owns the control flow. That sounds rigid. Good. Rigid is how you keep a 3 a.m. incident from turning into interpretive dance.

Retry policy is where teams usually start lying to themselves. A timeout can deserve another shot. A schema validation failure usually deserves an error branch, not a second prayer. [LangGraph persistence](https://docs.langchain.com/oss/python/langgraph/persistence) helps because checkpoints let you resume from saved state instead of replaying everything and pretending that is resilience.

Approval gates should be real stops, not polite suggestions. [OpenAI HITL](https://openai.github.io/openai-agents-python/human_in_the_loop/) pauses execution until someone approves or rejects a sensitive tool call, then resumes from serialized run state. That is the right mental model. Persist state, notify asynchronously, resume on an explicit signal, and auto-reject on timeout if the action can hurt something expensive.

Use a blunt rule: if your p95 latency is more than 20% above the workflow SLA, you probably stacked too many sequential LLM nodes. Cut them or parallelize them before you add another agent. And if you do not need approvals, persistence, or failure recovery, skip the graph entirely. A plain function call is cheaper and less embarrassing.

## Resources

- [Tools](https://openai.github.io/openai-agents-python/tools/)
- [Interrupts](https://docs.langchain.com/oss/python/langgraph/interrupts)
