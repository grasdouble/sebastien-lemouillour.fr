---
id: what-is-an-ai-agent
order: 17
difficulty: advanced
tags: [agents, llm]
publishedAt: 2026-12-31
updatedAt: 2026-05-31
---

Appeler “agent” n’importe quelle feature de chat semble anodin, jusqu’au jour où l’équipe ops demande un SLA et que personne n’est capable d’expliquer ce que le système a le droit de faire à l’étape sept.

Ma définition est volontairement étroite. Un agent IA, c’est une boucle pilotée par le modèle qui observe un état, choisit une action, appelle des outils, puis continue tant qu’aucune règle d’arrêt ne coupe le jeu. Le guide [Anthropic](https://www.anthropic.com/engineering/building-effective-agents) pose la frontière que j’utilise en pratique : un chemin codé d’avance, c’est un workflow ; un choix dynamique d’outils, c’est un comportement agentique. La doc [OpenAI sur l’exécution](https://platform.openai.com/docs/guides/agents/running-agents) décrit exactement la même boucle : appel modèle, inspection de la sortie, exécution d’outils ou handoff, arrêt seulement quand un vrai point de sortie est atteint.

Ça n’a de sens que quand l’environnement résiste. Les résultats de recherche changent. Les API tombent. La meilleure action suivante dépend de ce qui vient juste de se passer. Si ton flux ressemble à “classifier, rédiger, renvoyer”, un agent t’achète de la latence, de la variance et une surface d’incident pour aucun bénéfice.

Ce que les équipes sous-estiment, c'est l'exploitation. Un vrai agent n'est pas juste un prompt plus malin. C'est un runtime avec des quotas, des traces, des permissions d'outils, des conditions d'arrêt et un chemin d'escalade humaine. Le guide [OpenAI sur l'observabilité](https://platform.openai.com/docs/guides/agents/integrations-observability) traite les traces comme une brique de base, et le guide [OpenAI sur les garde-fous](https://platform.openai.com/docs/guides/agents/guardrails-approvals) dit noir sur blanc que les actions risquées doivent pouvoir se mettre en pause pour validation ou approbation humaine. Si tu ne peux pas inspecter chaque étape après un incident, tu n'as pas un agent, tu as une responsabilité juridique avec une belle démo.

Si ça te paraît encore flou, voilà le contrat minimal que je veux voir avant d’appeler quelque chose un agent :

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

À l’échelle, la vraie question d’architecture n’est pas “est-ce que le modèle peut décider de l’étape suivante ?”. En général, oui. La vraie question, c’est si le business accepte le rayon d’explosion quand cette décision est mauvaise. Mauvais usage d’outil, boucle qui s’emballe, écritures non idempotentes : quand le trafic monte, ça arrête d’être des edge cases. Ça devient ton mardi normal.

Ma règle est simple : si le job tient en moins de trois étapes déterministes, ou si le business ne peut pas tolérer une pause d’approbation, ne livre pas un agent. Livre un workflow et laisse ton pager tranquille.
