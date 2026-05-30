---
id: ai-cost-optimization
order: 24
difficulty: advanced
tags: [LLM, cost, LiteLLM, optimization]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

À cent utilisateurs, le coût reste une curiosité de dashboard. À cent mille, la facture modèle devient la ligne que tout le monde cite en réunion budget avant même de parler des effectifs engineering. L'optimisation des coûts IA consiste surtout à refuser le gaspillage tôt, pas à demander pardon à la finance plus tard.

L'erreur évidente, c'est de suivre la dépense totale au lieu du coût par tâche réussie. Si un modèle moins cher produit plus de retries, plus d'escalades ou plus d'abandons, vous n'avez rien économisé. Vous avez juste déplacé le coût vers un endroit moins visible. Commencez par l'économie unitaire. Suivez les tokens d'entrée, les tokens de sortie, le taux de cache hit, le taux de fallback et le coût par réponse acceptée. Des références fournisseur comme [OpenAI pricing](https://openai.com/api/pricing/) donnent les chiffres bruts, mais l'histoire opérationnelle vient de vos propres traces. Si vous ne séparez pas les échecs coûteux des succès bon marché, chaque revue de coût finit en folklore.

J'aime [LiteLLM](https://docs.litellm.ai/) pour cette couche, parce que le routage des modèles et le reporting de dépense doivent être centralisés. Dès que la politique de coût vit dans une seule passerelle, les équipes produit arrêtent de câbler des modèles premium partout. Si l'auto-hébergement devient pertinent, [vLLM](https://docs.vllm.ai/) change de nouveau l'équation, surtout quand le débit est assez prévisible pour justifier de la capacité réservée. C'est une décision d'infrastructure, pas une crise d'identité de développeur.

Avant de discuter fine-tuning ou remises négociées avec un fournisseur, rendez la politique exécutable.

```yaml
task: support-answer
max_input_tokens: 6000
preferred_model: gpt-4.1-mini
upgrade_if:
  - low_confidence
  - vip_customer
cache_ttl_seconds: 900
human_handoff_if_cost_usd_gt: 0.08
```

Cette politique force enfin la bonne conversation. Quelles requêtes méritent un raisonnement premium ? Lesquelles peuvent être résumées d'abord ? Lesquelles devraient être servies depuis un retrieval mis en cache plutôt que via une génération neuve ? Le coût baisse le plus vite quand vous raccourcissez les prompts, compressez l'historique et arrêtez de générer des tokens que personne ne lit. Même des règles fournisseur comme les [usage policies](https://openai.com/policies/usage-policies) comptent ici, parce que des flux bloqués ou non conformes consomment quand même des tokens si vous validez trop tard.

Le piège, c'est d'optimiser le mauvais horizon. Des downgrades agressifs peuvent réduire la dépense ce mois-ci et détruire la rétention le mois suivant. Mon seuil est simple : si vous ne revoyez pas chaque semaine le coût par tâche réussie, avec les changements de routage et de prompt attachés à la même métrique, vous n'optimisez pas les coûts, vous devinez avec des factures.
