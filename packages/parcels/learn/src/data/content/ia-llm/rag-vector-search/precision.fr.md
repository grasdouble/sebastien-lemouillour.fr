---
id: precision
order: 22
difficulty: advanced
tags: [rag, evaluation]
publishedAt: 2026-05-31
updatedAt: 2026-05-31
---

Ton retriever ne rate plus la bonne réponse, mais il traîne maintenant six chunks hors sujet dans chaque prompt. Le passage utile se retrouve noyé sous des notes périmées, du boilerplate de politique et des doublons. Le modèle répond depuis le mauvais paragraphe, puis on accuse la génération alors que l'échec vient du retrieval.

Dès que le rappel n'est plus catastrophique, la précision décide si ton SLA tient en production. Je m'intéresse à la précision parce qu'un contexte hors sujet n'est jamais neutre. Il ajoute de la latence, gonfle le coût et donne au modèle plus d'occasions d'assembler un mensonge crédible.

Je mesurerais ça exactement comme la [métrique Ragas](https://docs.ragas.io/en/stable/concepts/metrics/available_metrics/context_precision/) la définit : est-ce que le retriever place les chunks pertinents au-dessus des chunks inutiles. Si ce score est faible, augmenter `k` n'est pas une précaution. C'est de l'injection de bruit.

La première correction consiste à réduire l'ensemble candidat avant même que la similarité entre en jeu. Les [filtres Pinecone](https://docs.pinecone.io/guides/search/filter-by-metadata) le montrent bien : les filtres de métadonnées permettent de contraindre la recherche au bon tenant, à la bonne langue ou au bon type de document au moment de la requête. Si tu sautes cette étape, une seule tranche sale du corpus contamine toutes les métriques derrière.

Quand le corpus mélange termes exacts et langage flou, un retrieval dense seul est trop permissif. La [recherche hybride](https://learn.microsoft.com/en-us/azure/search/hybrid-search-overview) combine recherche plein texte et recherche vectorielle dans une seule requête, puis fusionne les résultats avec reciprocal rank fusion. C'est le choix par défaut que je ferais en production, parce que la recherche par mots-clés et la recherche sémantique échouent différemment, et que la précision monte quand on laisse les deux se confronter.

Même avec ça, la première passe reste souvent trop lâche pour un générateur qui ne voit qu'une poignée de chunks. Le [semantic ranker](https://learn.microsoft.com/en-us/azure/search/semantic-search-overview) ajoute une seconde étape de reranking sur un premier ensemble de résultats. C'est exactement là que je veux dépenser un modèle de pertinence coûteux : après le retrieval bon marché, avant la construction du prompt, sur une shortlist bornée.

Il te faut aussi une observabilité alignée sur le vrai mode d'échec. La [triade TruLens](https://www.trulens.org/getting_started/core_concepts/rag_triad/) sépare la pertinence du contexte de la groundedness, et c'est la seule manière saine de diagnostiquer un système qui « hallucine » parce que le retrieval lui a servi du bruit. Si la pertinence du contexte chute sur une langue ou une famille de documents, je veux l'alerte avant les utilisateurs.

Avant de toucher aux templates de prompt, je veux que le contrat de retrieval ressemble à ça :

```yaml
retrieval_contract:
  pre_filters:
    - tenant_id
    - language
    - document_type
  first_pass:
    - hybrid_search_top_50
  second_pass:
    - semantic_rerank_top_8
  guards:
    - deduplicate_chunks
    - drop_low_score_matches
observability:
  slice_metrics:
    - by_query_family
    - by_language
    - by_source
  weekly_review:
    - inspect_top_10
    - inspect_rejected_chunks
```

Ma règle est brutale : n'élargis pas le contexte tant que la précision top-5 n'est pas au-dessus de 0.7 sur tes familles de requêtes critiques et stable par tranche de corpus. Si filtres, recherche hybride et reranking ne passent toujours pas ce seuil, le problème vient de l'index ou des labels, pas du générateur.
