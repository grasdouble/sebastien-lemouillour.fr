---
id: vector-databases
order: 7
difficulty: intermediate
tags: [RAG, VectorDB, Qdrant, pgvector]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

Ton retrieval peut donner l'impression d'être cassé alors que les embeddings sont corrects. Le vrai problème, très souvent, c'est le stockage : filtres lents, mises à jour pénibles, suppressions bricolées, ou base choisie par habitude alors qu'elle complique chaque requête. Je me suis déjà piégé comme ça en gardant les vecteurs là où le reste des données vivait, puis en découvrant que le LLM remontait bien le bon sujet, mais sur la mauvaise version produit.

Je ne choisis pas une base vectorielle sur un joli benchmark. Je la choisis sur la friction opérationnelle. La [doc Qdrant](https://qdrant.tech/documentation/) reste mon premier réflexe quand je veux un moteur conçu pour ça, avec des filtres propres et un comportement lisible. Si l'équipe est déjà installée dans Postgres, [pgvector](https://github.com/pgvector/pgvector) est souvent le meilleur choix, parce qu'on garde vecteurs, données relationnelles, sauvegardes et permissions au même endroit. La [doc Pinecone](https://docs.pinecone.io/) devient intéressante quand je veux un service managé et zéro envie de passer mes soirées à régler l'infra. La [doc Weaviate](https://weaviate.io/developers/weaviate) me plaît quand son modèle de schéma et ses fonctions de recherche collent bien au produit.

Le point que la plupart des tutos zappent, c'est celui-ci : la qualité du retrieval dépend de détails très terre à terre. Est-ce que tu peux filtrer par tenant, langue ou version sans contourner la stack ? Est-ce que l'upsert du même chunk reste idempotent ? Est-ce que tu peux supprimer un document sans reconstruire tout l'index ? Si la réponse est floue, la base te ralentit déjà.

Quand je reste sur Postgres, voici la forme minimale que je veux dès le départ.

```sql
create extension if not exists vector;

create table knowledge_chunks (
  id uuid primary key,
  document_id text not null,
  chunk_index integer not null,
  title text not null,
  metadata jsonb not null default '{}'::jsonb,
  embedding vector(1536) not null -- à aligner avec la dimension du modèle
);

create index knowledge_chunks_embedding_idx
on knowledge_chunks using hnsw (embedding vector_cosine_ops);

select id, document_id, title
from knowledge_chunks
where metadata @> '{"language":"en","version":"2026-05"}'
order by embedding <=> $1
limit 5;
```

Ce `vector(1536)` n'est valable que si la dimension correspond bien à celle de ton modèle d'embedding, donc vérifie-le avant de figer le schéma. Le guide [OpenAI embeddings](https://platform.openai.com/docs/guides/embeddings) fait partie des pages à relire une fois, justement pour éviter d'indexer un million de lignes avec la mauvaise taille.

Ma règle est simple : si tu as déjà Postgres et des besoins de filtre raisonnables, commence avec pgvector. Si le retrieval devient un produit à part entière, multi-tenant, très filtré, avec beaucoup d'écritures et une exploitation séparée, passe sur Qdrant ou Pinecone. Dès qu'il faut trois contournements pour exprimer une seule requête de recherche, tes vecteurs ne vivent pas au bon endroit.
