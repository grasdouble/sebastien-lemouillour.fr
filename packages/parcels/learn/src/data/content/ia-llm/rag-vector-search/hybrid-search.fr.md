---
id: hybrid-search
order: 14
difficulty: intermediate
tags: [RAG, retrieval, BM25, Pinecone]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

La recherche sémantique paraît brillante jusqu'au jour où un utilisateur tape `ERR-8492`, un SKU produit ou la formulation exacte d'une clause. À ce moment-là, ton pipeline d'embeddings sophistiqué se fait battre par une recherche plein texte beaucoup plus vieille. La recherche hybride sert à ça, pas à donner un air plus sérieux à l'architecture.

Ce que beaucoup d'équipes évitent, c'est le diagnostic. Si la recherche vectorielle échoue parce que le chunking est mauvais ou que les métadonnées sont absentes, l'hybride ne fera que masquer le vrai problème avec plus d'infrastructure. Je l'ajoute uniquement quand je peux nommer une famille d'échecs : identifiants, acronymes rares ou formulations où la fréquence exacte des termes compte. C'est précisément le terrain de [BM25](https://www.elastic.co/blog/practical-bm25-part-2-the-bm25-algorithm-and-its-variables), alors que les vecteurs denses restent meilleurs pour les paraphrases et l'intention floue.

Des fournisseurs comme [Pinecone hybrid search](https://docs.pinecone.io/guides/search/hybrid-search) ou [Weaviate hybrid search](https://weaviate.io/developers/weaviate/search/hybrid) simplifient la mécanique, mais la vraie décision concerne la fusion des résultats. La fusion par score pondéré paraît élégante, sauf qu'elle suppose que les scores sont comparables. En pratique, ils le sont rarement. Je préfère commencer par une fusion par rang, souvent un [RRF](https://plg.uwaterloo.ca/~gvcormac/cormacksigir09-rrf.pdf), parce que les positions sont plus stables que les échelles de scoring.

L'étape de retrieval en laquelle j'ai confiance en prod ressemble volontairement à quelque chose de simple :

```ts
async function hybridSearch(query: string) {
  const [denseHits, sparseHits] = await Promise.all([
    vectorIndex.search(query, { topK: 20 }),
    bm25Index.search(query, { topK: 20 }),
  ]);

  const ranked = reciprocalRankFusion([
    { weight: 1.0, hits: denseHits },
    { weight: 0.8, hits: sparseHits },
  ]);

  return ranked.slice(0, 8);
}
```

Ce petit `topK` est volontaire. Si tu récupères 100 résultats denses et 100 résultats BM25, tu fabriques surtout du travail pour le reranker et du bruit pour le générateur. Commence serré, inspecte les échecs, puis élargis. Le piège, c'est de croire que l'hybride veut dire « on récupère tout et le modèle triera ». À partir de là, la recherche devient une benne coûteuse.

Je ne mettrais pas ça en production sans des jeux d'évaluation par catégorie. Sépare les requêtes de test entre identifiants exacts, jargon métier et questions en langage naturel. Si BM25 n'aide qu'une catégorie, ce n'est pas grave, mais il faut le savoir. Ma règle est simple : commence avec les vecteurs seuls, ajoute l'hybride quand tu peux prouver un manque récurrent sur l'exact match, et garde une logique de fusion que tu sais expliquer. Si tu as besoin de cinq réglages pour rendre l'hybride convaincant, c'est que ton système de recherche essaie de te dire quelque chose.
