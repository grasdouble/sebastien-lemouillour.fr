---
id: chunk-size
order: 11
difficulty: intermediate
tags: [RAG, chunking, context, OpenAI]
publishedAt: 2026-05-31
updatedAt: 2026-05-31
---

Les gros chunks brillent en démo. Tu récupères moins de lignes, chaque résultat a l'air riche, et le prompt semble rempli de contexte. Puis le trafic réel arrive : la réponse cite la mauvaise sous-section, ton budget de prompt fond, et une page bavarde continue de battre le paragraphe que l'utilisateur cherchait vraiment.

Mon premier mauvais réflexe, c'était de partir de la limite du modèle. Je fais l'inverse maintenant. OpenAI facture les embeddings au token d'entrée dans le [guide embeddings](https://platform.openai.com/docs/guides/embeddings), donc je mesure d'abord le corpus avec le [tokenizer](https://platform.openai.com/tokenizer) avant de fixer le moindre seuil. La bonne question est simple : quelle est la plus petite portion de texte capable de répondre à une question utilisateur sans embarquer la moitié du document ?

C'est pour ça que je choisis d'abord l'unité sémantique. Le [guide Cohere](https://docs.cohere.com/page/chunking-strategies) sépare bien les stratégies indépendantes du contenu et celles qui dépendent du contenu, et ça colle parfaitement à la prod. Une référence d'API demande souvent des sections courtes. Une transcription demande souvent de garder un tour de parole, ou un court échange, intact. Je n'augmente la taille que quand la réponse déborde vraiment d'une seule unité.

Voici la table de profils que je brancherais avant d'indexer un corpus mixte.

```ts
type ChunkProfile = {
  targetTokens: number; // taille moyenne visée
  maxTokens: number; // limite dure avant redécoupage
  overlapTokens: number; // garde un peu de contexte local
  splitOn: string[]; // privilégie les frontières sémantiques
};

const chunkProfiles = {
  docs: {
    targetTokens: 320,
    maxTokens: 420,
    overlapTokens: 40,
    splitOn: ['\n## ', '\n### ', '\n\n'],
  },
  api: {
    targetTokens: 180,
    maxTokens: 260,
    overlapTokens: 24,
    splitOn: ['\n### ', '\n\n', '.\n'],
  },
  transcript: {
    targetTokens: 260,
    maxTokens: 340,
    overlapTokens: 32,
    splitOn: ['\nSpeaker ', '\n\n'],
  },
} satisfies Record<string, ChunkProfile>;

export function shouldResplit(chunk: { tokenCount: number }) {
  return chunk.tokenCount > 420;
}

export function canMerge(left: { accessScope: string }, right: { accessScope: string }) {
  return left.accessScope === right.accessScope;
}
```

Deux raccourcis me font gagner du temps. D'abord, je garde un overlap volontairement faible. Suffisant pour préserver une référence, pas assez pour répéter cinq fois la même réponse. Ensuite, je ne fusionne jamais du texte qui n'a pas le même niveau d'accès. Si du contenu public et du contenu restreint finissent dans le même chunk, le retrieval peut ressortir le mauvais passage plus tard, même si tes permissions au niveau document ont l'air correctes.

Côté implémentation, je préfère les splitters qui exposent la structure et l'overlap directement au lieu de tout cacher derrière un seul entier. Les [node parsers](https://docs.llamaindex.ai/en/stable/module_guides/loading/node_parsers/) de LlamaIndex sont un bon exemple, parce qu'ils permettent de basculer entre découpe par phrases et découpe par tokens sans réécrire tout le pipeline d'ingestion.

Le piège opérationnel, c'est de ré-embedder tout le corpus avec des chunks trop gros puis de considérer le sujet réglé. Si tu utilises OpenAI pour les embeddings, des chunks plus larges coûtent plus cher et consomment plus vite les [rate limits](https://platform.openai.com/docs/guides/rate-limits) pendant une réindexation massive. Je traite par profil de chunk, je garde des retries idempotents, et j'inspecte les requêtes ratées avant de toucher à tout le dataset.

Ma règle est assez sèche : démarre autour de 300 à 400 tokens pour de la prose, 150 à 250 pour des références d'API, et garde les transcriptions à un tour de parole sauf si la bonne réponse s'étale régulièrement sur deux. Si la bonne réponse exige `topK > 6`, augmente un peu. Si un chunk remonté contient souvent deux réponses sans rapport, coupe plus petit.
