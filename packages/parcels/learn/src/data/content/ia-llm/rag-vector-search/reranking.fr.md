---
id: reranking
order: 15
difficulty: intermediate
tags: [rag]
publishedAt: 2026-12-31
updatedAt: 2026-05-31
---

Un retriever peut avoir l'air correct en offline et quand même placer l'unique bon chunk en sixième position. Ensuite ton prompt ne garde que trois passages, le modèle répond depuis le mauvais, et tu perds des heures à retoucher le prompt pour un problème de ranking. J'ajoute du reranking exactement dans ce cas : le bon chunk est déjà dans la liste candidate, juste pas assez haut.

Cette deuxième étape marche parce qu'une API hébergée comme [Cohere API](https://docs.cohere.com/reference/rerank) score la requête contre les textes candidats bruts, renvoie des résultats ordonnés avec un score de pertinence, et documente explicitement les réponses `429` quand tu pousses trop fort. Si je dois rester en local, le [pipeline SBERT](https://www.sbert.net/examples/sentence_transformer/applications/retrieve_rerank/README.html) garde un retriever rapide au début et un CrossEncoder seulement pour la shortlist. C'est le compromis que je choisirais dans la plupart des cas : rappel peu coûteux d'abord, précision chère ensuite.

Le problème de budget arrive tout de suite, donc je garde un contrat serré. Un reranker qui voit tous les chunks récupérés n'est qu'un retriever lent déguisé, et les services managés te le rappellent vite avec la latence ou la facture.

Avant de l'intégrer dans un framework, je valide souvent la forme avec une petite fonction comme celle-ci :

```python
import os

from cohere import ClientV2

co = ClientV2(api_key=os.environ["COHERE_API_KEY"])


def rerank_hits(query: str, hits: list[dict]) -> list[dict]:
    if not hits:
        return []

    limited_hits = hits[:20]  # borne la latence et le volume facturé
    response = co.rerank(
        model="rerank-v3.5",  # reranker hébergé
        query=query,  # question utilisateur
        documents=[hit["text"] for hit in limited_hits],  # chunks candidats
        top_n=min(5, len(limited_hits)),  # ne garde que ce que tu peux injecter
    )

    return [
        {
            **limited_hits[item.index],
            "rerank_score": item.relevance_score,
        }
        for item in response.results
    ]
```

Ce `[:20]` est la vraie décision. Si vingt candidats restent bruyants, je corrige le chunking, les filtres ou la recherche hybride avant de payer pour trier un tas plus grand. Si un endpoint hébergé fait partie du chemin, je considère aussi [Cohere commitments](https://cohere.com/enterprise-data-commitments) comme une lecture obligatoire, parce que le texte candidat sort de ton application et que la plateforme SaaS journalise prompts et générations tant que tes conditions de déploiement ne disent pas autre chose.

Si tu veux un meilleur contrôle des données ou un débit plus prévisible, un CrossEncoder local est la version que je déploierais ensuite. Les [CrossEncoder docs](https://www.sbert.net/examples/cross_encoder/applications/README.html) sont très clairs sur le compromis : meilleur scoring paire par paire, bien moins bon passage à l'échelle qu'un bi-encoder.

Quand je prends cette voie auto-hébergée, je garde une taille de batch explicite et une shortlist bornée pour que le modèle reste prévisible sous charge :

```python
from sentence_transformers import CrossEncoder

model = CrossEncoder("cross-encoder/ms-marco-MiniLM-L6-v2")


def rerank_local(query: str, hits: list[dict]) -> list[dict]:
    limited_hits = hits[:50]  # plus large en local, mais toujours borné
    pairs = [[query, hit["text"]] for hit in limited_hits]
    scores = model.predict(
        pairs,
        batch_size=16,  # ajuste selon la mémoire CPU ou GPU
        show_progress_bar=False,
    )

    ranked = sorted(
        ({**hit, "rerank_score": float(score)} for hit, score in zip(limited_hits, scores)),
        key=lambda item: item["rerank_score"],
        reverse=True,
    )
    return ranked[:5]
```

Une fois le scoring en place, l'emplacement compte plus que la syntaxe. Dans [LlamaIndex postprocessors](https://docs.llamaindex.ai/en/stable/module_guides/querying/node_postprocessors/), le reranking se place après la recherche et avant la synthèse, qui est exactement l'endroit que je veux parce que l'étape reste mesurable. L'évaluation doit rester tout aussi serrée : [LlamaIndex eval](https://developers.llamaindex.ai/python/examples/evaluation/retrieval/retriever_eval/) suit hit-rate, MRR et Precision, et ces métriques de tête de liste racontent plus de choses qu'un rappel large quand le générateur ne voit que quelques chunks.

Le dernier piège, c'est de croire que la shortlist peut grossir sans fin. Ce n'est pas le cas. Les rerankers managés imposent des plafonds, et [Azure semantic ranker](https://learn.microsoft.com/en-us/azure/search/semantic-search-overview) ne rerank que les 50 premiers résultats initiaux. Ma règle est simple : ajoute du reranking quand le bon chunk tombe souvent entre les rangs 5 et 20, que tu peux payer un saut de ranking en plus, et que P@3 ou MRR bouge assez pour se voir. Si ces chiffres restent plats, il faut corriger le retrieval, pas le prompt.
