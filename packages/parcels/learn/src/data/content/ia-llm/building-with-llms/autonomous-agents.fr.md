---
id: autonomous-agents
order: 20
difficulty: advanced
tags: [agent, autonomy, monitoring, escalation, AutoGen]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

Vous avez donné à un agent le droit de nettoyer des enregistrements obsolètes, et il a vidé la moitié d'une table parce que personne n'avait défini ce qu'obsolète voulait dire. Ce n'est pas un échec amusant de démo. C'est la vraie tête de l'autonomie non bornée en production.

La mauvaise question est : « Jusqu'où peut-on rendre cet agent autonome ? » La bonne est : « Quel est le niveau minimal d'autonomie nécessaire, et quel arrêt dur empêche l'agent de dépasser la frontière ? » Le [guide OpenAI Agents](https://platform.openai.com/docs/guides/agents) insiste sur les contrôles au niveau des outils et les confirmations pour une raison simple. Si une action peut écrire, supprimer, publier ou envoyer, la frontière doit vivre dans l'exécuteur, pas dans le prompt.

J'utilise toujours trois limites : un budget d'actions, un budget de temps, et un seuil d'irréversibilité. Les deux premières contrôlent le coût et la latence. La troisième contrôle le regret. Un agent peut explorer, résumer et proposer beaucoup plus librement qu'il ne peut modifier un état durable.

C'est le genre d'enveloppe que je veux voir autour de chaque appel d'outil :

```python
import time

class AutonomyEnvelope:
    def __init__(self, max_actions: int, max_seconds: int, allow_irreversible: bool):
        self.max_actions = max_actions
        self.deadline = time.time() + max_seconds
        self.allow_irreversible = allow_irreversible
        self.action_count = 0

    def check(self, is_irreversible: bool = False) -> None:
        if self.action_count >= self.max_actions:
            raise RuntimeError("Action budget exhausted")
        if time.time() > self.deadline:
            raise RuntimeError("Time budget exhausted")
        if is_irreversible and not self.allow_irreversible:
            raise PermissionError("Blocked by policy")
        self.action_count += 1
```

L'agent n'a pas le droit de redéfinir ces limites en cours de route. S'il veut plus de budget, il escalade.

L'autre sujet que les équipes sautent trop souvent, c'est la supervision. Les logs racontent ce qui s'est passé après les dégâts. Les moniteurs servent à couper le courant avant. [LangGraph](https://langchain-ai.github.io/langgraph/) rend le checkpointing et l'état persistant suffisamment concrets pour que la détection de boucle cesse d'être un concept flou. Hash chaque couple `(tool_name, input)`, compte les répétitions dans l'état, et tuez l'exécution quand la même action apparaît trois fois sans nouvelle preuve.

L'autonomie a aussi besoin d'une vraie sortie de secours. Je préfère deux chemins d'escalade : une pause douce pour l'ambiguïté, et un arrêt dur pour les actions irréversibles, les échecs répétés ou une accélération des coûts. [AutoGen](https://microsoft.github.io/autogen/) est intéressant à étudier ici parce qu'il traite les conditions de terminaison comme un sujet central, pas comme un détail ajouté à la fin.

Mon seuil est simple : si une tâche ne peut pas se terminer en sécurité dans 50 actions et une seule frontière d'approbation, la tâche est trop grande pour un agent autonome. Découpez la tâche. N'allongez pas la laisse en appelant ça de l'architecture.
