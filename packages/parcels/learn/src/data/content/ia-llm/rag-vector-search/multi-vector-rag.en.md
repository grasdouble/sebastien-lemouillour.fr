---
id: multi-vector-rag
order: 17
difficulty: advanced
tags: [RAG, architecture, ColBERT, retrieval]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

Single-vector retrieval starts looking naive once you debug enough near misses. A chunk contains the exact sentence you need, yet its one embedding is dominated by surrounding text and the passage never makes the shortlist. That is the failure mode multi-vector RAG tries to fix. If you have not seen it clearly in evaluations, do not reach for this pattern yet.

The important distinction is architectural, not cosmetic. Models like [ColBERT](https://arxiv.org/abs/2004.12832) keep multiple vectors per passage and score with late interaction, which preserves fine-grained token matches instead of crushing a whole chunk into one point in space. [ColBERTv2](https://arxiv.org/abs/2112.01488) improves the efficiency story, but it is still a fundamentally heavier system. You store more vectors, run more expensive search, and need better observability because failures get harder to explain.

There is another family that people also call multi-vector: indexing several representations of the same parent document, for example a summary, synthetic questions, and the original chunk. Tools like [LlamaIndex](https://docs.llamaindex.ai/en/stable/) make that strategy approachable. I still separate it mentally from late interaction because the operational tradeoff is different. Multi-representation indexing inflates write-time cost; ColBERT-style retrieval inflates read-time cost.

The storage contract I trust is explicit about the parent-child relationship:

```ts
type ChildVector = {
  childId: string;
  parentId: string;
  kind: 'passage' | 'summary' | 'question';
  embedding: number[];
  text: string;
};

async function retrieveParentDocs(query: string) {
  const childHits = await multiVectorIndex.search(query, { topK: 30 });
  const grouped = groupBy(childHits, (hit) => hit.parentId);

  return Object.values(grouped)
    .map((hits) => scoreParent(hits))
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);
}
```

That `parentId` is the part teams under-design. If retrieval surfaces a great child vector but your generator receives only that tiny fragment, you lose context. If you always expand back to the full parent, you gain context but risk bringing noise back in. The right answer depends on domain. In legal or compliance search, I usually return a larger parent window. In support search, I prefer smaller parent spans to keep prompts lean.

This only makes sense at scale when you have already exhausted simpler fixes: better chunking, better metadata filters, hybrid retrieval, then reranking. Production metrics matter more than model novelty here. Watch average vectors per document, p95 retrieval latency, candidate collapse rate by parent ID, and how often a relevant passage appears as a child hit but disappears after parent aggregation. Systems like [Vespa](https://docs.vespa.ai/en/nearest-neighbor-search.html) can handle this class of search, but the operational bill is real.

My threshold is blunt: adopt multi-vector RAG only when single-vector retrieval keeps missing narrow passages that humans can point to instantly, and reranking no longer closes the gap. If your problem is broad topical recall, this is the wrong hammer. If your problem is precision on small, high-value facts, then the extra index complexity starts to earn its keep.
