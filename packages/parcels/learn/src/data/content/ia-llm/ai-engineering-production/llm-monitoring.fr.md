---
id: llm-monitoring
order: 16
difficulty: intermediate
tags: [LLM, monitoring, observability, OpenTelemetry, Prometheus]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

Tes dashboards sont verts, le CPU est calme, et les utilisateurs disent quand même que l'assistant est devenu lent, cher, et bizarrement évasif. C'est le mode de panne classique des systèmes LLM : l'infra a l'air saine pendant que la qualité produit dérive sous tes yeux.

Le monitoring, c'est le moment où tu arrêtes de regarder une requête à la fois pour observer la forme du système dans le temps. Les logs expliquent un incident. Les traces expliquent un parcours. Le monitoring te dit si le trafic d'aujourd'hui devient plus coûteux, plus lent, ou moins utile que celui d'hier.

La plupart des équipes s'arrêtent à la latence et au volume de tokens. Ce n'est pas suffisant. Je veux un petit ensemble de métriques qui reflètent la vraie douleur utilisateur : latence bout en bout en p95, coût par tâche réussie, taux de refus, taux de fallback, taux d'erreur des outils, taux de hit du retrieval, et un proxy de qualité comme un judge pass rate ou un score de revue humaine. Si tu surveilles seulement la vitesse, tu rates le problème des réponses polies mais mauvaises.

La plomberie peut rester ennuyeuse. [OpenTelemetry metrics](https://opentelemetry.io/docs/concepts/signals/metrics/) te donne le bon vocabulaire, et les [histogrammes Prometheus](https://prometheus.io/docs/practices/histograms/) restent une base solide pour penser les buckets de latence et l'alerte. Si tu veux une vue plus native LLM par-dessus, [Langfuse](https://langfuse.com/docs) aide bien, mais je préfère garder les alertes principales dans la même stack de monitoring que le reste du produit.

La vraie difficulté, c'est de choisir des métriques qui mènent à une action. Le total de tokens intéresse la finance, mais le coût par tâche réussie change les priorités d'ingénierie. Un volume brut d'erreurs d'outils est bruyant, alors qu'un taux d'erreur par nom d'outil te montre quelle dépendance empoisonne l'agent. Le monitoring doit produire des décisions, pas des courbes décoratives.

Je sépare aussi les alertes qui doivent réveiller quelqu'un des tendances qui méritent juste une revue. Une hausse de coût de 5% mérite peut-être un point hebdomadaire. Une chute de 12% du judge pass rate après un changement de prompt mérite un rollback le jour même. Si tout page, plus personne ne croit au pager.

J'aime écrire les premières règles d'alerte avant même que le produit soit entièrement poli, parce que ça force l'équipe à définir ce que veut dire "sain".

```yaml
alerts:
  - name: llm-latency-p95
    query: p95(agent_request_latency_ms) > 12000
    action: page-oncall

  - name: llm-cost-per-task
    query: avg_over_time(agent_cost_per_success_usd[1h]) > 0.35
    action: notify-slack

  - name: llm-judge-pass-rate
    query: avg_over_time(agent_judge_pass_rate[30m]) < 0.82
    action: rollback-last-prompt

  - name: tool-error-rate
    query: rate(agent_tool_errors_total[15m]) / rate(agent_tool_calls_total[15m]) > 0.08
    action: page-owner
```

Ma règle : si tu n'as pas décidé quelle métrique doit réveiller quelqu'un et laquelle doit seulement déclencher une revue, alors tu ne monitors pas encore un système LLM, tu collectionnes des souvenirs.
