---
id: metadata
order: 9
difficulty: intermediate
tags: [RAG, metadata, filtering, VectorDB]
publishedAt: 2026-05-31
updatedAt: 2026-05-31
---

Tu livres la réponse, le chunk a l'air parfait, et le support t'envoie quand même la capture d'écran. Le coupable habituel, c'est « de mauvais embeddings ». Chez moi, ils n'étaient généralement pas mauvais. Le retriever ramenait le bon sujet, mais pour le mauvais public, la mauvaise langue ou une version retirée.

Voilà pourquoi je traite les métadonnées comme le premier filtre, pas comme un bonus. Les [filtres Pinecone](https://docs.pinecone.io/guides/search/filter-by-metadata) permettent de restreindre la recherche avec des métadonnées, le [filtrage Qdrant](https://qdrant.tech/documentation/concepts/filtering/) repose sur des conditions booléennes sur le payload, les [filtres Weaviate](https://weaviate.io/developers/weaviate/search/filters) combinent recherche vectorielle et contraintes structurées, et [pgvector](https://github.com/pgvector/pgvector) garde des prédicats SQL classiques à côté de la similarité vectorielle. Les moteurs changent, la leçon reste la même : la similarité doit classer des candidats après que tes contraintes ont déjà réduit l'espace de recherche.

Je garde des métadonnées ennuyeuses mais applicables : `audience`, `locale`, `docType`, `product`, `version`, `visibility`, `publishedAt`. J'écarte les champs que personne n'interrogera de manière cohérente. Les gros blobs coûtent du stockage, ralentissent les mises à jour et poussent les équipes vers du JSON bricolé au lieu de filtres stables. Je garde aussi un `topK` raisonnable, parce que les [limites OpenAI](https://platform.openai.com/docs/guides/rate-limits) rendent le budget d'ingestion et de retrieval très concret quand tu dois ré-encoder un gros corpus après un changement de schéma.

Avant de brancher la recherche, j'écris le contrat de filtrage que j'attends du store.

```ts
type ChunkMetadata = {
  audience: 'public' | 'internal'; // frontière d'accès
  locale: 'en' | 'fr'; // langue de la requête
  docType: 'guide' | 'faq' | 'api'; // segment de retrieval
  product: 'search' | 'billing' | 'security'; // domaine fonctionnel
  version: string; // exemple : 2026-05
  publishedAt: string; // date ISO pour la fraîcheur
};

const results = await vectorStore.search({
  query: userQuestion,
  topK: 5, // assez de rappel sans noyer le prompt
  filter: {
    audience: 'public',
    locale: userLocale,
    product: 'billing',
    publishedAt: { gte: '2026-01-01' }, // exclure les docs obsolètes
  },
});
```

Ce filtre améliore souvent plus la qualité des réponses qu'un nouveau tour de prompt tuning. Il fait aussi une partie du travail de sécurité : il garde le contenu interne ou retiré hors du contexte avant même qu'il arrive au modèle. Je pars quand même du principe qu'un texte récupéré peut contenir des instructions hostiles, parce que l'[injection de prompt OWASP](https://genai.owasp.org/llmrisk/llm01-prompt-injection/) dit clairement que le RAG améliore la pertinence, pas l'immunité.

Mon seuil est simple : si un champ de métadonnées ne justifie pas son coût de stockage avec un vrai filtre, une règle de ranking ou une règle de rétention dès ce sprint, je ne l'indexe pas.
