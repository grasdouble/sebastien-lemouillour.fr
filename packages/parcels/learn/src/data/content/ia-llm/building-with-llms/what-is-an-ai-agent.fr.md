---
id: what-is-an-ai-agent
order: 17
difficulty: advanced
tags: [LLM, OpenAI, LangChain, agents, orchestration]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

Appeler “agent” n’importe quelle feature de chat semble anodin, jusqu’au jour où l’équipe ops demande un SLA et que personne n’est capable d’expliquer ce que le système a le droit de faire à l’étape sept.

Ma définition est volontairement étroite. Un agent IA, c’est une boucle pilotée par LLM capable d’observer un état, de choisir parmi plusieurs actions, d’utiliser des outils, puis de s’arrêter quand un objectif, un budget ou un garde-fou est atteint. Si le chemin est fixe, ce n’est pas un agent, c’est un workflow. La [vue d’ensemble LangChain](https://python.langchain.com/docs/concepts/agents/) et [OpenAI Agents](https://platform.openai.com/docs/guides/agents) décrivent la même structure de base, et le papier [ReAct](https://arxiv.org/abs/2210.03629) reste la meilleure explication de cette alternance entre raisonnement et action.

Ça n’a de sens que quand l’environnement résiste. Les résultats de recherche changent. Les API tombent. La meilleure action suivante dépend de ce qui vient juste de se passer. Si ton flux ressemble à “classifier, rédiger, renvoyer”, un agent t’achète de la latence, de la variance et une surface d’incident pour aucun bénéfice.

Ce que les équipes sous-estiment, c’est l’exploitation. Un vrai agent n’est pas juste un prompt plus malin. C’est un runtime avec des quotas, des traces, des permissions d’outils, des conditions d’arrêt et un chemin d’escalade humaine. Si tu ne peux pas inspecter chaque étape après un incident, tu n’as pas un agent, tu as une responsabilité juridique avec une belle démo.

Voilà le contrat minimal que je veux voir avant d’appeler quelque chose un agent :

```ts
const supportAgent = {
  goal: 'Resolve tier-1 support tickets without unsafe side effects',
  maxIterations: 6,
  maxWallTimeMs: 12_000,
  allowedTools: ['search_docs', 'lookup_order', 'draft_email'],
  requireApprovalFor: ['send_email', 'issue_refund'],
  onStep(step) {
    traceStep(step); // stocke sortie modèle, args outil, latence, résultat
  },
  onBudgetExceeded(context) {
    handOffToHuman(context);
  },
};
```

À l’échelle, la vraie question d’architecture n’est pas “est-ce que le modèle peut décider de l’étape suivante ?”. En général, oui. La vraie question, c’est si le business accepte le rayon d’explosion quand cette décision est mauvaise. Mauvais usage d’outil, boucle qui s’emballe, écritures non idempotentes, ce ne sont pas des edge cases quand le trafic monte. Ça devient ton mardi normal.

Je recommande les agents seulement quand la tâche est assez ouverte pour bénéficier d’un choix d’action dynamique, et assez rentable pour que cette autonomie compense les nouveaux modes de panne. Si tu ne peux pas nommer le budget, la condition d’arrêt et le format d’audit avant le lancement, appelle ça un workflow et dors mieux.
