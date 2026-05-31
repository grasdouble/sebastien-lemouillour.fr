---
id: what-is-an-ai-agent
order: 17
difficulty: advanced
tags: [agents, llm]
publishedAt: 2026-12-31
updatedAt: 2026-05-31
---

Calling every chat feature an agent sounds harmless until ops asks for an SLA and nobody can explain what the system is allowed to do on step seven.

My definition is narrow on purpose. An AI agent is a model-driven loop that observes state, picks an action, calls tools, and keeps going until a stopping rule fires. [Anthropic's guide](https://www.anthropic.com/engineering/building-effective-agents) draws the architectural line I use in practice: fixed code paths are workflows, dynamic tool choice is agent behavior. [OpenAI's runtime docs](https://platform.openai.com/docs/guides/agents/running-agents) describe the same loop explicitly: model call, inspect output, execute tools or handoffs, stop only at a real stopping point.

This only makes sense when the environment pushes back. Search results change. APIs fail. The next best action depends on what just happened. If your flow is “classify, draft, return,” an agent buys you latency, variance, and incident surface area for zero upside.

The part teams underprice is operations. A real agent is not just a smarter prompt. It is a runtime with quotas, traces, tool permissions, stop conditions, and a human escalation path. [OpenAI's observability guide](https://platform.openai.com/docs/guides/agents/integrations-observability) treats tracing as a first-class feature, and the [guardrails guide](https://platform.openai.com/docs/guides/agents/guardrails-approvals) is very clear that risky tool calls should pause for validation or human approval. If you cannot inspect every step after an incident, you do not have an agent, you have a liability with good copywriting.

If that still sounds fuzzy, this is the minimum contract I want before I call something an agent:

```ts
const supportAgent = {
  goal: 'Resolve tier-1 support tickets without unsafe side effects',
  maxIterations: 6,
  maxWallTimeMs: 12_000,
  allowedTools: ['search_docs', 'lookup_order', 'draft_email'],
  requireApprovalFor: ['send_email', 'issue_refund'],
  onStep(step) {
    traceStep(step); // store model output, tool args, latency, outcome
  },
  onBudgetExceeded(context) {
    handOffToHuman(context);
  },
};
```

At scale, the architecture question is not “can the model decide the next step?” It usually can. The real question is whether the business accepts the blast radius when that decision is wrong. Tool misuse, runaway loops, and non-idempotent writes stop being edge cases once traffic ramps up. They become your normal Tuesday.

My rule is simple: if the job fits in fewer than three deterministic steps, or if the business cannot tolerate a paused approval flow, do not ship an agent. Ship a workflow and keep your pager quiet.
