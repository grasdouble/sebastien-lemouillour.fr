---
id: llm-workflows
order: 16
difficulty: intermediate
tags: [agents, llm]
publishedAt: 2026-05-31
updatedAt: 2026-05-31
---

The first version is always one prompt. Then you ship it, one weird ticket lands, and suddenly that prompt is doing classification, retrieval, drafting, formatting, fallbacks, and damage control.

Most teams see that mess and jump straight to “we need an agent.” I usually would not. Anthropic draws the line cleanly in [effective agents](https://www.anthropic.com/engineering/building-effective-agents): workflows follow predefined code paths, agents decide the next step dynamically. If you already know the path, take the boring option and keep it deterministic. Boring is underrated when you are the one on call.

A workflow is just explicit orchestration: named steps, bounded branching, and clear inputs and outputs. You can still lock intermediate results with [structured outputs](https://developers.openai.com/api/docs/guides/structured-outputs), and you can still call real systems with [function calling](https://developers.openai.com/api/docs/guides/function-calling). The trick is that the path stays visible, which makes failures annoyingly obvious in the best possible way.

That choice matters because workflows are cheaper to debug. When step three fails, you know where to look. When an agent loop fails, you often get a vague transcript and a long afternoon. For most product features, deterministic beats clever.

The other thing people skip is cost. OpenAI’s [model selection guide](https://developers.openai.com/cookbook/examples/partners/model_selection_guide/model_selection_guide) is blunt about matching model size to the job, and I would absolutely route with a cheap model first. Let the small model classify, extract, or reject junk. Save the expensive model for the minority of requests that actually need deeper reasoning. Burning your best model on every request is a great way to finance someone else’s GPU.

This is the workflow shape I would ship for support replies:

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

A few patterns keep workflows sane. Persist every step result so retries restart from the last good checkpoint instead of replaying the whole chain. Give each step its own timeout and fallback, because retrieval problems and model problems are different failures. Add explicit human review for high-risk branches like refunds, legal language, or medical content. And if the workflow hits provider throttling, surface it as a normal state instead of a spooky “AI error”; the [rate limits guide](https://developers.openai.com/api/docs/guides/rate-limits) makes it clear those limits are part of normal API behavior, not some mystical outage.

My rule is blunt: if you can draw the path on one whiteboard, use a workflow. Reach for an agent only when the next step genuinely depends on observations you cannot predict up front.
