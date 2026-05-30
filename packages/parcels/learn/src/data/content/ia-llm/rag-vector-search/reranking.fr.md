---
id: reranking
order: 15
difficulty: intermediate
tags: [RAG, reranking, Cohere, CrossEncoder]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

Un retriever peut être « correct » et quand même placer le meilleur chunk en sixième position. Sur le papier, ça paraît acceptable. En pratique, si ton prompt ne garde que les trois premiers résultats, le modèle répond avec le mauvais paragraphe. Le reranking, je l'utilise quand la recherche a du rappel, mais pas assez de précision tout en haut de la liste.

L'idée tient en peu de choses : le premier retriever est peu coûteux et large, le second modèle est plus lent et plus exigeant. Une option hébergée comme [Cohere Rerank](https://docs.cohere.com/v2/docs/rerank-2) score directement des paires requête-document. Un [CrossEncoder](https://www.sbert.net/docs/package_reference/cross_encoder/) auto-hébergé fait la même chose si tu veux mieux contrôler les coûts. Dans les deux cas, c'est souvent meilleur qu'une simple similarité cosinus, parce que le modèle lit la requête et le candidat ensemble au lieu de comparer deux vecteurs compressés séparément.

Ce que les tutoriels oublient presque toujours, c'est le budget. Un reranker, c'est une taxe sur la latence. Il mérite sa place quand le retriever de base trouve déjà la bonne réponse quelque part dans le top 20, mais pas de façon assez fiable dans le top 3. Si le bon chunk n'est même pas dans l'ensemble candidat, le reranking ne sert à rien, à part ralentir le chemin critique.

Le contrat que j'utilise est en deux étapes et reste volontairement serré :

```python
from cohere import ClientV2

co = ClientV2(api_key=os.environ["COHERE_API_KEY"])


def retrieve_with_rerank(query: str, dense_hits: list[str]) -> list[str]:
    response = co.rerank(
        model="rerank-v3.5",
        query=query,
        documents=dense_hits[:20],
        top_n=5,
    )

    return [dense_hits[item.index] for item in response.results]
```

Ce `[:20]` compte vraiment. Donner 100 candidats à un reranker donne l'impression d'être rigoureux, mais c'est souvent le signe que la première étape récupère trop de déchets. Je préfère améliorer le chunking, les filtres de métadonnées ou la recherche hybride avant de payer pour trier une montagne de résultats moyens.

Il y a aussi un vrai point d'intégration. Des outils comme [LlamaIndex rerankers](https://docs.llamaindex.ai/en/stable/module_guides/querying/node_postprocessors/) facilitent l'insertion du reranking après la recherche et avant la synthèse, qui est exactement sa place. N'enterre pas le reranking dans le prompt de génération. Si la qualité du classement compte, il faut qu'elle reste observable comme une étape à part.

Le signal qui m'importe le plus, ce sont les métriques sur de petits cutoffs. Precision@3 et MRR racontent plus de choses ici qu'un rappel large. Ma règle est brutale : si le reranking n'améliore pas nettement les toutes premières positions sur de vraies requêtes, je l'enlève. Je commence à le considérer quand le bon chunk arrive souvent entre la 5e et la 20e place, et j'arrête de le défendre quand le coût en latence grimpe plus vite que le gain en qualité. Tous les stacks RAG n'ont pas besoin d'un meilleur ranking, beaucoup ont surtout besoin de moins mauvais chunks.
