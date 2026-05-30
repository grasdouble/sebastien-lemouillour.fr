---
id: evaluating-a-rag-system
order: 24
difficulty: advanced
tags: [RAG, evaluation, observability, Ragas, TruLens]
publishedAt: 2099-12-31
updatedAt: 2026-05-31
---

On ne repère pas un RAG fragile pendant la démo. On le repère après la mise en prod, quand un changement d’indexation fait chuter la qualité, qu’un ajustement de prompt ajoute des hallucinations, et que personne ne peut prouver quelle couche a cassé en premier. C’est pour ça que je refuse l’idée d’un score unique pour décider d’une release RAG.

Il faut d’abord découper le problème comme le font [Azure Foundry](https://learn.microsoft.com/en-us/azure/foundry/concepts/evaluation-evaluators/rag-evaluators) et [Bedrock metrics](https://docs.aws.amazon.com/bedrock/latest/userguide/knowledge-base-evaluation-metrics.html) : qualité du retrieval, génération ancrée dans le contexte, utilité de bout en bout. Si tu mélanges tout, l’équipe optimisera la métrique la moins chère à faire monter et ratera celle qui casse le SLA.

Pour les régressions offline, je choisirais d’abord [Ragas faithfulness](https://docs.ragas.io/en/latest/concepts/metrics/available_metrics/faithfulness/) parce que la métrique vérifie directement si la réponse est bien supportée par le contexte récupéré. Ça règle le problème suivant : la plupart des équipes testent seulement des requêtes faciles. Je construirais le dataset à partir des modes d’échec, avec du contenu périmé, des trous de permissions, des chunks quasi dupliqués, du jargon interne, des questions multi-sauts, et des prompts où la bonne réponse est un refus explicite.

Une fois que le dataset devient assez hostile, les captures d’écran ne servent plus à rien. [TruLens tracing](https://www.trulens.org/component_guides/instrumentation/) est le bon choix quand il faut inspecter le contexte récupéré, les étapes intermédiaires et les cibles d’évaluation dans le même flux d’exécution. Je le couple avec [OTel GenAI](https://opentelemetry.io/docs/specs/semconv/gen-ai/) pour standardiser la latence, l’usage de tokens et les spans d’échec au lieu de dépendre de ce que le vendeur du moment expose.

Avant de discuter d’une mise en prod, écris le contrat noir sur blanc :

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

Si tu veux que ce contrat résiste à la pression de la prod, exécute les mêmes évaluations dans la CI. J’utiliserais [DeepEval CI](https://www.confident-ai.com/docs/llm-evaluation/unit-testing-cicd) quand l’équipe veut que les régressions bloquent les merges au lieu de dormir dans un dashboard que personne n’ouvre. L’attribution reste non négociable : les métriques de retrieval appartiennent aux responsables du retrieval, le groundedness appartient à la personne qui modifie prompts ou politiques, et la latence comme le coût appartiennent à la plateforme.

Ma règle est simple : bloque la release si la faithfulness passe sous le seuil prévu, si la p95 de latence casse le SLA, ou si la couverture de traces devient trop faible pour expliquer les incidents. Si un changement n’est pas capable de nommer la métrique qu’il doit améliorer, le seuil qu’il doit préserver et le déclencheur de rollback, il n’est pas prêt.
