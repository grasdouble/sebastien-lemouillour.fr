---
id: agentic-rag
order: 19
difficulty: advanced
tags: [RAG, agents, orchestration, LlamaIndex]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

Your retriever works for obvious questions, then a user asks for a comparison across three manuals, one changelog, and a support note buried in another system. The answer falls apart, not because embeddings are bad, but because a single retrieve-then-generate pass is the wrong shape for the job.

That is where agentic RAG earns its keep. I use it when the system has to decide that one query is not enough, break work into smaller retrieval steps, choose the right tool, and verify whether the evidence is actually complete. That is the point of [LlamaIndex agents](https://docs.llamaindex.ai/en/stable/use_cases/agents/): not adding “intelligence” for marketing, but giving the pipeline a way to route, plan, and recover when the first attempt is weak.

I would not use agentic RAG for a documentation FAQ, a help center bot, or anything with a tight latency budget and mostly single-hop questions. In those cases, better chunking, metadata filters, hybrid retrieval, and reranking are cheaper and more predictable. Agentic RAG only makes sense when the question distribution is wide enough that hardcoded retrieval paths keep failing.

What most tutorials skip is cost control. Every extra planning step and tool call multiplies latency, token spend, and failure surface. If you cannot explain the maximum number of steps, the fallback behavior, and the per-step observability, you do not have an architecture, you have a demo. The tracing story matters as much as the planner. [TruLens](https://www.trulens.org/) is useful here because it treats retrieved context, tool calls, and execution flow as first-class evaluation targets instead of hiding everything behind a final answer score.

Before I ship one of these systems, I want a contract that looks more like this:

```yaml
planner:
  max_steps: 4
  stop_if_confidence_below: 0.55
retrieval_tools:
  - semantic_search
  - keyword_search
  - sql_lookup
guards:
  max_total_retrieved_chunks: 18
  require_citations: true
  fallback: 'answer_unknown'
observability:
  trace_query_plan: true
  trace_tool_arguments: true
  trace_document_ids: true
```

Then I put regression pressure on it in CI. [DeepEval](https://docs.confident-ai.com/) is a practical fit when you want agent or RAG evals to run like tests, because that forces you to catch step explosions, bad tool choices, and groundedness regressions before users do.

My rule is simple: if a one-shot retriever plus reranker can answer at least 85% of real questions inside your SLA, stay there. Bring in agentic RAG only when multi-step retrieval failures are frequent enough to justify the extra latency, tracing, and maintenance burden.
