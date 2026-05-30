---
id: chunk-size
order: 11
difficulty: intermediate
tags: [RAG, chunking, context, OpenAI]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

Les gros chunks paraissent malins en démo. On récupère moins d'éléments, chacun semble riche, et le prompt donne une impression de contexte abondant. Puis la prod arrive : les réponses citent la mauvaise sous-section, la latence grimpe, et tes meilleurs résultats traînent du texte inutile dans chaque prompt.

La taille d'un chunk ne se décide pas en regardant ce que le modèle peut avaler au maximum. Elle se décide en partant de la plus petite unité qui répond encore aux vraies questions des utilisateurs. C'est pour ça que je pars de la forme de la réponse attendue, pas de la taille de la fenêtre de contexte. Le guide [OpenAI embeddings](https://platform.openai.com/docs/guides/embeddings) rappelle que chaque token embarqué a un coût, et les [splitters LangChain](https://python.langchain.com/docs/concepts/text_splitters/) comme les [node parsers LlamaIndex](https://docs.llamaindex.ai/en/stable/module_guides/loading/node_parsers/) montrent bien que la taille de chunk est un paramètre à régler, pas une constante sacrée.

Mon point de départ pour une documentation classique tourne souvent entre 250 et 450 tokens. Pour une référence d'API, je descends volontiers parce qu'une description d'endpoint ne devrait pas être collée à trois autres sans rapport. Pour une transcription, je regarde moins le nombre de tokens et davantage l'intégrité d'un tour de parole ou d'un échange. Le chiffre compte, mais l'unité sémantique compte plus.

Au lieu de débattre d'une valeur magique, je préfère mesurer ce que fait réellement le corpus.

```ts
const chunkConfig = {
  docs: { targetTokens: 350, maxTokens: 450 },
  api: { targetTokens: 220, maxTokens: 300 },
  transcript: { targetTokens: 280, maxTokens: 360 },
};

export function selectChunkProfile(kind: keyof typeof chunkConfig) {
  return chunkConfig[kind];
}

export function shouldResplit(chunk: { tokenCount: number; headingDepth: number }) {
  return chunk.tokenCount > 450 || chunk.headingDepth > 3;
}
```

Je redécoupe les chunks trop gros avant l'indexation, parce que les gros morceaux dégradent le retrieval de manière discrète. Ils rankent souvent bien parce qu'ils contiennent beaucoup de mots pertinents, mais ils obligent le modèle à trier trop de matière et compliquent les citations. Les petits chunks ont le défaut inverse : meilleure précision, moins bon rappel, et trop de quasi-doublons dans le contexte final.

Le raccourci auquel je fais confiance est le suivant : lance une évaluation avec de vraies questions utilisateur, puis inspecte les chunks récupérés, pas seulement la réponse finale. Si la bonne réponse tient régulièrement dans un paragraphe mais que ton retriever remonte des pages entières, réduis la taille. Si tu as besoin de `topK=10` juste pour reconstituer un passage utile, tes chunks sont probablement trop petits. Commence à 300 ou 400 tokens pour de la doc, puis bouge uniquement quand les logs de retrieval te donnent une bonne raison.
