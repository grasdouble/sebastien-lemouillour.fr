---
id: vector-databases
order: 7
difficulty: intermediate
tags: [rag, embeddings]
publishedAt: 2026-12-31
updatedAt: 2026-05-31
---

Your RAG demo looks smart until it answers with the right paragraph from the wrong customer, the wrong language, or last month's version. When that happens, I do not blame embeddings first. I blame storage, because retrieval breaks the moment filters, deletes, and updates feel bolted on.

I pick a vector database by operational friction, not by benchmark screenshots. If a team already runs [pgvector](https://github.com/pgvector/pgvector), I would start there because vectors stay next to the relational data, backups, and permissions you already operate. I move to [Qdrant filters](https://qdrant.tech/documentation/concepts/filtering/) when filtered retrieval is the product and I want a store built around payload filtering instead of retrofitting it. I only reach for [Pinecone serverless](https://docs.pinecone.io/guides/index-data/indexing-overview) when the team genuinely wants a managed surface and accepts the extra bill that comes with it. [Weaviate filters](https://weaviate.io/developers/weaviate/search/filters) are the option I look at when the search API shape already matches the product and I want less glue code.

The part people skip is the unglamorous part. Can you upsert the same chunk without creating duplicates? Can you filter by tenant, language, and version in one query? Can you delete a document cleanly when a policy page changes? If those answers are vague, the database is already taxing your retrieval quality.

| DB       | Index Types                                           | Filtering                                                 | Deployment                                        | Best For                                                                              |
| -------- | ----------------------------------------------------- | --------------------------------------------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Pinecone | Managed ANN indexes behind a hosted service           | Solid metadata filters, but inside a managed box          | Fully managed cloud                               | Teams that want the least ops work and accept a vendor bill for it                    |
| Weaviate | HNSW plus hybrid search features                      | Strong structured filters and expressive query API        | Managed or self-hosted                            | Products that want semantic search plus a richer API surface out of the box           |
| Qdrant   | HNSW with payload-aware search                        | Excellent payload filtering, very retrieval-centric       | Managed or self-hosted                            | Multi-tenant or filter-heavy retrieval where filtering quality is part of the product |
| pgvector | IVFFlat or HNSW inside Postgres                       | Whatever SQL and JSONB can express, which is often enough | Self-hosted Postgres or existing managed Postgres | Teams that already trust Postgres and want vectors next to transactional data         |
| Chroma   | Lightweight local vector indexes                      | Basic metadata filters                                    | Local-first and developer-friendly                | Prototypes, notebooks, and small systems where speed of setup matters most            |
| Milvus   | IVF, HNSW, DiskANN, and other large-scale ANN options | Good metadata filtering, tuned for bigger search systems  | Self-hosted or managed via Zilliz Cloud           | High-scale workloads that justify a dedicated vector stack                            |

Before debating vendors for weeks, this is the SQL shape I would ship first on Postgres.

```sql
create extension if not exists vector;

create table knowledge_chunks (
  id uuid primary key,
  tenant_id text not null, -- security boundary for multi-tenant retrieval
  document_id text not null,
  chunk_index integer not null,
  content text not null,
  metadata jsonb not null default '{}'::jsonb,
  embedding vector(1536) not null -- replace 1536 with your model dimension
);

create index knowledge_chunks_embedding_idx
on knowledge_chunks using hnsw (embedding vector_cosine_ops);

create index knowledge_chunks_metadata_idx
on knowledge_chunks using gin (metadata jsonb_path_ops);

select id, document_id, chunk_index, content
from knowledge_chunks
where tenant_id = $2 -- current tenant or workspace
  and metadata @> '{"language":"en","version":"2026-05"}'
order by embedding <=> $1 -- $1 is the query embedding
limit 5; -- top-k before reranking or prompt assembly
```

That shape works because [OpenAI embeddings](https://platform.openai.com/docs/guides/embeddings) make the model dimension explicit, and [JSONB indexing](https://www.postgresql.org/docs/current/datatype-json.html#JSON-INDEXING) keeps metadata filters practical instead of turning them into table scans. I treat `tenant_id` as a security boundary, not convenience metadata. If one query path can skip it, you built a leak path.

The cost trap usually sits outside the database. Re-embedding a large corpus is an API job, so check your provider's [rate limits](https://platform.openai.com/docs/guides/rate-limits) before you launch a backfill that stalls halfway through.

My rule is simple: start with pgvector if you already trust Postgres and your retrieval can stay healthy with one vector index plus one metadata index. Move to a dedicated vector database when filtered search, write volume, or operational isolation turns into weekly pain. If you spend more time nursing the storage layer than improving relevance, that is the threshold where a specialized system starts earning its cost.
