---
id: autonomous-agents
order: 20
difficulty: advanced
tags: [agents, observability]
publishedAt: 2026-12-31
updatedAt: 2026-05-31
---

Vous avez donné à un agent le droit de nettoyer des enregistrements obsolètes, et il a vidé la moitié d'une table parce que personne n'avait défini ce qu'obsolète voulait dire. Ce n'est pas un échec amusant de démo. C'est à ça que ressemble l'autonomie non bornée en production.

La mauvaise question est : « Jusqu'où peut-on rendre cet agent autonome ? » La bonne est : « Quel est le niveau minimal d'autonomie nécessaire, et quel arrêt dur empêche l'agent de dépasser la frontière ? » Les [docs HITL](https://openai.github.io/openai-agents-python/human_in_the_loop/) insistent sur les règles d'approbation au niveau des outils et sur les interruptions pour une raison simple. Si une action peut écrire, supprimer, publier ou envoyer, la frontière doit vivre dans l'exécuteur, pas dans le prompt.

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

L'autre sujet que les équipes sautent trop souvent, c'est la supervision. Les logs racontent ce qui s'est passé après les dégâts. Les moniteurs servent à couper le courant avant. Les [docs persistence](https://docs.langchain.com/oss/python/langgraph/persistence) et les [docs interrupts](https://docs.langchain.com/oss/python/langgraph/interrupts) de LangGraph comptent vraiment ici : les checkpoints vous donnent un état durable, et les interruptions un point de pause propre pour revue humaine. La détection de boucle reste votre problème, mais une fois que le runtime persiste l'état à chaque étape, hasher `(tool_name, input)` et tuer l'exécution après trois appels identiques sans nouvelle preuve cesse d'être un vague ticket « on verra plus tard ».

L'autonomie a aussi besoin d'une vraie sortie de secours. Je préfère deux chemins d'escalade : une pause douce pour l'ambiguïté, et un arrêt dur pour les actions irréversibles, les échecs répétés ou une accélération des coûts. [AutoGen](https://microsoft.github.io/autogen/stable/user-guide/agentchat-user-guide/tutorial/termination.html) vaut le détour ici parce qu'il transforme les conditions de terminaison en vraie surface d'API, pas en TODO perdu dans la glue d'orchestration.

Mon seuil est simple : si une tâche ne peut pas se terminer en sécurité dans 50 actions et une seule frontière d'approbation, la tâche est trop grande pour un agent autonome. Découpez la tâche. N'allongez pas la laisse en appelant ça de l'architecture.
