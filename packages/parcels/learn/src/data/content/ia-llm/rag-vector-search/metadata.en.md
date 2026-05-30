---
id: metadata
order: 9
difficulty: intermediate
tags: [RAG, metadata, filtering, VectorDB]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

The chunk looks relevant, the answer is still wrong, and everybody blames embeddings. Most of the time the missing piece is metadata. Similarity can tell you “this paragraph talks about billing.” Metadata tells you “this paragraph is for the EU product, version 3, in French, and visible only to team support.”

I use metadata as a control surface, not a junk drawer. If a field helps filtering, ranking, auditing, or cleanup, keep it. If it is only there because “maybe it will be useful later,” throw it out. Bloated metadata makes indexing heavier and queries sloppier.

Official docs all support this idea, just with different vocabulary. [Pinecone docs](https://docs.pinecone.io/) expose metadata filters, [Qdrant docs](https://qdrant.tech/documentation/) call it payload filtering, [Weaviate docs](https://weaviate.io/developers/weaviate) let you combine vector search with structured filters, and [pgvector](https://github.com/pgvector/pgvector) works with normal SQL predicates alongside vector similarity. The mechanism changes, the habit should not.

The trap is picking metadata that mirrors your raw source instead of your retrieval decisions. I want compact, stable, filterable fields: `tenantId`, `language`, `docType`, `product`, `version`, `publishedAt`, `visibility`. I do not want full author bios, random labels, or a blob of JSON nobody can query consistently.

Before you wire retrieval, define the contract you expect the store to support.

```ts
type ChunkMetadata = {
  tenantId: string;
  language: 'en' | 'fr';
  docType: 'guide' | 'faq' | 'api';
  product: 'search' | 'billing' | 'security';
  version: string; // example: 2026-05
  visibility: 'public' | 'internal';
};

const results = await vectorStore.search({
  query: userQuestion,
  topK: 5,
  filter: {
    tenantId: currentTenant.id,
    language: userLocale,
    visibility: 'public',
    product: 'billing',
  },
});
```

That filter is where a lot of hallucination prevention actually happens. If your retriever is allowed to search across retired versions, internal notes, and the wrong locale, it will eventually find something semantically close and operationally useless.

My rule: every metadata field must earn its place by answering one question, can this improve retrieval or lifecycle management? If not, keep it out. If yes, make it stable, typed, and enforced at indexing time, because retrofitting metadata after you have millions of chunks is miserable, expensive, and usually blocked by missing source history.
