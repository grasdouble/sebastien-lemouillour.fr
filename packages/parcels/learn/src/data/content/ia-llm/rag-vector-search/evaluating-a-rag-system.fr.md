---
id: evaluating-a-rag-system
order: 24
difficulty: advanced
tags: [RAG, evaluation, observability, Ragas, TruLens]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

Beaucoup d’équipes RAG déploient encore des changements au ressenti. Quelqu’un modifie le chunking, remplace le reranker, ajuste le prompt, puis pose trois questions favorites en staging. Une semaine plus tard, les utilisateurs remontent des régressions et personne n’est capable de dire si le système est moins précis, moins fidèle, plus lent, ou simplement plus cher.

Ma position est simple : un score unique donne un faux sentiment de sécurité. Un système RAG a besoin d’une évaluation séparée pour la qualité du retrieval, la qualité des réponses et le comportement opérationnel. Si tu écrases tout dans un seul nombre, l’équipe optimisera la couche la plus simple à bouger et laissera intacte celle qui crée la panne.

J’aime [Ragas](https://docs.ragas.io/) parce qu’il pousse naturellement vers des expériences plutôt que vers des captures d’écran. J’aime [TruLens](https://www.trulens.org/) parce que les traces rendent les pannes inspectables étape par étape : chunks récupérés, appels d’outils, grounding, sortie finale. Et j’aime [DeepEval](https://docs.confident-ai.com/) quand je veux que le harnais d’évaluation vive dans la CI à côté du code, pas dans un dashboard que personne ne regarde avant un merge.

Le point que les tutoriels sautent presque toujours, c’est le design du dataset. Les requêtes aléatoires ne servent plus à grand-chose dès que le système devient correct. Je veux des sets d’évaluation construits à partir des modes d’échec : jargon interne flou, documents périmés, permissions manquantes, questions multi-sauts, sources quasi dupliquées, et questions où le bon comportement consiste à répondre “je ne sais pas”. Si ton dataset n’inclut pas des cas moches, il ne protège pas la production.

Quand le coût d’annotation devient le vrai frein, lis [ARES](https://arxiv.org/abs/2311.09476). La leçon importante n’est pas que les juges automatiques remplacent les humains, mais qu’on peut combiner données synthétiques, juges légers et petit set humain calibré pour faire monter l’évaluation en puissance sans exploser l’organisation.

Le contrat minimum que j’attends d’une équipe RAG sérieuse ressemble à ça :

```yaml
eval_layers:
  retrieval:
    - recall_at_10
    - precision_at_5
    - index_freshness
  generation:
    - faithfulness
    - answer_relevance
    - refusal_quality
  operations:
    - p95_latency
    - cost_per_answer
    - trace_coverage
release_rule:
  block_if_any_critical_metric_regresses: true
```

J’ajouterais aussi des propriétaires explicites. Les métriques de retrieval appartiennent à la personne qui touche à l’indexation et au ranking. La faithfulness appartient à la personne qui modifie les prompts et la politique de génération. Le coût et la latence appartiennent à la couche plateforme. La responsabilité partagée finit souvent en absence totale de responsabilité.

Ma règle est difficile à contester : si un changement proposé ne sait pas dire quelle métrique il doit améliorer, quel seuil il doit préserver et quel déclencheur impose un rollback, il n’est pas prêt pour la production.
