---
id: ai-application-scalability
order: 23
difficulty: advanced
tags: [LLM, scalability, vLLM, LiteLLM]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

La démo a tenu cinquante utilisateurs et tout le monde s'est détendu. Puis un client a collé un historique de tickets énorme, un autre a ouvert cinq onglets, et d'un coup votre temps d'attente dépasse le temps d'inférence. Les problèmes de scalabilité IA ne commencent presque jamais par le CPU. Ils commencent par trop de travail par requête.

À l'échelle, il n'y a que quatre leviers qui comptent : réduire le prompt, couper la récupération inutile, batcher l'inférence et router les requêtes selon le SLA. Ajouter des machines à un pipeline de prompts mal conçu ne fait qu'acheter une panne plus chère. C'est pour ça que [vLLM](https://docs.vllm.ai/) compte. Son modèle de serving est pensé pour l'inférence à haut débit, et des mécanismes comme le continuous batching changent l'économie du trafic concurrent. La couche de passerelle compte tout autant. Avec [LiteLLM](https://docs.litellm.ai/), les règles de routage et de fallback vivent hors du code produit, ce qui évite qu'un pic de trafic se transforme en réécriture.

Je scale les systèmes IA dans cet ordre. D'abord, supprimer les tokens inutiles. Ensuite, séparer le trafic selon la criticité métier. Puis batcher ou mettre en cache agressivement. Enfin, seulement après, ajouter de la capacité. La plupart des équipes commencent à l'étape quatre parce qu'acheter de la capacité paraît plus simple que discuter avec les propriétaires des prompts.

Voilà le genre de politique de routage que je veux avant que le trafic devienne sérieux.

```yaml
model_list:
  - model_name: fast-lane
    litellm_params:
      model: gpt-4.1-mini
  - model_name: quality-lane
    litellm_params:
      model: gpt-4.1

router_settings:
  routing_strategy: usage-based-routing
  fallbacks:
    - fast-lane: ['quality-lane']
```

Cela ne fonctionne que si le reste de l'architecture coopère. Les [patterns de Martin Fowler](https://martinfowler.com/articles/building-with-genai.html) rappellent utilement que l'orchestration, la mémoire et la logique métier ne doivent pas s'écraser dans un seul service. Sinon, impossible de les scaler indépendamment. Il faut aussi un vrai backpressure : limites de file, quotas par tenant, budgets de timeout, et annulation quand le client disparaît. Continuer à travailler sur des requêtes abandonnées, c'est la manière la plus rapide de brûler du budget tout en ratant ses objectifs de latence.

N'obsédez pas sur le QPS brut sans regarder les tokens par seconde, la croissance des prompts et le fan-out des outils. Ce sont presque toujours les vrais goulets. Ma règle est sèche : si votre P95 rate la cible alors que l'infrastructure de serving est tranquillement sous-utilisée, le problème vient du design de requête, pas du hardware.
