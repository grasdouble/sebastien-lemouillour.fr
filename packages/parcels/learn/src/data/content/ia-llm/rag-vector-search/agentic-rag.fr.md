---
id: agentic-rag
order: 19
difficulty: advanced
tags: [RAG, agents, orchestration, LlamaIndex]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

Ton retriever gère les questions évidentes, puis un utilisateur demande une comparaison entre trois manuels, un changelog et une note de support cachée dans un autre système. La réponse se casse la figure, pas parce que les embeddings sont mauvais, mais parce qu’un seul passage retrieve-then-generate a la mauvaise forme pour ce type de demande.

C’est là que le RAG agentique devient utile. Je l’utilise quand le système doit comprendre qu’une seule requête ne suffit pas, découper le problème en étapes de recherche, choisir le bon outil, puis vérifier si la preuve récupérée est réellement complète. C’est précisément l’intérêt des [agents LlamaIndex](https://docs.llamaindex.ai/en/stable/use_cases/agents/) : pas coller une couche “intelligente” pour la démo, mais donner au pipeline un moyen de router, planifier et se rattraper quand le premier essai est faible.

Je ne sortirais pas ça pour une FAQ documentaire, un bot de help center, ou n’importe quel use case avec une SLA serrée et surtout des questions mono-saut. Dans ces cas-là, un meilleur chunking, des filtres de métadonnées, une recherche hybride et un reranker coûtent moins cher et restent plus prévisibles. Le RAG agentique n’a de sens que quand la variété des questions est assez large pour rendre les parcours de retrieval codés en dur insuffisants.

Ce que la plupart des tutoriels évitent, c’est le sujet qui fait mal : le contrôle des coûts. Chaque étape de planification et chaque appel d’outil multiplient la latence, la facture et la surface de panne. Si tu ne peux pas expliquer le nombre maximal d’étapes, le comportement de repli et l’observabilité par étape, tu n’as pas une architecture, tu as une démo. Le tracing compte autant que le planner. [TruLens](https://www.trulens.org/) est utile ici parce qu’il traite le contexte récupéré, les appels d’outil et le flux d’exécution comme des objets d’évaluation à part entière, au lieu de tout cacher derrière un score final.

Avant de mettre un système comme ça en prod, je veux un contrat qui ressemble à ça :

```yaml
planner:
  max_steps: 4
  stop_if_confidence_below: 0.55
retrieval_tools:
  - semantic_search
  - keyword_search
  - sql_lookup
guards:
  max_total_retrieved_chunks: 18
  require_citations: true
  fallback: 'answer_unknown'
observability:
  trace_query_plan: true
  trace_tool_arguments: true
  trace_document_ids: true
```

Ensuite, je lui mets une vraie pression de régression en CI. [DeepEval](https://docs.confident-ai.com/) est un bon choix quand tu veux exécuter les evals agent ou RAG comme des tests, parce que ça force l’équipe à détecter les explosions d’étapes, les mauvais choix d’outils et les régressions de groundedness avant les utilisateurs.

Ma règle tient en une phrase : si un retriever en un seul passage avec reranking répond à au moins 85 % des vraies questions dans la SLA, reste là. Ajoute du RAG agentique seulement quand les échecs de retrieval multi-étapes sont assez fréquents pour justifier la latence, le tracing et la maintenance supplémentaires.
