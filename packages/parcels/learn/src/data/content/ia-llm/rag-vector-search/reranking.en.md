---
id: reranking
order: 15
difficulty: intermediate
tags: [RAG, reranking, Cohere, CrossEncoder]
publishedAt: 2026-05-31
updatedAt: 2026-05-31
---

A retriever can look decent in offline tests and still put the only useful chunk in sixth place. Then your prompt keeps three passages, the model answers from the wrong one, and you spend hours tweaking prompts for a ranking problem. I add reranking exactly in that situation: the right chunk is already somewhere in the candidate list, just not high enough.

That second step works because a hosted API such as [Cohere API](https://docs.cohere.com/reference/rerank) scores the query against raw candidate texts, returns ordered results with relevance scores, and explicitly documents `429` backpressure responses. If I need to stay local, the classic [SBERT pipeline](https://www.sbert.net/examples/sentence_transformer/applications/retrieve_rerank/README.html) keeps a fast retriever first and a CrossEncoder only for the shortlist. That is the trade I would choose most of the time: cheap recall first, expensive precision second.

The budget problem appears immediately, so I keep the contract narrow. A reranker that sees every retrieved chunk is just a slow retriever in disguise, and managed services will happily remind you with latency or billing.

Before I wire it into a framework, I usually prove the shape with a tiny function like this:

```python
import os

from cohere import ClientV2

co = ClientV2(api_key=os.environ["COHERE_API_KEY"])


def rerank_hits(query: str, hits: list[dict]) -> list[dict]:
    if not hits:
        return []

    limited_hits = hits[:20]  # keep latency and billed input bounded
    response = co.rerank(
        model="rerank-v3.5",  # hosted reranker
        query=query,  # user question
        documents=[hit["text"] for hit in limited_hits],  # candidate chunks
        top_n=min(5, len(limited_hits)),  # only keep chunks you can inject
    )

    return [
        {
            **limited_hits[item.index],
            "rerank_score": item.relevance_score,
        }
        for item in response.results
    ]
```

That `[:20]` is the real decision. If twenty candidates are still noisy, I fix chunking, filters, or hybrid retrieval before I pay to sort a bigger pile. If a hosted endpoint is part of the path, I also treat [Cohere commitments](https://cohere.com/enterprise-data-commitments) as required reading, because candidate text leaves your app and the SaaS platform logs prompts and generations unless your deployment terms say otherwise.

If you want tighter data control or predictable throughput, a local CrossEncoder is the version I would ship next. The [CrossEncoder docs](https://www.sbert.net/examples/cross_encoder/applications/README.html) are blunt about the trade-off: better pairwise scoring, much worse scalability than a bi-encoder.

When I need that self-hosted path, I keep the batch size explicit and the shortlist capped so the model stays predictable under load:

```python
from sentence_transformers import CrossEncoder

model = CrossEncoder("cross-encoder/ms-marco-MiniLM-L6-v2")


def rerank_local(query: str, hits: list[dict]) -> list[dict]:
    limited_hits = hits[:50]  # widen locally, but still cap the candidate set
    pairs = [[query, hit["text"]] for hit in limited_hits]
    scores = model.predict(
        pairs,
        batch_size=16,  # tune for your CPU or GPU memory
        show_progress_bar=False,
    )

    ranked = sorted(
        ({**hit, "rerank_score": float(score)} for hit, score in zip(limited_hits, scores)),
        key=lambda item: item["rerank_score"],
        reverse=True,
    )
    return ranked[:5]
```

Once the scoring works, placement matters more than syntax. In [LlamaIndex postprocessors](https://docs.llamaindex.ai/en/stable/module_guides/querying/node_postprocessors/), reranking sits after retrieval and before synthesis, which is exactly where I want it because it stays measurable. Evaluation should stay just as narrow: [LlamaIndex eval](https://developers.llamaindex.ai/python/examples/evaluation/retrieval/retriever_eval/) tracks hit-rate, MRR, and Precision, and those top-of-list metrics tell you more than broad recall when the generator only sees a few chunks.

The last trap is assuming the shortlist can grow forever. It cannot. Managed rerankers set hard caps, and [Azure semantic ranker](https://learn.microsoft.com/en-us/azure/search/semantic-search-overview) only reranks the top 50 initial results. My rule is simple: add reranking when the correct chunk often lands between ranks 5 and 20, you can afford one more ranking hop, and P@3 or MRR moves enough to notice. If those numbers stay flat, fix retrieval instead.
