---
id: recall
order: 21
difficulty: advanced
tags: [RAG, evaluation, retrieval, Ragas]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

You shipped your RAG pipeline. Users say it sometimes misses obvious answers. They are right, and prompt tuning will not save you. If the relevant evidence never enters the candidate set, the model is guessing with better grammar.

That is the only reason recall matters: it tells you whether the right material was even retrievable. I care about recall before almost everything else because a low-recall system can look decent in demos and still fail brutally on real queries. Teams love polishing the generator because it is visible. Retrieval recall is where the real outages hide.

I measure recall at multiple cutoffs, usually top-5, top-10, and top-20, and I label it at the chunk level and the document level. Those are not interchangeable. A system can retrieve the correct document but miss the exact evidence span, which means your answer quality still collapses. [Ragas](https://docs.ragas.io/) is useful for turning this into a repeatable experiment loop instead of a spreadsheet exercise, and [DeepEval](https://docs.confident-ai.com/) is handy when you want retrieval checks living inside a test suite.

Most tutorials skip the dataset problem. You do not need thousands of examples to start, but you do need queries that represent how your users actually fail: vague wording, internal jargon, stale terminology, multi-hop requests, and “I know this exists somewhere” searches. If your eval set is made of neat benchmark-style questions, your recall metric is lying.

When labels are scarce, the [ARES paper](https://arxiv.org/abs/2311.09476) is worth studying because it shows a serious approach to automated RAG evaluation with lightweight judges plus a small human-labeled calibration set. I would not replace humans entirely, but I would absolutely use that pattern to scale faster than manual review alone.

This is the first retrieval dashboard I want before touching prompts:

```yaml
recall_targets:
  top_5: 0.72
  top_10: 0.84
  top_20: 0.92
breakdowns:
  - by_query_type
  - by_corpus_segment
  - by_language
  - by_recent_document_age
failure_buckets:
  - chunk_too_small
  - bad_metadata_filter
  - query_needs_expansion
  - sparse_keyword_match
```

Once you have this, the work becomes obvious. If recall is low, fix chunking, query rewriting, hybrid search, metadata hygiene, or index freshness. Do not compensate by shoving more junk into the prompt. That only hides the problem and hurts precision later.

My decision rule is harsh on purpose: if top-20 recall on your important queries is below 0.9, stay out of prompt engineering meetings. Retrieval is still your bottleneck.
