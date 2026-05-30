---
id: evaluating-a-rag-system
order: 24
difficulty: advanced
tags: [RAG, evaluation, observability, Ragas, TruLens]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

A lot of RAG teams still ship changes on vibes. Someone tweaks chunking, swaps the reranker, updates the prompt, and asks a few pet questions in staging. Then users report regressions a week later, and nobody can tell whether the system got less accurate, less faithful, slower, or just more expensive.

My position is simple: one score is fake comfort. A RAG system needs separate evaluation for retrieval quality, answer quality, and operational behavior. If you collapse everything into one number, the team will optimize the easiest layer and miss the one causing the outage.

I like [Ragas](https://docs.ragas.io/) because it pushes you toward experiments instead of ad hoc screenshots. I like [TruLens](https://www.trulens.org/) because traces make failures inspectable at the step level: retrieved chunks, tool calls, grounding, and final output. And I like [DeepEval](https://docs.confident-ai.com/) when I want the eval harness to live in CI next to code, not in a dashboard nobody checks before merging.

The piece many tutorials skip is dataset design. Random queries are useless once the system is decent. I want eval sets built from failure modes: vague internal jargon, stale documents, missing permissions, multi-hop questions, near-duplicate sources, and questions where the correct behavior is to say “I don’t know.” If your eval set does not contain ugly cases, it is not protecting production.

When annotation cost becomes the bottleneck, read [ARES](https://arxiv.org/abs/2311.09476). The important lesson is not that automated judges replace humans, but that you can combine synthetic data, lightweight judges, and a small calibrated human set to scale evaluation without losing your mind.

The contract I expect from a serious RAG team looks like this:

```yaml
eval_layers:
  retrieval:
    - recall_at_10
    - precision_at_5
    - index_freshness
  generation:
    - faithfulness
    - answer_relevance
    - refusal_quality
  operations:
    - p95_latency
    - cost_per_answer
    - trace_coverage
release_rule:
  block_if_any_critical_metric_regresses: true
```

I would also assign owners. Retrieval metrics belong to whoever changes indexing and ranking. Faithfulness belongs to whoever changes prompts and generation policy. Cost and latency belong to the platform side. Shared ownership is how you end up with no ownership.

My rule is hard to argue with: if a proposed change cannot name the metric it should improve, the threshold it must stay above, and the rollback trigger if it fails, it is not ready for production.
