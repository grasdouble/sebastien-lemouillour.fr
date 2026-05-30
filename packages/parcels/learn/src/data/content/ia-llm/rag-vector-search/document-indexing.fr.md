---
id: document-indexing
order: 8
difficulty: intermediate
tags: [RAG, indexing, embeddings, OpenAI]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

Ta recherche remonte des résultats. Les mauvais résultats. Pas parce que le modèle est nul, mais parce que l'index est périmé, dupliqué, ou incomplet. Une énorme partie des bugs RAG que je vois sont des bugs d'indexation déguisés en problèmes de retrieval.

Je traite l'indexation comme un pipeline de build, pas comme une tâche de fond qu'on laisse tourner sans trop regarder. On lit la source, on la normalise, on la découpe, on génère les embeddings, on upsert, on supprime ce qui n'existe plus, et on garde une trace exacte de la version source qui a produit chaque chunk. Dès qu'une de ces étapes devient floue, les réponses commencent à dériver.

Les docs officielles donnent chacune un morceau du pipeline. Les [splitters LangChain](https://python.langchain.com/docs/concepts/text_splitters/) couvrent la découpe, le guide [OpenAI embeddings](https://platform.openai.com/docs/guides/embeddings) couvre la génération des vecteurs, et le stockage gère upserts et suppressions, que tu partes sur la [doc Qdrant](https://qdrant.tech/documentation/) ou la [doc Pinecone](https://docs.pinecone.io/). Ce que beaucoup de contenus laissent de côté, c'est la colle entre ces briques : des identifiants stables et un hash de contenu.

Je veux une indexation idempotente. Si un document n'a pas changé, on le saute. Si un seul paragraphe a bougé, on remplace uniquement les chunks concernés. Si la source a disparu, on retire ses vecteurs. Tout reconstruire à chaque déploiement paraît rassurant au début, puis le corpus grossit, les coûts montent, et tu te cognes des limites de débit pour rien.

C'est le pattern que je réutilise le plus souvent en production.

```ts
import { createHash } from 'node:crypto';

type SourceDoc = { id: string; title: string; text: string; url: string; updatedAt: string };

export async function indexDocument(doc: SourceDoc, vectorStore: VectorStore) {
  const contentHash = createHash('sha256').update(doc.text).digest('hex');
  const existing = await vectorStore.getDocumentVersion(doc.id);

  if (existing?.contentHash === contentHash) {
    return { skipped: true };
  }

  const chunks = splitDocument(doc.text, {
    chunkSize: 400, // cible en tokens, pas en caractères
    overlap: 40,
  });

  const embeddings = await embedBatch(chunks.map((chunk) => chunk.text));

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

  await vectorStore.saveDocumentVersion(doc.id, { contentHash, chunkCount: chunks.length });
  return { skipped: false, chunkCount: chunks.length };
}
```

Regarde ce qui n'est pas négociable ici : `contentHash`, des ids de chunks stables, et un suivi de version au niveau document. Sans ces trois éléments, la réindexation devient une suite d'hypothèses et le nettoyage finit à la main.

Ma règle de décision est volontairement sévère : si ton indexeur n'est pas capable de répondre à « qu'est-ce qui a changé ? » et « qu'est-ce qu'il faut supprimer ? » sans rescanner tout le corpus, il n'est pas prêt pour la prod. Corrige ça avant d'optimiser les prompts de retrieval, parce qu'un contexte périmé fera plus de dégâts qu'un prompt moyen.
