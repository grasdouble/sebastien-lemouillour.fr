---
id: llm-monitoring
order: 16
difficulty: intermediate
tags: [observability, llm]
publishedAt: 2026-05-31
updatedAt: 2026-05-31
---

Tes dashboards sont verts, le CPU est calme, et les utilisateurs disent quand même que l'assistant est devenu plus lent, plus cher, et moins utile. Je me suis déjà fait piéger par ce décalage : l'infra avait l'air propre pendant que le produit dérivait en pleine vue.

C'est pour ça que je pars de la douleur produit, pas de la santé des machines. [OpenTelemetry metrics](https://opentelemetry.io/docs/concepts/signals/metrics/) te donne le vocabulaire de base pour les compteurs, gauges et histogrammes, et les [conventions sémantiques GenAI](https://opentelemetry.io/docs/specs/semconv/gen-ai/) donnent un bon point de départ pour les spans et métriques LLM, avec une nuance importante : elles sont encore marquées Development, donc je ne traiterais pas chaque nom comme un contrat figé.

À partir de là, je garde le premier dashboard petit : latence bout en bout en p95, coût par tâche réussie, taux de refus, taux de fallback, taux d'erreur des outils par nom d'outil, taux de hit du retrieval, et un proxy de qualité comme un judge pass rate ou un score de revue humaine. Si tu regardes seulement la latence et le volume de tokens, tu rates le problème des réponses polies mais fausses.

La latence est souvent l'endroit où les équipes font leur premier mauvais arbitrage. Les [histogrammes Prometheus](https://prometheus.io/docs/practices/histograms/) restent le bon modèle mental pour des distributions de latence agrégables, et Prometheus recommande maintenant les native histograms quand ta stack les supporte. Pour la couche plus spécifique aux LLM, j'ajouterais [Langfuse observability](https://langfuse.com/docs/observability/overview) pour les traces et [Langfuse evaluation](https://langfuse.com/docs/evaluation/overview) pour les contrôles qualité en ligne, mais je garderais quand même les alertes de paging dans la même stack de monitoring que le reste du produit.

Le plus piégeux, c'est de choisir des métriques qui forcent une décision. Je n'alerte pas sur le volume brut de tokens. J'alerte sur le coût par tâche réussie, parce que c'est ce chiffre qui fait changer de modèle ou réduit la portée d'un prompt. Je ne page pas non plus sur le total d'échecs outil. Je page sur le taux d'erreur par outil, parce que c'est ce qui me dit quelle dépendance empoisonne l'agent. Si le throttling fournisseur fait partie de tes pannes habituelles, ajoute tôt la latence de retry et le taux de fallback, sinon tu vas confondre un problème de rate limit avec une régression de qualité modèle.

Voici le premier jeu de règles que je mettrais en prod. Les seuils ci-dessous sont des placeholders, donc calibre-les sur ta baseline après une ou deux semaines de trafic réel.

```yaml
alerts:
  - name: llm-latency-p95
    query: p95(agent_request_latency_ms) > 12000
    action: page-oncall
    # Page seulement quand l'attente utilisateur devient vraiment visible.

  - name: llm-cost-per-task
    query: avg_over_time(agent_cost_per_success_usd[1h]) > 0.35
    action: notify-slack
    # Commence en revue hebdo, puis resserre quand le pricing se stabilise.

  - name: llm-judge-pass-rate
    query: avg_over_time(agent_judge_pass_rate[30m]) < 0.82
    action: rollback-last-prompt
    # Ça attrape les chutes de qualité que les graphes de latence ne montrent jamais.

  - name: tool-error-rate
    query: rate(agent_tool_errors_total[15m]) / rate(agent_tool_calls_total[15m]) > 0.08
    action: page-owner
    # Garde ce calcul découpé par nom d'outil, pas dans un seau global.
```

Ma règle est simple : si une métrique ne peut pas déclencher un page, un rollback, ou une décision hebdomadaire sur les coûts, elle n'a rien à faire sur le premier dashboard.
