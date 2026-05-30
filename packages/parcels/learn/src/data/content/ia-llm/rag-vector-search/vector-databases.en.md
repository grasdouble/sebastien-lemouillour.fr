---
id: vector-databases
order: 7
difficulty: intermediate
tags: [RAG, VectorDB, Qdrant, pgvector]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

Your retrieval can look broken even when your embeddings are fine. The usual culprit is storage: slow filters, painful updates, no deletion strategy, or a database choice that forces every query through application code. I learned this the hard way by shoving vectors into whatever datastore was already there, then wondering why the LLM kept citing the right topic from the wrong product version.

I do not pick a vector database by benchmark screenshots. I pick it by operational friction. [Qdrant docs](https://qdrant.tech/documentation/) are usually my first stop when I want a purpose-built engine with solid filtering and predictable behavior. If the team already lives in Postgres, [pgvector](https://github.com/pgvector/pgvector) is often the better call because it keeps vectors, relational data, backups, and access control in one place. [Pinecone docs](https://docs.pinecone.io/) make sense when I want a managed service and do not want to spend my week tuning infrastructure. [Weaviate docs](https://weaviate.io/developers/weaviate) are attractive when the built-in search features and schema model match the product.

The trap most tutorials skip is this: retrieval quality is tied to boring features. Can you filter by tenant, language, or version without a hack? Can you upsert the same chunk idempotently? Can you delete one document without rebuilding the whole index? If the answer is fuzzy, the database is working against your RAG system.

When I stay in Postgres, this is the minimum shape I want from day one.

```sql
create extension if not exists vector;

create table knowledge_chunks (
  id uuid primary key,
  document_id text not null,
  chunk_index integer not null,
  title text not null,
  metadata jsonb not null default '{}'::jsonb,
  embedding vector(1536) not null -- match your embedding model output
);

create index knowledge_chunks_embedding_idx
on knowledge_chunks using hnsw (embedding vector_cosine_ops);

select id, document_id, title
from knowledge_chunks
where metadata @> '{"language":"en","version":"2026-05"}'
order by embedding <=> $1
limit 5;
```

That `vector(1536)` only works if it matches the embedding size you generate, so check your provider before you lock the schema. The [OpenAI embeddings](https://platform.openai.com/docs/guides/embeddings) guide is the kind of detail worth confirming once, before you index a million rows with the wrong dimension.

My rule is simple: if you already run Postgres and your filtering needs are moderate, start with pgvector. If retrieval is becoming its own product, multi-tenant, high-write, heavy-filtered, operationally separate, move to Qdrant or Pinecone. The moment you need three workarounds to express one search query, you picked the wrong home for your vectors.
