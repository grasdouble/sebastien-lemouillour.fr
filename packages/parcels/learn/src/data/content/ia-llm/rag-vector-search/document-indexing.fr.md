---
id: document-indexing
order: 8
difficulty: intermediate
tags: [RAG, indexing, embeddings, OpenAI]
publishedAt: 2026-05-31
updatedAt: 2026-05-31
---

Ta recherche remonte des résultats. Les mauvais résultats. Le modèle est rarement le vrai coupable. Le problème est presque toujours plus haut dans la chaîne : des chunks périmés, des vecteurs dupliqués, ou des documents jamais réindexés après une mise à jour. Je vois souvent des équipes accuser la qualité de la recherche alors que l'indexeur est la pièce qui leur ment en silence.

Je traite l'indexation d'abord comme un problème de détection de changement. OpenAI facture les embeddings au token d'entrée et limite la quantité de texte envoyée par requête dans le [guide embeddings](https://platform.openai.com/docs/guides/embeddings), donc recalculer des embeddings pour du contenu inchangé, c'est juste payer deux fois pour la même erreur.

Du coup, je choisis volontairement un pipeline très sobre : normaliser la source, calculer son empreinte, la découper, n'embeder que ce qui a changé, puis upsert avec des IDs stables. Je batch aussi avec prudence parce que les [rate limits](https://platform.openai.com/docs/guides/rate-limits) portent à la fois sur les requêtes et sur les tokens par minute. Quand quelqu'un lance tous les chunks en parallèle, il fabrique souvent son propre problème de throttling.

Les IDs stables ne sont pas négociables. Les [points Qdrant](https://qdrant.tech/documentation/manage-data/points/) acceptent des identifiants explicites, et les [upserts Pinecone](https://docs.pinecone.io/guides/data/upsert-data) écrasent les enregistrements existants avec le même ID tout en laissant remonter les métadonnées dans les résultats de recherche. C'est précisément pour ça que je garde des métadonnées utiles mais ennuyeuses : `documentId`, URL source, timestamps et empreintes de contenu. Je n'y mettrais jamais de secrets, de jetons bruts ou de notes privées.

Voici la plus petite version que je mettrais en prod avant de toucher aux diffs au niveau chunk.

```ts
import { createHash } from 'node:crypto';

type SourceDoc = {
  id: string;
  title: string;
  text: string;
  url: string;
  updatedAt: string;
};

export async function indexDocument(doc: SourceDoc, vectorStore: VectorStore) {
  const normalizedText = normalizeWhitespace(doc.text);
  const contentHash = createHash('sha256').update(normalizedText).digest('hex');
  const previousVersion = await vectorStore.getDocumentVersion(doc.id);

  if (previousVersion?.contentHash === contentHash) {
    return { skipped: true, reason: 'unchanged' };
  }

  const chunks = splitDocument(normalizedText, {
    maxTokens: 400, // reste sous des limites d'entrée courantes
    overlapTokens: 40, // garde le contexte quand une phrase déborde
  });

  const embeddings = await embedBatch(
    chunks.map((chunk) => chunk.text),
    {
      batchSize: 100, // baisse cette valeur si le provider throttle
    }
  );

  await vectorStore.deleteByDocumentId(doc.id); // retire les chunks de la version précédente

  await vectorStore.upsert(
    chunks.map((chunk, index) => ({
      id: `${doc.id}:${index}`,
      vector: embeddings[index],
      metadata: {
        documentId: doc.id,
        title: doc.title,
        url: doc.url,
        updatedAt: doc.updatedAt,
        contentHash,
      },
      text: chunk.text,
    }))
  );

  await vectorStore.saveDocumentVersion(doc.id, {
    contentHash,
    chunkCount: chunks.length,
    indexedAt: new Date().toISOString(),
  });

  return { skipped: false, chunkCount: chunks.length };
}
```

Je commence par un versioning au niveau document parce qu'il est plus simple à déboguer et supprime déjà la majorité des appels d'embedding inutiles. Je ne passe aux empreintes par chunk que lorsque la facture d'indexation devient visible ou que la file d'embedding passe son temps au bord de la limite.

Mon seuil est simple : si relancer le même corpus appelle encore l'API d'embeddings pour des documents inchangés, l'indexeur n'est pas terminé. Corrige ça avant de perdre une heure de plus à retoucher tes prompts de recherche.
