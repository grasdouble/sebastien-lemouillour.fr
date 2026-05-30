---
id: llm-workflows
order: 16
difficulty: intermediate
tags: [LLM, workflows, orchestration, reliability]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

The first version is always one prompt. Two weeks later, that prompt is doing classification, retrieval, drafting, formatting, fallback handling, and apologizing when any step goes wrong.

Most teams see that mess and jump straight to “we need an agent.” Usually, they need a workflow. A workflow is just explicit orchestration: named steps, bounded branching, and clear inputs and outputs. You can still use [structured outputs](https://platform.openai.com/docs/guides/structured-outputs) inside it, and you can still call tools with [function calling](https://platform.openai.com/docs/guides/function-calling). The difference is that the path is visible. According to the [LangChain agents overview](https://python.langchain.com/docs/concepts/agents/), agents are useful when the next action must be decided dynamically. If you already know the path, keep it deterministic.

That choice matters because workflows are cheaper to debug. When step three fails, you know where to look. When an agent loop fails, you often get a vague transcript and a long afternoon. For most product features, deterministic beats clever.

Before the code, here is the thing people skip: workflows are where you win on cost. Put the cheap model first for routing and extraction, then reserve the expensive model for the small percentage of requests that actually need deeper reasoning.

This is a workflow shape I would ship for support replies:

```ts
export async function runSupportReplyWorkflow(ticket: Ticket) {
  const routing = await classifyTicket(ticket.body); // cheap model, strict schema

  if (routing.needsHuman) {
    return { status: 'escalated', reason: routing.reason };
  }

  const docs = await retrieveDocs({
    product: routing.product,
    topic: routing.topic,
    maxResults: 4,
  });

  const draft = await draftReply({
    ticket,
    docs,
    tone: 'clear',
  });

  const verification = await verifyReply({
    draft,
    docs,
    requireCitations: true,
  });

  return verification.approved ? { status: 'ready', draft } : { status: 'review' };
}
```

A few patterns keep workflows sane. Persist every step result so retries start from the last good checkpoint instead of repeating the whole chain. Give each step its own timeout and error budget, because retrieval problems and model problems do not deserve the same fallback. Add explicit human-review branches for high-risk cases such as refunds, legal language, or medical content. And if a workflow calls external APIs, surface rate-limit failures as a normal state, not as a mysterious “AI error.”

My rule is blunt: if you can draw the path on one whiteboard, use a workflow. Reach for an agent only when the next step genuinely depends on observations you cannot predict up front.
