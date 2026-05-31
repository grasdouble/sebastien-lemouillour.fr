---
id: metadata
order: 9
difficulty: intermediate
tags: [rag, embeddings]
publishedAt: 2026-05-31
updatedAt: 2026-05-31
---

You ship the answer, the chunk looks perfect, and support still sends you the screenshot. The usual suspect is “bad embeddings.” Mine usually were not bad. The retriever was pulling the right topic from the wrong audience, the wrong locale, or a retired version.

That is why I treat metadata as the first gate, not a nice extra. [Pinecone filters](https://docs.pinecone.io/guides/search/filter-by-metadata) let you narrow search results with metadata, [Qdrant filtering](https://qdrant.tech/documentation/concepts/filtering/) is built around boolean conditions on payload, [Weaviate filters](https://weaviate.io/developers/weaviate/search/filters) combine vector search with structured constraints, and [pgvector](https://github.com/pgvector/pgvector) lets you keep normal SQL predicates next to vector similarity. Different engines, same lesson: similarity should rank candidates after your constraints have already cut the search space.

I keep metadata boring and enforceable: `audience`, `locale`, `docType`, `product`, `version`, `visibility`, `publishedAt`. I skip fields nobody will query consistently. Big blobs cost storage, slow update jobs, and push teams toward ad hoc JSON instead of stable filters. I also keep `topK` conservative because [OpenAI rate limits](https://platform.openai.com/docs/guides/rate-limits) make ingestion and retrieval budgets painfully real when you need to re-embed a large corpus after a schema change.

Before wiring retrieval, I write the filter contract I expect the store to honor.

```ts
type ChunkMetadata = {
  audience: 'public' | 'internal'; // access boundary
  locale: 'en' | 'fr'; // request locale
  docType: 'guide' | 'faq' | 'api'; // retrieval slice
  product: 'search' | 'billing' | 'security'; // domain filter
  version: string; // example: 2026-05
  publishedAt: string; // ISO date for freshness checks
};

const results = await vectorStore.search({
  query: userQuestion,
  topK: 5, // enough recall without flooding the prompt
  filter: {
    audience: 'public',
    locale: userLocale,
    product: 'billing',
    publishedAt: { gte: '2026-01-01' }, // exclude stale docs
  },
});
```

That filter usually does more for answer quality than another round of prompt tuning. It also does security work: keep internal or retired content out before it ever reaches the model. I still assume retrieved text can carry hostile instructions, because [OWASP prompt injection](https://genai.owasp.org/llmrisk/llm01-prompt-injection/) is explicit that RAG improves relevance, not immunity.

My cutoff is simple: if a metadata field cannot justify its storage cost with a real filter, ranking rule, or retention job this sprint, I do not index it yet.
