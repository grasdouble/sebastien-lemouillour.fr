---
id: task-planning
order: 19
difficulty: advanced
tags: [agent, planning, orchestration, budget, ReAct]
publishedAt: 2099-12-31
updatedAt: 2099-12-31
---

Votre agent a terminé la tâche. Enfin, plus ou moins. Quarante-sept appels d'outils, deux boucles, et un résultat crédible jusqu'au moment où quelqu'un vérifie. On accuse souvent le modèle. La plupart du temps, le vrai problème est ailleurs : il n'y a pas de plan.

Le mécanisme de casse est simple. Quand un agent commence à agir sans décomposition, chaque étape suivante hérite du désordre de la précédente. Le papier [ReAct](https://arxiv.org/abs/2210.03629) fonctionne parce qu'il garde le raisonnement et l'action ancrés dans un objectif explicite et limité. Si vous jetez un gros objectif à un agent en le laissant improviser, vous obtenez de la dérive, du travail dupliqué et une facture de tokens sans stratégie de reprise propre.

Je ne laisse pas un agent toucher aux outils tant qu'il n'a pas émis un plan que je peux valider. Ce plan doit être un graphe, pas un paragraphe : sous-tâches, dépendances, critères de fin, limites de retry et budget de tokens par nœud. Le [guide OpenAI Agents](https://platform.openai.com/docs/guides/agents) vous donne des primitives d'exécution, mais la partie que presque tous les tutos évitent est la propriété du budget. Ce n'est pas à l'agent de décider combien une tâche a le droit de coûter.

C'est ce niveau de structure que je veux verrouiller avant le premier appel d'outil :

```python
from pydantic import BaseModel
from typing import List, Optional

class Subtask(BaseModel):
    id: str
    goal: str
    depends_on: List[str]
    done_when: str
    tool_hint: Optional[str] = None
    max_tokens: int
    max_retries: int = 2

class ExecutionPlan(BaseModel):
    objective: str
    subtasks: List[Subtask]
    total_token_budget: int
```

Si `sum(subtask.max_tokens)` dépasse `total_token_budget`, rejet du plan. Si une sous-tâche n'a pas de `done_when`, rejet du plan. Si deux sous-tâches se dépendent mutuellement, rejet du plan. La planification n'est pas un contrôle d'ambiance. C'est du contrôle d'admission.

Ensuite, exécutez le graphe avec un état, pas avec une transcription géante qui grossit sans fin. [LangGraph](https://langchain-ai.github.io/langgraph/) est utile ici parce qu'il force à penser en nœuds, arêtes et checkpoints plutôt qu'en boucle infinie. Persistez le résultat de chaque nœud, compressez le signal utile, et ne passez à la suite que ce qui compte. La sortie brute d'un outil ne doit pas traîner derrière l'agent comme une valise.

Le replanning est parfois nécessaire, mais pas toutes les trois étapes. Si un nœud découvre une dépendance manquante ou dépasse l'estimation de scope de 30 %, on pause et on replanifie. Si vous replannifiez sans arrêt, votre objectif initial est mal spécifié et aucun prompt malin ne corrigera ça.

Ma règle est sèche : si votre graphe dépasse régulièrement 12 nœuds, ou si la phase de staging montre plus de 20 % de replans, arrêtez d'essayer de rendre l'agent plus malin et rendez la tâche plus petite.
