---
id: overlap
order: 12
difficulty: intermediate
tags: [RAG, chunking, recall, LangChain]
publishedAt: 2099-12-31
updatedAt: 2026-05-31
---

Tu as la bonne question, la réponse existe dans la source, et pourtant le retriever la rate parce qu'une phrase a été coupée entre deux chunks. C'est là que l'overlap devient utile. Je m'en sers pour protéger le sens aux bords des chunks, pas pour donner un air intelligent au pipeline.

Je pars d'un overlap modeste parce que zéro reste la manière la plus rapide de perdre du contexte en bordure, alors qu'un overlap énorme remplit l'index de quasi-doublons. Les [splitters LangChain](https://python.langchain.com/docs/concepts/text_splitters/) et les [node parsers LlamaIndex](https://docs.llamaindex.ai/en/stable/module_guides/loading/node_parsers/) exposent ce réglage comme un vrai paramètre pour cette raison. Et je garde le guide [OpenAI embeddings](https://platform.openai.com/docs/guides/embeddings) en tête pendant le réglage : les tokens répétés restent des tokens en entrée, donc ils augmentent le coût d'embedding et le volume stocké avant même d'améliorer le retrieval.

Mon point de départ est 10 à 15 % de la taille du chunk. C'est suffisant pour des docs où une idée déborde sur le paragraphe suivant, sans noyer les résultats de recherche sous des clones. Je descends quand le document a déjà une structure solide, avec des titres, des sections d'API ou des tours de parole nets. Je monte seulement pour de l'OCR sale ou des transcriptions brouillonnes où les frontières sont peu fiables. Si tu as besoin d'un overlap énorme sur un contenu propre, je corrigerais le splitter avant de retoucher le pourcentage.

Ce choix mène au piège que la plupart des guides sautent : la déduplication après le retrieval. L'overlap peut améliorer le rappel, mais il augmente aussi la probabilité que tes premiers résultats soient quatre variantes du même passage. Je préfère dédupliquer les hits qui se recouvrent avant d'assembler le prompt plutôt que d'augmenter `topK` et de payer pour du contexte répété.

Voici le helper que je sors dès que l'overlap commence à produire des clones.

```ts
type RetrievedChunk = {
  id: string;
  sourceId: string; // original document identifier
  start: number; // inclusive character or token offset
  end: number; // exclusive character or token offset
};

export function dedupeOverlappingChunks(
  chunks: RetrievedChunk[],
  maxOverlapRatio = 0.6 // drop later chunks that overlap more than 60%
) {
  return chunks.filter((chunk, index, all) => {
    return !all.slice(0, index).some((prev) => {
      if (prev.sourceId !== chunk.sourceId) return false;

      const sharedSpan = Math.max(0, Math.min(prev.end, chunk.end) - Math.max(prev.start, chunk.start));
      const smallerSpan = Math.min(prev.end - prev.start, chunk.end - chunk.start);

      return smallerSpan > 0 && sharedSpan / smallerSpan > maxOverlapRatio;
    });
  });
}
```

Je l'exécute après le retrieval et avant l'assemblage du prompt, pour garder le gain de rappel sans gonfler la fenêtre de contexte finale. Si ton vector store renvoie déjà les offsets des passages, c'est peu coûteux à ajouter. Sinon, je hash le texte normalisé et je supprime les voisins quasi identiques à cette étape.

Ma règle : commence à 10 %, mets zéro seulement quand les documents ont de vraies frontières naturelles, et méfie-toi au-delà de 20 %. Si le retrieval a besoin de plus pour fonctionner, le vrai problème vient en général de la qualité du chunking, pas de l'overlap.
