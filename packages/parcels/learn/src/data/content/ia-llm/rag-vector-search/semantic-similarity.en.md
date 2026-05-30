---
id: semantic-similarity
order: 4
difficulty: beginner
tags: [RAG, LLM, embeddings, similarity]
publishedAt: 2099-12-31
updatedAt: 2026-05-31
---

Your search box is working, yet users still miss obvious answers. Someone types "How do I stop paying?" and your content says "Cancel your subscription." Keyword search can shrug at that pair, even though any human would call it the same intent. Semantic similarity is the tool I reach for when wording changes but meaning does not.

The first fix is to turn text into an [embedding](https://platform.openai.com/docs/guides/embeddings). An embedding is a numeric representation of text, and OpenAI describes embeddings as vectors whose distance reflects relatedness. "Vector" sounds scarier than it is: think of it as a coordinate that places each sentence somewhere on a meaning map. If two sentences land near each other on that map, they probably talk about the same thing.

Once you have vectors, you need a way to compare them. [Cosine similarity](https://scikit-learn.org/stable/modules/generated/sklearn.metrics.pairwise.cosine_similarity.html) measures how closely two vectors point in the same direction. You do not need to love the formula. For a beginner, the useful mental model is simpler: a higher cosine score usually means closer meaning, even when the words differ.

A tiny example makes this less foggy before you touch any database:

```python
from openai import OpenAI
from sklearn.metrics.pairwise import cosine_similarity

client = OpenAI()

def embed(text: str):
    return client.embeddings.create(
        model="text-embedding-3-small",
        input=text,
    ).data[0].embedding

documents = [
    "Cancel your subscription",
    "Update your payment method",
]
query = "How do I stop paying?"

doc_vectors = [embed(text) for text in documents]
query_vector = embed(query)

scores = cosine_similarity([query_vector], doc_vectors)[0]
best_match = documents[scores.argmax()]
print(best_match)
```

I like this example because it shows the real job: score a query against several candidate texts, then keep the closest one. When you outgrow a toy list in memory, tools such as [pgvector](https://github.com/pgvector/pgvector) can store vectors and sort rows by distance, and systems such as [Pinecone semantic search](https://docs.pinecone.io/guides/search/semantic-search) can return the nearest records for a query. "Nearest neighbor" just means the stored text whose vector is closest to your query vector.

Here is the catch, and beginners deserve to hear it early: semantic similarity is helpful, not psychic. It can confuse texts that share vocabulary but not intent, and it can miss exact identifiers such as invoice numbers, product codes, or legal clauses. My rule is simple: if 2 or 3 queries out of a rough test set of 10 are paraphrases that keyword search misses, semantic similarity is already earning its keep. If exact wording is the contract, keep keyword search in the loop, then read the next guide on vector search to see how those neighbors are retrieved efficiently.
