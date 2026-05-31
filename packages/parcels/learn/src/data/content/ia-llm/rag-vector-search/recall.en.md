---
id: recall
order: 21
difficulty: advanced
tags: [rag, evaluation]
publishedAt: 2026-05-31
updatedAt: 2026-05-31
---

Your retriever keeps missing the paragraph users needed, so the model answers from second-best evidence and sounds confident doing it. That is not a prompting issue. It is a recall outage.

I optimize recall first because a generator cannot ground itself on chunks it never saw. [Ragas](https://docs.ragas.io/en/stable/concepts/metrics/available_metrics/context_recall/) defines context recall around exactly that question: how much relevant information was actually retrieved compared with a reference. [DeepEval](https://docs.confident-ai.com/docs/metrics-contextual-recall) is the practical companion when you want the same retrieval check enforced inside tests instead of argued about in a demo.

Then measure recall where the failure really happens. I keep chunk-level recall and document-level recall separate. Recovering the right document while missing the decisive span still breaks the answer, the citation, and the SLA.

Most teams poison recall upstream with bad segmentation. [Azure chunking](https://learn.microsoft.com/en-us/azure/search/vector-search-how-to-chunk-documents) recommends fixed-size chunks that stay semantically meaningful, plus overlap, and it also points to document structure when fixed windows are too blunt. If your chunks smear five topics together or split one procedure across three fragments, your retriever is being asked to do impossible work.

When segmentation is sane and recall is still weak, I do not increase prompt size first. [Hybrid search](https://learn.microsoft.com/en-us/azure/search/hybrid-search-overview) exists for a reason: vector search catches conceptual matches, keyword search catches exact codes, dates, names, and jargon. For production RAG, dense-only retrieval is usually a vanity demo choice.

After that, tune the ANN layer with your latency budget in view. [Elasticsearch kNN](https://www.elastic.co/guide/en/elasticsearch/reference/current/knn-search.html) is explicit that approximate search buys scale and low latency while exact search buys accuracy, and `num_candidates` lets you recover part of that tradeoff. [OpenSearch HNSW](https://docs.opensearch.org/latest/vector-search/settings/) says the same thing more bluntly: higher `ef_search` improves accuracy and slows queries. If you never sweep those parameters against your SLA, you do not know your recall. You are guessing.

This is the dashboard I want before anyone touches prompts:

```yaml
retrieval_slo:
  recall_at_5: 0.75
  recall_at_10: 0.88
  recall_at_20: 0.93
breakdowns:
  - by_query_family
  - by_language
  - by_metadata_filter
  - by_document_age
observability:
  log_missed_reference_ids: true
  compare_chunk_vs_document_recall: true
  track_ann_params:
    - num_candidates
    - ef_search
release_rule:
  fail_if_top_10_recall_drops: true
```

My rule is simple: if top-10 recall on business-critical queries is below 0.85, stop tuning prompts. If top-20 recall is still below 0.9, retrieval remains the bottleneck and every generation win is cosmetic.
