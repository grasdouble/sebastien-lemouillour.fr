---
id: precision
order: 22
difficulty: advanced
tags: [rag, evaluation]
publishedAt: 2026-12-31
updatedAt: 2026-05-31
---

Your retriever stopped missing the answer, but now it drags six irrelevant chunks into every prompt. The useful passage gets buried under stale notes, policy boilerplate, and duplicate snippets. The model answers from the wrong paragraph, and people blame generation for a retrieval failure.

Once recall is no longer catastrophic, precision decides whether your SLA survives production traffic. I care about precision because irrelevant context is not harmless. It burns latency, inflates cost, and gives the model extra opportunities to stitch together a plausible lie.

I would measure this the way [Ragas metric](https://docs.ragas.io/en/stable/concepts/metrics/available_metrics/context_precision/) defines it: can the retriever rank relevant chunks above irrelevant ones. If that score is weak, increasing `k` is not caution. It is noise injection.

The first correction is narrowing the candidate set before similarity search gets a vote. [Pinecone filters](https://docs.pinecone.io/guides/search/filter-by-metadata) make the point clearly: metadata filters let you constrain search to the right tenant, language, or document class at query time. If you skip that step, one dirty slice of the corpus poisons every downstream metric.

When the corpus mixes exact terms with fuzzy language, dense retrieval alone is too forgiving. [Azure hybrid](https://learn.microsoft.com/en-us/azure/search/hybrid-search-overview) combines full-text and vector queries in one request and merges them with reciprocal rank fusion. That is the default I would choose in production because keyword and semantic retrieval fail differently, and precision improves when both are allowed to compete.

Even then, the first pass is usually too loose for a generator that only sees a handful of chunks. [Semantic ranker](https://learn.microsoft.com/en-us/azure/search/semantic-search-overview) adds a secondary reranking stage over an initial result set. That is where I want expensive relevance modeling to happen: after cheap retrieval, before prompt assembly, on a bounded shortlist.

You also need observability that matches the failure mode. [TruLens triad](https://www.trulens.org/getting_started/core_concepts/rag_triad/) separates context relevance from groundedness, which is the only sane way to debug a system that “hallucinates” because retrieval fed it junk. If context relevance drops for one language or one document family, I want that alert before users do.

Before I touch prompt templates, I want the retrieval contract to look like this:

```yaml
retrieval_contract:
  pre_filters:
    - tenant_id
    - language
    - document_type
  first_pass:
    - hybrid_search_top_50
  second_pass:
    - semantic_rerank_top_8
  guards:
    - deduplicate_chunks
    - drop_low_score_matches
observability:
  slice_metrics:
    - by_query_family
    - by_language
    - by_source
  weekly_review:
    - inspect_top_10
    - inspect_rejected_chunks
```

My rule is blunt: do not expand context until top-5 precision is above 0.7 on your critical query families and stable by corpus slice. If filters, hybrid retrieval, and reranking still cannot clear that bar, the problem is your index or labels, not the generator.
