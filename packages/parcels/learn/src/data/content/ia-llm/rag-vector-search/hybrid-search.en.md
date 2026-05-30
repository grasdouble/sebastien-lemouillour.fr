---
id: hybrid-search
order: 14
difficulty: intermediate
tags: [RAG, retrieval, BM25, Pinecone]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

Semantic search feels great until a user types `ERR-8492`, a product SKU, or the exact wording of a policy clause. Then your expensive embedding pipeline loses to old-school keyword search. Hybrid search exists for that moment, not because combining two retrieval systems looks sophisticated.

What most teams skip is diagnosis. If vector search fails because your chunking is bad or your metadata is missing, hybrid search will just hide the real problem under more infrastructure. I only add it when I can point to a clear class of misses: identifiers, rare acronyms, or wording where exact term frequency matters. That is exactly what [BM25](https://www.elastic.co/blog/practical-bm25-part-2-the-bm25-algorithm-and-its-variables) is good at, while dense vectors still win on paraphrases and fuzzy intent.

Providers such as [Pinecone hybrid search](https://docs.pinecone.io/guides/search/hybrid-search) or [Weaviate hybrid search](https://weaviate.io/developers/weaviate/search/hybrid) make the mechanics easier, but the real decision is how you fuse results. Weighted score merging looks appealing, yet it assumes the two score ranges are comparable. They usually are not. I prefer rank-based fusion first, often a simple [RRF](https://plg.uwaterloo.ca/~gvcormac/cormacksigir09-rrf.pdf), because rank positions stay stable even when the underlying scoring scales drift.

The retrieval step I trust in production is boring on purpose:

```ts
async function hybridSearch(query: string) {
  const [denseHits, sparseHits] = await Promise.all([
    vectorIndex.search(query, { topK: 20 }),
    bm25Index.search(query, { topK: 20 }),
  ]);

  const ranked = reciprocalRankFusion([
    { weight: 1.0, hits: denseHits },
    { weight: 0.8, hits: sparseHits },
  ]);

  return ranked.slice(0, 8);
}
```

That small `topK` is deliberate. If you retrieve 100 dense hits and 100 sparse hits, you are creating work for the reranker and noise for the generator. Start narrow, inspect failures, then widen. The trap is thinking hybrid means “retrieve everything and let the model sort it out.” That turns retrieval into an expensive dumping ground.

I would not ship hybrid search without evaluation buckets. Split your test queries into categories like exact identifiers, domain jargon, and natural-language questions. If BM25 only helps one bucket, that is fine, but know it. My rule is simple: start with vectors only, add hybrid when you can prove a repeatable exact-match gap, and keep the fusion logic easy to explain. If you need five knobs to make hybrid look good, your retrieval stack is telling you something.
