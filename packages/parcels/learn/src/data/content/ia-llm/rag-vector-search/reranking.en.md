---
id: reranking
order: 15
difficulty: intermediate
tags: [RAG, reranking, Cohere, CrossEncoder]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

A retriever can be “good enough” and still put the best chunk in sixth place. That sounds harmless until your prompt only keeps the top three results and the model answers with the wrong paragraph. Reranking is what I reach for when retrieval has recall, but not enough precision at the very top.

The key idea is simple: the first retriever is cheap and broad, the second model is slower and picky. A hosted option like [Cohere Rerank](https://docs.cohere.com/v2/docs/rerank-2) scores query-document pairs directly. A self-hosted [CrossEncoder](https://www.sbert.net/docs/package_reference/cross_encoder/) does the same thing if you want tighter cost control. Both are usually better than plain cosine similarity because they read the query and candidate together instead of comparing two independently compressed vectors.

What most tutorials skip is the budget. Rerankers are latency taxes. They earn their place when your baseline retriever already finds the right answer somewhere in the top 20, but not reliably in the top 3. If the right chunk is absent from the candidate set, reranking does nothing except make the slow path slower.

The contract I use is two-stage and deliberately narrow:

```python
from cohere import ClientV2

co = ClientV2(api_key=os.environ["COHERE_API_KEY"])


def retrieve_with_rerank(query: str, dense_hits: list[str]) -> list[str]:
    response = co.rerank(
        model="rerank-v3.5",
        query=query,
        documents=dense_hits[:20],
        top_n=5,
    )

    return [dense_hits[item.index] for item in response.results]
```

That `[:20]` matters. Handing 100 candidates to a reranker looks thorough, but it usually means your first-stage retrieval is sloppy. I would rather improve chunking, metadata filters, or hybrid retrieval before I pay to sort a giant pile of marginal candidates.

There is also a practical integration point. Libraries such as [LlamaIndex rerankers](https://docs.llamaindex.ai/en/stable/module_guides/querying/node_postprocessors/) make it easy to slot a reranker after retrieval and before synthesis, which is exactly where it belongs. Do not hide reranking inside generation prompts. If ranking quality matters, keep it observable as its own stage.

The thing I care about most is evaluation at small cutoffs. Precision@3 and MRR tell me more here than broad recall metrics. My rule is blunt: if reranking does not noticeably lift the top few positions on real queries, skip it. I start considering it when a retriever regularly puts the correct chunk in positions 5 to 20, and I stop defending it when the latency cost grows faster than the quality gain. Not every RAG stack needs a smarter ranking stage. Quite a few just need fewer bad chunks.
