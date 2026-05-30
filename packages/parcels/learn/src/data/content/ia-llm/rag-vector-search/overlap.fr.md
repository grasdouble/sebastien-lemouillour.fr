---
id: overlap
order: 12
difficulty: intermediate
tags: [RAG, chunking, recall, LangChain]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

Tu poses une bonne question, la réponse existe bien dans la source, et pourtant le retrieval la rate parce que la phrase clé a été coupée en deux entre deux chunks. Voilà le vrai rôle de l'overlap. Pas donner un air sophistiqué au découpage, mais protéger le sens aux frontières.

Je garde un overlap modeste par défaut. La plupart des équipes font l'un des deux extrêmes : zéro overlap, donc perte de contexte en bordure, ou un overlap énorme qui remplit le store de quasi-doublons. Les deux font mal. Les [splitters LangChain](https://python.langchain.com/docs/concepts/text_splitters/) et les [node parsers LlamaIndex](https://docs.llamaindex.ai/en/stable/module_guides/loading/node_parsers/) exposent ce paramètre pour une bonne raison : il améliore le rappel quand le sens déborde d'un chunk sur l'autre. Mais chaque token répété, c'est aussi un token de plus à embed, stocker, classer, puis parfois envoyer au modèle, donc le coût décrit dans [OpenAI embeddings](https://platform.openai.com/docs/guides/embeddings) doit rester présent pendant le réglage.

Mon point de départ tourne en général entre 10 et 15 % de la taille du chunk. Suffisant pour garder la continuité, pas assez pour inonder les résultats de recherche avec des clones. Je descends sur des documents bien structurés avec des titres, et je monte un peu sur des transcriptions brouillonnes ou de l'OCR où les frontières sont peu fiables. Si ton chunker respecte déjà les sections et les tours de parole, l'overlap devient un petit filet de sécurité. Si ton chunker est grossier, l'overlap devient un pansement coûteux.

Le détail que les tutos oublient presque toujours, c'est la déduplication. L'overlap améliore le rappel, mais il augmente aussi la probabilité que le top des résultats soit composé de cinq variantes du même passage. Je préfère dédupliquer après le retrieval plutôt que d'augmenter `topK` à l'aveugle en espérant que le modèle fasse le tri.

Voici le nettoyage post-retrieval que j'ajoute presque à chaque fois.

```ts
export function dedupeOverlappingChunks(chunks: Array<{ id: string; sourceId: string; start: number; end: number }>) {
  return chunks.filter((chunk, index, all) => {
    return !all.slice(0, index).some((prev) => {
      const sameSource = prev.sourceId === chunk.sourceId;
      const overlaps = Math.max(0, Math.min(prev.end, chunk.end) - Math.max(prev.start, chunk.start));
      const smallerSpan = Math.min(prev.end - prev.start, chunk.end - chunk.start);

      return sameSource && overlaps / smallerSpan > 0.6;
    });
  });
}
```

Ce simple passage garde la sécurité apportée par l'overlap sans remplir le prompt final de contexte répété.

Ma règle de décision : démarre à 10 % d'overlap, mets zéro seulement quand tes documents ont des frontières naturelles fortes, et méfie-toi au-delà de 20 %. Si tu as besoin de plus pour sauver le retrieval, le problème vient le plus souvent de la structure des chunks, pas de l'overlap lui-même.
