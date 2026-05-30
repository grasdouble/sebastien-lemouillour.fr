---
id: chunking
order: 10
difficulty: intermediate
tags: [RAG, chunking, LangChain, LlamaIndex]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

Ta recherche vectorielle remonte bien des résultats. Les mauvais. Pas parce que le modèle est bête, mais parce que tu as découpé le document à des endroits qu'aucun humain n'aurait choisis. Tous les tutos de chunking montrent des paragraphes propres. Les vrais documents ont des titres, des tableaux, des listes, des blocs de code, des notes de bas de page, et les cicatrices d'une extraction PDF bancale.

Ma position est simple : on découpe d'abord par structure, ensuite par budget de tokens. Si un titre, un tableau ou un bloc de code porte du sens, je le garde intact aussi longtemps que possible. Je ne bascule vers une découpe récursive que si la section reste trop grosse. Les [splitters LangChain](https://python.langchain.com/docs/concepts/text_splitters/) et les [node parsers LlamaIndex](https://docs.llamaindex.ai/en/stable/module_guides/loading/node_parsers/) vont tous les deux dans ce sens, avec des stratégies récursives ou pilotées par parseur. Le guide [OpenAI embeddings](https://platform.openai.com/docs/guides/embeddings) rappelle simplement qu'un budget de tokens existe toujours, donc la structure ne suffit pas à elle seule.

L'erreur que je vois partout, c'est de traiter tous les formats source de la même manière. Une doc Markdown, une référence d'API, une transcription d'appel et un texte OCR ne devraient jamais passer par une seule fonction universelle. Les tableaux sont le cas le plus traître : un splitter garde les lignes ensemble mais dépasse ta cible, un autre coupe les lignes en morceaux et rend le retrieval inutile. La bonne réponse consiste souvent à normaliser d'abord, puis à découper.

Voici le petit dispatcher que j'aime avoir avant même de brancher les abstractions du framework.

```ts
export function chunkDocument(input: { type: 'markdown' | 'html' | 'transcript'; text: string }) {
  if (input.type === 'markdown') {
    return chunkMarkdownByHeading(input.text, {
      maxTokens: 400,
      keepHeading: true,
      preserveCodeBlocks: true,
    });
  }

  if (input.type === 'transcript') {
    return chunkTranscriptBySpeaker(input.text, {
      maxTokens: 300,
      mergeShortTurns: true,
    });
  }

  return recursiveChunk(input.text, {
    maxTokens: 350,
    separators: ['\n\n', '\n', '. ', ' '],
  });
}
```

Regarde l'ordre : logique spécifique au format d'abord, récursion générique en dernier. Ce seul choix améliore souvent plus le retrieval qu'un changement de modèle d'embedding.

Je garde aussi le contexte parent collé au chunk. Un titre, un nom de section ou un label de speaker compte souvent autant que le texte lui-même, donc je le préfixe pendant l'indexation au lieu d'espérer qu'un filtre sur métadonnées sauvera la recherche plus tard.

Ma règle de base : si un humain dirait « cette phrase n'a de sens qu'avec la ligne du dessus », ton chunker a besoin de plus de structure. Si ton premier réflexe pour tous les documents reste « couper tous les 500 tokens », tu optimises le confort de développement, pas la qualité du retrieval.
