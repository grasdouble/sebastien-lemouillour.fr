---
id: multi-vector-rag
order: 17
difficulty: advanced
tags: [RAG, architecture, ColBERT, retrieval]
publishedAt: 2026-05-31
updatedAt: 2026-05-31
---

Single-vector retrieval looks dumb after your fifth near miss in production. The sentence exists, the evaluator highlights it, yet the chunk embedding gets washed out by neighboring text and never reaches the prompt. Multi-vector RAG is the fix for that exact failure. If your eval set does not show this pattern, skip it.

The architectural line matters. [ColBERT](https://github.com/stanford-futuredata/ColBERT) keeps a matrix of token-level embeddings per passage and scores with late interaction plus MaxSim, so narrow token matches survive instead of being averaged away. [ColBERTv2](https://aclanthology.org/2022.naacl-main.272/) cuts the space footprint by 6–10x, but that still leaves you with a heavier serving path. More vectors, more memory pressure, more expensive search, and harder incident review when recall drops.

That extra cost is why I separate two patterns that people lazily lump together. One is true late interaction. The other is application-level multi-representation indexing: several child vectors for one parent document, such as a summary, synthetic questions, and the original passage. [Qdrant's ColBERT guide](https://qdrant.tech/documentation/fastembed/fastembed-colbert/) makes the tradeoff blunt: late-interaction models buy precision, but they are often better used after an initial dense shortlist because speed and memory get ugly fast.

When I do use the cheaper pattern, I make the parent-child contract impossible to ignore:

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

That `parentId` is where teams usually lie to themselves. A great child hit is useless if generation sees only that fragment. Rehydrating the full parent solves context loss, but it also drags noise back into the prompt. I pick the expansion window from the SLA, not from aesthetic preference. Compliance search can afford a fatter parent window; support search usually cannot.

The index also needs observability that single-vector systems often skip. [Qdrant multivectors](https://qdrant.tech/documentation/concepts/vectors/#multivectors) support storing multiple vectors per point, and [Vespa](https://docs.vespa.ai/en/embedding.html) shows the same operational reality from the serving side: once you index arrays of texts into multi-vector tensors, memory usage grows and feed latency can rise. So watch average child vectors per parent, p95 retrieval latency, collapse rate by parent ID, and the share of child hits that vanish after parent aggregation. If you cannot explain those four numbers during an incident, you are not ready to run this pattern.

My rule is simple: adopt multi-vector RAG only when single-vector retrieval still misses narrow, high-value passages after you have fixed chunking, metadata filters, hybrid search, and reranking. If you are not failing on exact evidence and tight recall, this is wasted complexity. If your latency budget is already tight, it is probably the wrong call even when the quality lift looks real.
