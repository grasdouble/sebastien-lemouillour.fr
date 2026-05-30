---
id: multi-vector-rag
order: 17
difficulty: advanced
tags: [RAG, architecture, ColBERT, retrieval]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

La recherche à vecteur unique commence à paraître très naïve quand tu as déjà débogué assez de quasi-échecs. Un chunk contient la phrase exacte dont tu as besoin, pourtant son embedding unique est dominé par le texte autour et le passage ne remonte jamais. C'est précisément le genre d'échec que le RAG multi-vecteur cherche à corriger. Si tu ne l'as pas vu clairement dans tes évaluations, n'utilise pas encore cette architecture.

La distinction importante est architecturale, pas marketing. Des modèles comme [ColBERT](https://arxiv.org/abs/2004.12832) conservent plusieurs vecteurs par passage et utilisent une interaction tardive, ce qui préserve des correspondances fines au niveau des tokens au lieu d'écraser tout un chunk en un seul point dans l'espace. [ColBERTv2](https://arxiv.org/abs/2112.01488) améliore l'efficacité, mais on reste face à un système beaucoup plus lourd. Tu stockes plus de vecteurs, tu lances une recherche plus coûteuse et tu as besoin de meilleure observabilité parce que les échecs sont plus difficiles à expliquer.

Il existe une autre famille que beaucoup appellent aussi multi-vecteur : indexer plusieurs représentations d'un même document parent, par exemple un résumé, des questions synthétiques et le chunk d'origine. Des outils comme [LlamaIndex](https://docs.llamaindex.ai/en/stable/) rendent cette stratégie abordable. Je continue pourtant à la séparer mentalement de l'interaction tardive, parce que le compromis opérationnel n'est pas le même. L'indexation multi-représentation gonfle surtout le coût d'écriture, alors qu'un schéma à la ColBERT gonfle surtout le coût de lecture.

Le contrat de stockage auquel je fais confiance rend la relation parent-enfant explicite :

```ts
type ChildVector = {
  childId: string;
  parentId: string;
  kind: 'passage' | 'summary' | 'question';
  embedding: number[];
  text: string;
};

async function retrieveParentDocs(query: string) {
  const childHits = await multiVectorIndex.search(query, { topK: 30 });
  const grouped = groupBy(childHits, (hit) => hit.parentId);

  return Object.values(grouped)
    .map((hits) => scoreParent(hits))
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);
}
```

Ce `parentId` est la partie sous-conçue par beaucoup d'équipes. Si la recherche remonte un excellent vecteur enfant mais que ton générateur ne reçoit que ce tout petit fragment, tu perds du contexte. Si tu réhydrates systématiquement le parent entier, tu récupères du contexte mais tu réinjectes aussi du bruit. La bonne réponse dépend du domaine. En recherche juridique ou conformité, j'élargis souvent la fenêtre parent. En recherche support, je préfère des parents plus compacts pour garder un prompt léger.

Cette approche n'a de sens à grande échelle qu'après avoir épuisé les correctifs plus simples : meilleur chunking, meilleurs filtres de métadonnées, recherche hybride, puis reranking. Ici, les métriques de production comptent davantage que la nouveauté du modèle. Surveille le nombre moyen de vecteurs par document, la latence p95 de retrieval, le taux d'écrasement des candidats par `parentId`, et les cas où un passage pertinent apparaît côté enfant puis disparaît après agrégation parent. Des systèmes comme [Vespa](https://docs.vespa.ai/en/nearest-neighbor-search.html) savent gérer cette classe de recherche, mais la facture opérationnelle est bien réelle.

Mon seuil de décision est brutal : je n'adopte le RAG multi-vecteur que lorsque la recherche mono-vecteur rate encore des passages étroits qu'un humain repère immédiatement, et que le reranking ne suffit plus à combler l'écart. Si ton problème est un rappel thématique large, c'est le mauvais outil. Si ton problème est la précision sur de petits faits à forte valeur, alors la complexité supplémentaire de l'index commence à se justifier.
