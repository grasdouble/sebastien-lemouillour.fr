---
id: precision
order: 22
difficulty: advanced
tags: [RAG, evaluation, retrieval, TruLens]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

Your retriever stopped missing the answer, but now it sends ten barely related chunks for every good one. The model latches onto the wrong paragraph, the prompt gets bloated, and people call it hallucination when the real issue started earlier. That is a precision problem.

Once recall is healthy enough, precision becomes the metric that keeps the answer on rails. I care about precision because irrelevant context is not neutral. It competes for attention, inflates latency, increases cost, and gives the generator more opportunities to synthesize nonsense from near-matches.

The lazy move is increasing `k` and hoping the model figures it out. That works until it does not. High `k` is not a quality strategy, it is debt. If your top results are noisy, you need better filtering, better ranking, or both. [TruLens](https://www.trulens.org/) is useful here because context relevance and groundedness sit close to the actual failure mode instead of pretending all bad answers come from the model. [Ragas](https://docs.ragas.io/) is also practical when you want experiments that compare retrieval settings across the same dataset rather than anecdotal chats.

What many teams miss is that precision is local. A retriever can have acceptable overall precision and still be terrible for one corpus segment, one language, or one metadata slice. That is why I always break precision down by query family and content source. One noisy index can poison an otherwise solid system.

The [ARES paper](https://arxiv.org/abs/2311.09476) reinforces the same point from another angle: evaluate RAG components separately. If context relevance is weak, do not hide behind end-to-end answer scores. Retrieval quality deserves its own failure budget.

Before I touch prompting, I want the retrieval pipeline to look disciplined:

```yaml
pipeline:
  pre_filters:
    - access_control
    - language
    - document_type
  retrieval:
    - hybrid_search
  post_filters:
    - deduplicate_chunks
    - rerank_top_50_to_top_6
observability:
  log_rejected_chunks: true
  inspect_top_10_weekly: true
```

That last line matters. Sampling your top results every week is boring, but it catches bad metadata, duplicated chunks, and ranking regressions faster than any dashboard.

My rule is simple: after recall is acceptable, drive top-5 precision above 0.7 before increasing context size. If you cannot do that, your generator is cleaning up retriever mistakes it should never have seen.
