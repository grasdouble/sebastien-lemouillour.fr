---
id: ai-cost-optimization
order: 24
difficulty: advanced
tags: [production, llm]
publishedAt: 2026-12-31
updatedAt: 2026-05-31
---

Si la finance cite votre facture modèle avant que quelqu'un parle de latence, vous êtes déjà en retard. L'optimisation des coûts commence quand la même feature passe en staging puis explose en production, parce que chaque retry, fallback et fenêtre de contexte trop large s'additionne en silence.

La première erreur consiste à suivre la dépense totale au lieu du coût par tâche réussie. Je ne validerais aucun changement de routage sans le même dashboard pour le taux de réponse acceptée, le taux de retry, le taux de fallback, le taux de cache hit et le taux de handoff humain. Le prompt caching côté fournisseur ne paie que si le préfixe reste stable et répété, et OpenAI explique dans [Prompt Caching](https://platform.openai.com/docs/guides/prompt-caching) que le chemin moins cher dépend d'une correspondance exacte du préfixe. Si vous ne pouvez pas isoler les requêtes chères qui finissent quand même en échec, vous n'optimisez rien.

Une fois les métriques honnêtes, centralisez la politique. Je mettrais le routage et le contrôle de dépense derrière une seule passerelle, pas dans le code produit. [LiteLLM routing](https://docs.litellm.ai/docs/routing) fournit load balancing, retries, fallbacks et stratégies fondées sur le coût au même endroit, tandis que [LiteLLM cost tracking](https://docs.litellm.ai/docs/proxy/cost_tracking) expose le suivi de dépense par clé, utilisateur et équipe. Ce montage fait deux choses utiles : il empêche les équipes de câbler des modèles premium en dur, et il vous laisse changer la politique sans redéployer cinq services.

Si le trafic est prévisible et assez élevé, les API hébergées cessent d'être le choix évident. [vLLM](https://docs.vllm.ai/en/latest/) est conçu pour du serving à haut débit avec continuous batching, prefix caching et quantization. Je ne prendrais cette voie que si l'utilisation reste assez stable pour garder les GPU occupés, parce que l'auto-hébergement sans taux d'utilisation élevé, c'est juste un hobby hors de prix.

Avant que quelqu'un demande une remise fournisseur, rendez la politique de coût exécutable.

```yaml
task: support-answer
max_input_tokens: 6000
preferred_tier: small
upgrade_if:
  - low_confidence
  - premium_account
cache_strategy: exact_prefix
batch_if_latency_budget_seconds_gte: 300
human_handoff_if_cost_usd_gt: 0.08
```

Ce genre de politique est ennuyeux, donc efficace. Elle force les vraies questions : quels flux méritent un raisonnement premium, lesquels doivent réutiliser des préfixes mis en cache, et lesquels peuvent attendre dans une file asynchrone. Pour les jobs offline, je choisirais la [Batch API](https://platform.openai.com/docs/guides/batch) avant de retoucher le prompt, parce qu'OpenAI annonce 50 % de remise et un contrat clair : traitement asynchrone avec un délai maximal de 24 heures. Si votre revue hebdomadaire ne sépare pas le trafic interactif, le trafic batchable et le trafic auto-hébergé, laissez tomber les optimisations sophistiquées jusqu'à ce que cette séparation existe.
