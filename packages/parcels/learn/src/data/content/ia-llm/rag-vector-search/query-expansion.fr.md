---
id: query-expansion
order: 16
difficulty: intermediate
tags: [RAG, retrieval, HyDE, reformulation]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

Les utilisateurs ne posent presque jamais leurs questions avec le vocabulaire exact de ta documentation. Ils écrivent « le login bloque après le SSO » alors que la page utile parle de « timeout d'authentification pendant une redirection fédérée ». Quand la recherche rate pour cette raison, de meilleurs embeddings aident un peu, mais ne ferment pas tous les écarts de langage. L'expansion de requête, je l'utilise quand le problème vient du rappel, pas du classement.

Il y a trois familles qui valent vraiment le détour. La recherche multi-requêtes génère quelques reformulations puis cherche avec chacune. La réécriture de requête produit une seule version plus pertinente. [HyDE](https://arxiv.org/abs/2212.10496) va plus loin : on demande au modèle de rédiger une réponse hypothétique, puis on embed ce texte synthétique pour lancer la recherche. Des outils comme [LlamaIndex query transforms](https://docs.llamaindex.ai/en/stable/examples/query_transformations/query_transform_cookbook/) exposent directement ces variantes, et des travaux comme [Query2doc](https://arxiv.org/abs/2303.07678) montrent pourquoi des pseudo-documents peuvent améliorer le rappel.

Le piège, c'est la sur-expansion. Cinq reformulations donnent l'impression d'être plus robuste qu'une seule, jusqu'au moment où tu regardes les résultats et tu vois surtout une facture de retrieval multipliée, un ensemble candidat plus large et des pages à moitié hors sujet. L'expansion de requête est facile à surutiliser parce qu'un problème de retrieval et un problème de ranking se ressemblent beaucoup dans une démo. Si le bon chunk est déjà dans le top 10, l'expansion est souvent le mauvais levier. Il faut reranker, pas multiplier les requêtes.

Quand j'en fais, je garde un contrat petit et observable :

```ts
async function expandedSearch(question: string) {
  const variants = await llm.generate([
    `Rewrite for exact terms: ${question}`,
    `Rewrite for product language: ${question}`,
    `Write a likely answer paragraph: ${question}`,
  ]);

  const queries = dedupe([question, ...variants]).slice(0, 4);
  const hits = await Promise.all(queries.map((q) => vectorIndex.search(q, { topK: 6 })));

  return reciprocalRankFusion(hits).slice(0, 8);
}
```

Cette limite sur le nombre de variantes n'est pas décorative. Je veux assez de diversité pour combler un écart de vocabulaire, pas assez de créativité pour inventer un nouveau problème de recherche. Je journalise aussi la reformulation qui a réellement récupéré le chunk gagnant. Sans ça, impossible de savoir si HyDE a aidé ou si une simple réécriture faisait déjà tout le boulot.

Le point que la plupart des tutoriels évitent, c'est l'analyse des échecs. L'expansion peut dériver vers des sujets voisins et dégrader la précision sans bruit apparent. Si ton corpus contient des concepts proches, par exemple facturation, authentification et provisioning, une reformulation trop large peut tout mélanger. Ma règle est simple : je sors l'expansion seulement quand j'ai des preuves que la recherche mono-requête rate des documents pertinents à cause d'un décalage de formulation. Si ton jeu d'évaluation montre que la bonne réponse est déjà présente mais mal ordonnée, n'ajoute pas plus de requêtes. Ajoute une meilleure étape de ranking et garde la recherche la plus sobre possible.
