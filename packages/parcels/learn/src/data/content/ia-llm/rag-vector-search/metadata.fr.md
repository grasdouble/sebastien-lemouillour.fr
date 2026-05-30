---
id: metadata
order: 9
difficulty: intermediate
tags: [RAG, metadata, filtering, VectorDB]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

Le chunk a l'air pertinent, la réponse reste fausse, et tout le monde accuse les embeddings. Très souvent, la pièce manquante s'appelle métadonnées. La similarité sait dire « ce paragraphe parle de facturation ». Les métadonnées disent « ce paragraphe concerne le produit EU, version 3, en français, visible seulement pour le support ».

J'utilise les métadonnées comme une surface de contrôle, pas comme un grenier. Si un champ aide le filtrage, le ranking, l'audit ou le nettoyage, je le garde. S'il est là juste parce que « ça servira peut-être un jour », je le retire. Des métadonnées gonflées rendent l'indexation plus lourde et les requêtes plus floues.

Les docs officielles racontent la même idée avec un vocabulaire différent. La [doc Pinecone](https://docs.pinecone.io/) expose les filtres sur métadonnées, la [doc Qdrant](https://qdrant.tech/documentation/) parle de payload filtering, la [doc Weaviate](https://weaviate.io/developers/weaviate) permet de combiner recherche vectorielle et filtres structurés, et [pgvector](https://github.com/pgvector/pgvector) s'appuie sur des prédicats SQL classiques à côté de la similarité vectorielle. Le mécanisme change, la discipline devrait rester la même.

Le piège, c'est de choisir des métadonnées qui copient la source brute au lieu de refléter tes décisions de retrieval. Je veux des champs compacts, stables et filtrables : `tenantId`, `language`, `docType`, `product`, `version`, `publishedAt`, `visibility`. Je ne veux pas des bios d'auteur complètes, des labels aléatoires ou un gros JSON que personne n'interroge de manière cohérente.

Avant de brancher la recherche, définis le contrat que le store doit réellement tenir.

```ts
type ChunkMetadata = {
  tenantId: string;
  language: 'en' | 'fr';
  docType: 'guide' | 'faq' | 'api';
  product: 'search' | 'billing' | 'security';
  version: string; // exemple : 2026-05
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

C'est souvent là qu'on évite une bonne partie des hallucinations. Si ton retriever a le droit de fouiller dans des versions retirées, des notes internes et la mauvaise langue, il finira forcément par trouver quelque chose de sémantiquement proche et pratiquement inutile.

Ma règle : chaque champ de métadonnées doit gagner sa place en répondant à une question, est-ce que ça améliore le retrieval ou le cycle de vie des données ? Si non, dehors. Si oui, rends-le stable, typé et imposé dès l'indexation, parce que rajouter des métadonnées après coup sur des millions de chunks, c'est un enfer.
