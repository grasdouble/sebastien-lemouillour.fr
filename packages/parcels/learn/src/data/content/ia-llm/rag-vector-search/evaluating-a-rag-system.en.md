---
id: evaluating-a-rag-system
order: 24
difficulty: advanced
tags: [rag, evaluation, observability]
publishedAt: 2026-12-31
updatedAt: 2026-05-31
---

You do not notice a weak RAG system during the demo. You notice it after release, when one indexing tweak drops answer quality, another prompt change adds hallucinations, and nobody can prove which layer failed first. That is why I would never accept a single release score for RAG.

Start by splitting the problem the way [Azure Foundry](https://learn.microsoft.com/en-us/azure/foundry/concepts/evaluation-evaluators/rag-evaluators) and [Bedrock metrics](https://docs.aws.amazon.com/bedrock/latest/userguide/knowledge-base-evaluation-metrics.html) do: retrieval quality, grounded generation, and end-to-end usefulness are different failure surfaces. If you mix them, the team will optimize the cheapest metric and miss the one breaking the SLA.

For offline regression work, I would pick [Ragas faithfulness](https://docs.ragas.io/en/latest/concepts/metrics/available_metrics/faithfulness/) first because it gives you a direct check on whether the answer is actually supported by retrieved context. That solves the next real problem: most teams test only easy queries. I would build the eval set from failure modes instead, including stale content, permission gaps, near-duplicate chunks, internal jargon, multi-hop questions, and prompts where the correct answer is an explicit refusal.

Once the dataset is hostile enough, screenshots stop being useful. [TruLens tracing](https://www.trulens.org/component_guides/instrumentation/) is the right move when you need to inspect retrieved context, intermediate steps, and evaluation targets inside the same execution flow. Pair that with [OTel GenAI](https://opentelemetry.io/docs/specs/semconv/gen-ai/) so latency, token usage, and failure spans are captured with standard conventions instead of whatever your current vendor happens to expose.

When I need the release contract on one screen, this is the scorecard I actually want to see:

| Metric                | What it measures                                                    | Target                                                  | Tool                                            |
| --------------------- | ------------------------------------------------------------------- | ------------------------------------------------------- | ----------------------------------------------- |
| `recall@k`            | Whether the right evidence shows up somewhere in the top-k          | High enough that gold chunks usually appear by `k=10`   | Labeled retrieval evals, Ragas, vendor KB evals |
| `precision@k`         | How much of the top-k list is actually useful                       | Keep the top 5 mostly relevant so context is not wasted | Ragas, labeled retrieval set                    |
| `faithfulness`        | Whether the answer is supported by retrieved context                | Never drop below the agreed release floor               | Ragas, DeepEval, rubric-based judge             |
| `answer relevance`    | Whether the answer addresses the user question directly             | Stable or improving on the hard eval set                | Ragas, LLM judge                                |
| `context utilization` | Whether the model uses the supplied evidence instead of freelancing | Investigate any answer that ignores retrieved context   | TruLens traces, manual trace review             |
| `latency`             | End-to-end speed under realistic load                               | Keep p95 inside the SLA                                 | OTel GenAI, tracing backend                     |

Before you argue about release readiness, write the contract down:

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

If you want that contract to survive production pressure, run the same evals in CI. I would use [DeepEval CI](https://www.confident-ai.com/docs/llm-evaluation/unit-testing-cicd) when the team wants regression checks to block merges instead of living in a dashboard nobody opens. Ownership still needs to stay explicit: retrieval metrics belong to retrieval owners, groundedness belongs to whoever changed prompts or policies, and latency plus cost belong to platform.

My rule is simple: block the release if faithfulness drops below the agreed floor, if p95 latency breaks the SLA, or if trace coverage falls low enough that failures stop being explainable. If a change cannot name the metric it should improve, the threshold it must preserve, and the rollback trigger, it is not ready.
