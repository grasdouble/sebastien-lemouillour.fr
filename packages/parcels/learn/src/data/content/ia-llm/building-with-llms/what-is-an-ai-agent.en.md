---
id: what-is-an-ai-agent
order: 17
difficulty: advanced
tags: [LLM, OpenAI, LangChain, agents, orchestration]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

Calling every chat feature an agent sounds harmless until ops asks for an SLA and nobody can explain what the system is allowed to do on step seven.

My definition is narrow on purpose. An AI agent is an LLM-driven loop that can observe state, choose among actions, use tools, and stop when a goal, budget, or guardrail is reached. If the path is fixed, it is a workflow, not an agent. The [LangChain agents overview](https://python.langchain.com/docs/concepts/agents/) and [OpenAI Agents](https://platform.openai.com/docs/guides/agents) describe the same core shape, and the [ReAct paper](https://arxiv.org/abs/2210.03629) is still the cleanest explanation of why these systems alternate between reasoning and acting.

This only makes sense when the environment pushes back. Search results change. APIs fail. The next best action depends on what just happened. If your flow is “classify, draft, return,” an agent buys you latency, variance, and incident surface area for zero upside.

The part teams underprice is operations. A real agent is not just a smarter prompt. It is a runtime with quotas, traces, tool permissions, stop conditions, and a human escalation path. If you cannot inspect every step after an incident, you do not have an agent, you have a liability with good copywriting.

This is the minimum contract I want before I call something an agent:

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

At scale, the architecture question is not “can the model decide the next step?” It usually can. The real question is whether the business accepts the blast radius when that decision is wrong. Tool misuse, runaway loops, and non-idempotent writes are not edge cases once traffic ramps up. They become your normal Tuesday.

I only recommend agents when the task is open-ended enough to benefit from dynamic action selection, and expensive enough that better autonomy beats the extra failure modes. If you cannot name the budget, stop condition, and audit log format before launch, call it a workflow and sleep better.
