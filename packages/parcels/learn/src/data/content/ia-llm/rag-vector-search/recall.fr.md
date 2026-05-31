---
id: recall
order: 21
difficulty: advanced
tags: [RAG, evaluation, retrieval, recall, DeepEval, Ragas]
publishedAt: 2026-05-31
updatedAt: 2026-05-31
---

Ton retriever rate encore le paragraphe dont les utilisateurs avaient besoin, donc le modèle répond à partir d’une preuve de second rang avec un aplomb ridicule. Ce n’est pas un problème de prompt. C’est une panne de recall.

Je traite la recall avant le reste, parce qu’un générateur ne peut pas s’ancrer sur des chunks qu’il n’a jamais vus. [Ragas](https://docs.ragas.io/en/stable/concepts/metrics/available_metrics/context_recall/) définit la context recall autour de cette seule question : quelle part de l’information pertinente a réellement été récupérée par rapport à une référence. [DeepEval](https://docs.confident-ai.com/docs/metrics-contextual-recall) est le complément pratique quand tu veux imposer le même contrôle dans des tests au lieu d’en débattre après une démo.

Ensuite, mesure la recall là où la panne se produit vraiment. Je sépare toujours la recall au niveau du chunk et celle au niveau du document. Retrouver le bon document tout en ratant le passage décisif casse quand même la réponse, la citation et le SLA.

La plupart des équipes sabotent la recall en amont avec un mauvais découpage. [Chunking Azure](https://learn.microsoft.com/en-us/azure/search/vector-search-how-to-chunk-documents) recommande des chunks de taille fixe qui restent sémantiquement cohérents, avec chevauchement, et renvoie aussi vers la structure du document quand la fenêtre fixe devient trop brutale. Si tes chunks mélangent cinq sujets ou découpent une procédure en trois fragments, ton retriever reçoit une mission impossible.

Quand le découpage est propre et que la recall reste faible, je n’augmente pas la taille du prompt en premier. [Recherche hybride](https://learn.microsoft.com/en-us/azure/search/hybrid-search-overview) existe pour une raison : la recherche vectorielle attrape les proximités conceptuelles, la recherche lexicale attrape les codes exacts, les dates, les noms et le jargon. En production, un retrieval dense-only ressemble surtout à un choix de démo.

Après ça, règle la couche ANN en gardant ton budget de latence sous les yeux. [kNN Elasticsearch](https://www.elastic.co/guide/en/elasticsearch/reference/current/knn-search.html) dit clairement que la recherche approximative achète de l’échelle et de la faible latence, alors que la recherche exacte achète de la précision, et que `num_candidates` permet de récupérer une partie de ce compromis. [HNSW OpenSearch](https://docs.opensearch.org/latest/vector-search/settings/) le dit de façon encore plus directe : augmenter `ef_search` améliore la précision et ralentit les requêtes. Si tu ne balayes jamais ces paramètres contre ton SLA, tu ne connais pas ta recall. Tu supposes.

Voici le tableau de bord que je veux avant que quiconque touche aux prompts :

```yaml
retrieval_slo:
  recall_at_5: 0.75
  recall_at_10: 0.88
  recall_at_20: 0.93
breakdowns:
  - by_query_family
  - by_language
  - by_metadata_filter
  - by_document_age
observability:
  log_missed_reference_ids: true
  compare_chunk_vs_document_recall: true
  track_ann_params:
    - num_candidates
    - ef_search
release_rule:
  fail_if_top_10_recall_drops: true
```

Ma règle est simple : si la recall top-10 sur les requêtes critiques métier reste sous 0.85, arrête d’ajuster les prompts. Si la recall top-20 est encore sous 0.9, le retrieval reste le goulot d’étranglement et chaque gain côté génération est cosmétique.
