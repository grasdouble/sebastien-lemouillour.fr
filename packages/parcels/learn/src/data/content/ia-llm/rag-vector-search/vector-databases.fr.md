---
id: vector-databases
order: 7
difficulty: intermediate
tags: [rag, embeddings]
publishedAt: 2026-05-31
updatedAt: 2026-05-31
---

Votre démo RAG a l'air brillante jusqu'au jour où elle répond avec le bon paragraphe, mais pour le mauvais client, la mauvaise langue ou la mauvaise version produit. Quand ça arrive, je n'accuse pas d'abord les embeddings. J'accuse le stockage, parce que la retrieval casse dès que les filtres, les suppressions et les mises à jour ressemblent à des rustines.

Je choisis une base vectorielle sur la friction opérationnelle, pas sur des captures de benchmark. Si une équipe tourne déjà sur [pgvector](https://github.com/pgvector/pgvector), je commencerais là, parce que les vecteurs restent à côté des données relationnelles, des sauvegardes et des permissions déjà en place. Je passe sur [filtres Qdrant](https://qdrant.tech/documentation/concepts/filtering/) quand la retrieval filtrée devient le vrai produit et que je veux un store pensé autour du filtrage de payload, pas bricolé après coup. Je ne prends [Pinecone serverless](https://docs.pinecone.io/guides/index-data/indexing-overview) que si l'équipe veut vraiment une surface managée et accepte la facture supplémentaire qui va avec. [filtres Weaviate](https://weaviate.io/developers/weaviate/search/filters) devient intéressant quand la forme de son API de recherche colle déjà au produit et m'évite du code d'intégration.

La partie que presque tout le monde saute est la moins glamour. Est-ce que tu peux upsert le même chunk sans créer de doublons ? Est-ce que tu peux filtrer par tenant, langue et version dans une seule requête ? Est-ce que tu peux supprimer proprement un document quand une page de politique change ? Si ces réponses restent floues, la base dégrade déjà ta qualité de retrieval.

Avant de débattre des fournisseurs pendant des semaines, voilà la forme SQL que je mettrais en production en premier sur Postgres.

```sql
create extension if not exists vector;

create table knowledge_chunks (
  id uuid primary key,
  tenant_id text not null, -- frontière de sécurité pour une retrieval multi-tenant
  document_id text not null,
  chunk_index integer not null,
  content text not null,
  metadata jsonb not null default '{}'::jsonb,
  embedding vector(1536) not null -- remplace 1536 par la dimension réelle du modèle
);

create index knowledge_chunks_embedding_idx
on knowledge_chunks using hnsw (embedding vector_cosine_ops);

create index knowledge_chunks_metadata_idx
on knowledge_chunks using gin (metadata jsonb_path_ops);

select id, document_id, chunk_index, content
from knowledge_chunks
where tenant_id = $2 -- tenant ou workspace courant
  and metadata @> '{"language":"en","version":"2026-05"}'
order by embedding <=> $1 -- $1 est l'embedding de la requête
limit 5; -- top-k avant reranking ou assemblage du prompt
```

Cette forme tient parce que [embeddings OpenAI](https://platform.openai.com/docs/guides/embeddings) explicite la dimension du modèle, et que [index JSONB](https://www.postgresql.org/docs/current/datatype-json.html#JSON-INDEXING) garde les filtres de métadonnées rapides au lieu de les transformer en scans de table. Je traite `tenant_id` comme une frontière de sécurité, pas comme une métadonnée pratique. Si un seul chemin de requête peut l'oublier, tu as déjà ouvert une fuite.

Le piège de coût se trouve souvent hors de la base. Ré-embedder un gros corpus reste un travail d'API, donc vérifie les [limites de débit](https://platform.openai.com/docs/guides/rate-limits) de ton fournisseur avant de lancer un backfill qui se bloque à mi-chemin.

Ma règle est simple : commence avec pgvector si tu fais déjà confiance à Postgres et que ta retrieval reste saine avec un index vectoriel et un index de métadonnées. Passe sur une base vectorielle dédiée quand la recherche filtrée, le volume d'écriture ou l'isolation opérationnelle deviennent une douleur hebdomadaire. Si tu passes plus de temps à soigner la couche de stockage qu'à améliorer la pertinence, c'est le seuil où un système spécialisé commence à mériter son coût.
