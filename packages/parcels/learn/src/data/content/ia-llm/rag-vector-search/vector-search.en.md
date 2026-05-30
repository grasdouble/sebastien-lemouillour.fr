---
id: vector-search
order: 5
difficulty: beginner
tags: [RAG, LLM, vectors, FAISS]
publishedAt: 2099-12-31
updatedAt: 2026-05-31
---

You have 40,000 pieces of documentation, a user asks one simple question, and keyword search keeps missing the passage that actually answers it. Reading every piece would be correct and painfully slow. Vector search is the first tool I would pick when the wording changes but the meaning stays the same.

A chunk is just a small piece of a document. The trick is to turn each chunk, and the user's question, into an embedding: a list of numbers that captures meaning well enough to compare texts by distance instead of exact words. The [OpenAI guide](https://platform.openai.com/docs/guides/embeddings) says embeddings are vectors whose distance reflects relatedness, and the [OpenSearch basics](https://docs.opensearch.org/latest/vector-search/getting-started/vector-search-basics/) page shows why that helps search find similar meaning, not only matching terms.

Once you have vectors, you still need a fast way to search them. That is what an index is: a data structure built to find the nearest vectors without checking every item one by one. The [FAISS docs](https://faiss.ai/) are useful here because they show the core loop plainly: build an index, add vectors, then search for the closest neighbors.

This is where beginners often get distracted, and I would keep the setup intentionally simple. If you are learning the retrieval step in a RAG system, meaning retrieval-augmented generation, you are learning the part that fetches source passages before the model answers. A local FAISS index usually teaches more than a full platform because you can inspect the results and notice when bad chunking or missing metadata, meaning labels such as title, source, or date, is the real problem.

Vector search also has limits, and beginners should hear that early. It finds passages that look semantically close, but it does not check whether a passage is true, current, or complete. If you later need a managed service around the same idea, the [Pinecone docs](https://docs.pinecone.io/guides/search/semantic-search) show the same pattern with dense-vector indexes, but the hard part still lives upstream in chunk quality, metadata, and evaluation.

My decision rule is simple: choose vector search when people ask the same thing in many different words, and stay with plain keyword search when the wording is stable and the corpus is small enough to inspect by hand. If "nearest" still feels mysterious, read the next guide on vectors and distance before you worry about databases.
