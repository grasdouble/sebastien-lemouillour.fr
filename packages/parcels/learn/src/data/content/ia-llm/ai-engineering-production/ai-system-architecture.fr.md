---
id: ai-system-architecture
order: 22
difficulty: advanced
tags: [LLM, architecture, orchestration, systems]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

Tous les schémas d'architecture IA montrent le happy path : message utilisateur, récupération, modèle, réponse. Personne ne parle de ce qui se passe quand la fenêtre de contexte se remplit au milieu d'une conversation, qu'un tool call reste bloqué et que 10 000 utilisateurs concurrents frappent le même cluster de retrieval. C'est là que l'architecture devient réelle.

L'erreur, c'est de construire le système comme si le modèle était l'application. Ce n'est pas le cas. L'application, c'est la couche de coordination autour de l'état, des outils, des politiques et des fallbacks. Les [patterns GenAI de Martin Fowler](https://martinfowler.com/articles/building-with-genai.html) sont utiles parce qu'ils séparent l'interface, l'orchestration et les capacités métier. J'irais un cran plus loin : l'état de conversation doit rester hors de l'orchestrateur. Des workers stateless se scalent mieux, tombent plus proprement et sont beaucoup plus lisibles pendant un incident.

Il y a quatre composants que je veux voir dessinés séparément. D'abord, une couche d'entrée qui authentifie, rate-limit et tague les requêtes. Ensuite, une couche d'orchestration qui construit le contexte et décide quelles capacités peuvent s'exécuter. Puis des exécuteurs d'outils isolés, avec timeouts et idempotence. Enfin, une couche d'accès modèle, souvent via [LiteLLM](https://docs.litellm.ai/) ou une passerelle fournisseur, pour éviter que le routage des modèles soit câblé dans les flows produit. Si vous auto-hébergez, [vLLM](https://docs.vllm.ai/) appartient à cette couche de serving, pas au code d'orchestration.

Avant que le document d'architecture ne devienne une fiction, imposez le budget de latence dans le design. C'est la forme minimale à laquelle je fais confiance.

```yaml
request_budget_ms: 4000
stages:
  auth_and_routing: 150
  retrieval: 600
  orchestration: 300
  model_inference: 2400
  tool_calls: 400
  output_validation: 150
fallback: cached-answer-or-human
```

Ce budget compte parce que chaque outil supplémentaire ou chaque saut de retrieval vole du temps à l'inférence et augmente le fan-out des pannes. Les frontières de sécurité font aussi partie de l'architecture, pas d'une checklist ajoutée plus tard. Si le modèle peut influencer les paramètres d'outils ou consommer des documents non fiables, les risques décrits par le [Top 10 OWASP LLM](https://owasp.org/www-project-top-10-for-large-language-model-applications/) doivent façonner les interfaces dès le premier jour.

Je préfère les architectures qui se dégradent par couches. Si le retrieval tombe, on rend une réponse plus étroite. Si le modèle premium tombe, on route vers un fallback moins cher pour les tâches peu risquées. Si un outil tombe, on garde un chat utile et explicite sur la limite. Si une seule panne de dépendance fait tomber toute la fonctionnalité, vous avez construit une chaîne, pas un système.

Mon seuil est simple : dès qu'une requête utilisateur peut se brancher sur plus de deux systèmes externes, ajoutez deadlines, circuit breakers et fallbacks avant d'ajouter une capacité de plus.
