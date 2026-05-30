---
id: vectors-and-distance
order: 6
difficulty: beginner
tags: [RAG, LLM, vectors, cosine]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

Your search system says one document is "closer" to the question than another, and that word can feel suspiciously hand-wavy. Closer according to what? If you do not answer that, vector search stays magical in the bad way.

A **vector** is just an ordered list of numbers. In retrieval, an embedding model maps each text to one of those lists, as described in the [embeddings guide](https://platform.openai.com/docs/guides/embeddings). You can imagine each vector as a point in a very high-dimensional space. High-dimensional only means there are many coordinates, far more than the two or three we can draw on paper.

Once texts become points, you need a rule for deciding which points are near each other. That rule is your **distance metric** or **similarity metric**. The most common one for beginner RAG projects is [cosine similarity](https://en.wikipedia.org/wiki/Cosine_similarity). It compares the angle between vectors more than their raw length. In plain English, it asks, "are these vectors pointing in a similar direction?" For semantic retrieval, that often matches the intuition we want.

Other metrics exist. Some systems use dot product. Others use Euclidean distance, which is the ordinary straight-line distance many people know from school. Tools such as [Qdrant](https://qdrant.tech/documentation/) and [FAISS](https://faiss.ai/) support different choices because different embedding models and use cases behave better with different metrics.

The thing most tutorials skip is that the absolute numbers rarely matter to a human. A similarity score of 0.82 is not "good" in the abstract. It is only useful compared with the other candidates for the same query, or compared with scores you have observed during evaluation. Beginners often stare at the score itself when they should be looking at the ranking and the retrieved documents.

My default advice is boring on purpose: for text retrieval, start with cosine similarity unless the embedding model documentation tells you otherwise. That is not because cosine is universally superior. It is because matching the metric to the model recommendation saves you from subtle, annoying mistakes early on. The second thing I would do is inspect real results manually before inventing thresholds.

If this still feels abstract, that is normal. It became concrete for me only when I compared a dozen real queries and watched how the ranking changed under different metrics. That is a good next experiment for you too. After that, the next guide I would read is the one on vector databases, because metrics become much easier to reason about once you see where they live in a real system.
