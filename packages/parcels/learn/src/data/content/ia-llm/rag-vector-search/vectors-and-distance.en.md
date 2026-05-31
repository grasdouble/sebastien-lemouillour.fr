---
id: vectors-and-distance
order: 6
difficulty: beginner
tags: [rag, embeddings, llm]
publishedAt: 2026-05-31
updatedAt: 2026-05-31
---

You ask a question, the search returns a score like 0.82, and you still cannot tell whether to trust it. That confusion is normal. "Closer" sounds precise, but until you know what the system is measuring, vector search feels like a black box.

The first useful idea is simple: an **embedding model**, meaning a model that turns text into numbers, produces a **vector**, which is just an ordered list of numbers, as explained in the [OpenAI docs](https://platform.openai.com/docs/guides/embeddings). You can picture that vector as a point in a huge space. Huge only means many coordinates, not magic.

Once every text becomes a point, a new problem appears: what does "near" mean? That is the job of a **similarity metric**. The [Google ML docs](https://developers.google.com/machine-learning/clustering/dnn-clustering/supervised-similarity) are a good reference here: cosine similarity mostly compares direction, dot product reflects direction and vector length, and Euclidean distance measures the geometric distance between points. For beginner semantic search, I would start by thinking of cosine as a simple question: are these two arrows pointing roughly the same way?

That choice is not just theory. Real vector search systems expose it as a setting. The [Elastic docs](https://www.elastic.co/docs/reference/elasticsearch/mapping-reference/dense-vector) define k-nearest neighbor search as finding the nearest vectors according to a similarity metric, which is why two systems can rank the same documents differently even when they store the same embeddings.

One detail saves a lot of beginner confusion. The [FAISS docs](https://github.com/facebookresearch/faiss/wiki/MetricType-and-distances) explain that cosine similarity can be implemented by normalizing vectors and then using inner product. So cosine is not a magical third thing. It is often a particular way of preparing vectors before comparison.

My beginner rule is deliberately boring, because boring rules are useful when the topic still feels fuzzy: start with the metric recommended by your embedding model or vector store docs, and if nothing is specified, start with cosine for text search. I would not invent a fixed score threshold on day one, because a number like 0.82 means little by itself. First inspect the ranking on at least twenty real queries, and remember the main limitation: a high score only means "close under this metric," not "definitely correct."

If you want the next piece to click, read the guide on vector databases right after this one. Seeing where the metric is configured makes the whole topic much less abstract.
