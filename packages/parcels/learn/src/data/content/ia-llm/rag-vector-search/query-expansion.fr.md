---
id: query-expansion
order: 16
difficulty: intermediate
tags: [rag]
publishedAt: 2026-05-31
updatedAt: 2026-05-31
---

Ton retriever a l'air cassé quand un utilisateur tape "le login bloque après le SSO" et que le chunk utile dit "timeout d'authentification pendant une redirection fédérée". Si ce décalage de formulation continue d'éjecter le bon chunk du jeu de candidats, je ne touche pas d'abord au générateur. Je corrige le rappel côté retrieval avec de l'expansion de requête.

La première décision consiste à vérifier que tu as vraiment un problème de rappel. Si le chunk gagnant apparaît déjà quelque part dans le top 10, l'expansion te fait surtout dépenser plus. La réécriture de requête sert à combler un écart de formulation, pas à corriger un mauvais ordre des résultats. Les moteurs de recherche managés proposent déjà [query rewrite](https://learn.microsoft.com/en-us/azure/search/semantic-how-to-query-rewrite) pour ce cas précis.

Une fois l'échec identifié, je choisis l'expansion la plus légère capable de le corriger. Les [LlamaIndex transforms](https://docs.llamaindex.ai/en/stable/examples/query_transformations/query_transform_cookbook/) montrent bien l'échelle habituelle : une réécriture pour nettoyer la formulation, quelques variantes pour une recherche multi-requêtes, puis des approches plus lourdes quand la langue du corpus reste loin de celle de l'utilisateur. Le [papier HyDE](https://arxiv.org/abs/2212.10496) est le saut que j'utilise avec parcimonie : je demande au modèle une courte réponse hypothétique, j'embed ce texte, puis je lance la recherche à partir de là. Le [papier Query2doc](https://arxiv.org/abs/2303.07678) va dans le même sens, les pseudo-documents peuvent améliorer le rappel, mais seulement quand ce texte supplémentaire reste collé au domaine.

Quand le décalage de formulation est réel, voilà le pattern que je garde en production :

```ts
async function expandedSearch(question: string) {
  const variants = await llm.generate([
    `Rewrite as an exact search query: ${question}`, // recover precise product terms
    `Rewrite with likely domain wording: ${question}`, // bridge user language to corpus language
    `Write a short likely answer paragraph: ${question}`, // HyDE-style synthetic seed
  ]);

  const queries = dedupe([question, ...variants]).slice(0, 4); // cap model cost and latency
  const hits = await Promise.all(
    queries.map((q) => vectorIndex.search(q, { topK: 6 })) // keep fan-out small enough to inspect
  );

  return reciprocalRankFusion(hits).slice(0, 8); // hand a tight set to reranking or generation
}
```

Je garde cette limite basse volontairement. Chaque reformulation supplémentaire consomme un appel modèle, grignote ton budget de rate limits et augmente le risque de partir sur des sujets voisins. Mets en cache les expansions par requête normalisée, journalise la variante qui récupère réellement le chunk gagnant, et retire les emails, tickets bruts ou secrets avant d'envoyer le texte utilisateur au modèle d'expansion.

Je fusionne aussi par rang, pas par score brut. La [doc Elastic RRF](https://www.elastic.co/docs/reference/elasticsearch/rest-apis/reciprocal-rank-fusion) l'explique bien : RRF combine plusieurs listes de résultats sans faire semblant que leurs échelles de score racontent la même chose. Mon seuil est simple : si deux à quatre requêtes au total ne font pas entrer les documents ratés dans le jeu de candidats, j'arrête l'expansion et je corrige plutôt le chunking, les métadonnées ou le reranking.
