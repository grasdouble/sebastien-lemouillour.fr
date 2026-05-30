---
id: agentic-workflows
order: 22
difficulty: advanced
tags: [agent, workflow, deterministic, approval, LangGraph]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

If your workflow misses its SLA every time the model has a bad day, you do not have a workflow. You have a polite loop with branding.

Pure agent loops are flexible, but they are terrible at predictability. Fully deterministic pipelines are reliable, but they crack the second an input stops matching the test matrix. The production answer is a hybrid: deterministic edges, agentic nodes. [LangGraph](https://langchain-ai.github.io/langgraph/) is useful because it forces that distinction. The graph decides sequence, branching, persistence, and retries. The model handles the few steps that actually need judgment.

That separation matters for operations. I want SLAs, approval gates, and error branches defined in code, not hidden in a prompt paragraph. The [OpenAI Agents guide](https://platform.openai.com/docs/guides/agents) is helpful on tool execution and confirmations, but the bigger lesson is architectural: the agent should occupy a bounded slot inside the workflow, not swallow the workflow whole. [Semantic Kernel](https://learn.microsoft.com/en-us/semantic-kernel/overview/) pushes the same idea from another angle, mixing deterministic orchestration with AI-driven steps.

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

Notice what is missing: no branching logic in the node, no hidden retries, no approval decision embedded in the prompt. The node produces a result. The graph decides what happens next.

Retry policy is another place teams get sloppy. A timeout deserves a retry. A schema validation failure usually deserves an error branch. Retrying malformed output three times is not resiliency. It is hope with extra billing.

Approval gates should also be hard pauses, not polite suggestions. Persist workflow state, notify the approver asynchronously, resume only on an explicit signal, and auto-reject on timeout. Anything softer becomes an audit headache the first time a workflow mutates the wrong system.

Use a blunt threshold: if your p95 end-to-end latency sits more than 20% above the workflow SLA, you have too many sequential LLM nodes. Remove or parallelize them before adding another agent.
