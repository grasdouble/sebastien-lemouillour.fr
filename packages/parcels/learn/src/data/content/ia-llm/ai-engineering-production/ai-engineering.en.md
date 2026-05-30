---
id: ai-engineering
order: 21
difficulty: advanced
tags: [LLM, architecture, evaluation, observability]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

The prototype works on Friday. On Monday, retrieval is stale, the prompt grew by 40 percent, latency doubled, and nobody knows whether the new answer quality came from the model change or the ranking tweak. That is the line between prompt hacking and AI engineering.

I treat AI engineering as interface design under uncertainty. The model is the least stable dependency in the stack, so product code should not be married to it. [Martin Fowler's architecture patterns](https://martinfowler.com/articles/building-with-genai.html) make this point well: separate orchestration from domain logic, and keep model-facing concerns isolated. Chip Huyen's book on ML systems design makes the same discipline feel obvious once you have been burned by experimentation leaking into production.

My bias is to make four boundaries explicit: retrieval, model gateway, evaluation, and business decision. Retrieval gets documents. The gateway chooses and calls models. Evaluation measures whether a change is acceptable. Business code decides what the user is allowed to do. If those concerns blend together, every experiment becomes a refactor.

You also need an abstraction that is honest about variation. Different providers expose different tool-calling quirks, context limits, and failure modes. A gateway such as [LiteLLM](https://docs.litellm.ai/) is useful because it centralizes routing, retries, and spend visibility. Self-hosted serving stacks such as [vLLM](https://docs.vllm.ai/) matter when throughput or data locality become architectural concerns, not because self-hosting is fashionable.

This is the kind of contract I want in the codebase before the team adds a second model.

```ts
type AiRequest = { task: 'support' | 'search'; input: string; tenantId: string };
type AiResult = { answer: string; citations: string[]; traceId: string };

export async function runAiTask(req: AiRequest): Promise<AiResult> {
  const docs = await retrieval.fetch(req);
  const completion = await modelGateway.generate({ req, docs });
  await evaluations.record({ req, completion });
  return decisionLayer.format(completion);
}
```

That looks boring, which is the point. Boring contracts let you swap prompts, ranking strategies, and model vendors without teaching every feature team how inference works.

The failure pattern I see most often is teams optimizing prompts before they stabilize interfaces. Prompts change weekly. Contracts should survive the quarter. If changing model provider requires touching product screens, queue handlers, and permission logic, you do not have AI engineering yet, you have prompt wiring with extra invoices.
