---
id: embeddings
order: 11
difficulty: beginner
tags: [LLM, embeddings]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

You search for “how to cancel a plan,” but the document you need says “end your subscription.” Keyword search misses it, and that feels silly because the meaning is obviously close to a human. **Embeddings** exist for exactly this problem. An embedding is a list of numbers that represents meaning in a way a machine can compare. If I had to explain why embeddings matter in one line, I would say this: they help computers notice semantic closeness, not just word overlap.

## What an embedding really is

OpenAI’s [embeddings guide](https://platform.openai.com/docs/guides/embeddings) defines embeddings as vectors, which are ordered lists of numbers. Those numbers are not human-readable explanations. They are coordinates in a mathematical space where similar texts end up closer together.

That sounds abstract, so here is the mental picture I prefer. Imagine a huge map where sentences with related meanings are placed near one another. “Cheap hotel” and “budget place to stay” will not land on the exact same point, but a good embedding model tries to place them in the same neighborhood.

This idea did not appear from nowhere. Earlier work like [word2vec](https://arxiv.org/abs/1301.3781) showed how models could learn meaningful numeric representations from language. Modern systems extended that idea from single words to sentences, paragraphs, images, and more.

## How people actually use embeddings

The most common use is **semantic search**, which means retrieving text by meaning rather than by exact wording. Sentence Transformers, documented at [SBERT](https://www.sbert.net/), made this especially practical for sentence-level similarity.

A second common use is recommendation. If two products, articles, or support tickets land close together in embedding space, you can suggest one when a user interacts with the other.

A third use is clustering, which means grouping similar items automatically. That is helpful when you have thousands of comments or documents and want to discover themes.

To make this work at scale, teams often store embeddings in systems optimized for similarity search. [FAISS](https://faiss.ai/) is a widely used example. It helps find nearby vectors quickly without comparing every item one by one.

## What embeddings are good at, and bad at

I would reach for embeddings when the task is about similarity, retrieval, grouping, or recommendation. I would not reach for them when I need a final answer that must already be correct and explained. An embedding can tell you what looks related. It cannot, by itself, verify facts.

That distinction matters. Beginners sometimes expect embeddings to “understand” text in a magical way. They do not. They compress useful patterns about meaning into numbers, which is powerful, but still limited.

A simple rule works well: if wording varies but intent stays similar, embeddings are probably the right tool. Your next step is to take five phrases that mean nearly the same thing, plus two that do not, and compare how an embedding-based search system groups them. That tiny experiment makes the concept feel concrete very quickly.
