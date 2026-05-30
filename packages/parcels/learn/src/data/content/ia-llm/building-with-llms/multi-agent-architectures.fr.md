---
id: multi-agent-architectures
order: 21
difficulty: advanced
tags: [agent, architecture, orchestration, observability, LangGraph]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

Beaucoup d'équipes prennent un agent moyen, le coupent en cinq agents moyens, puis appellent ça une plateforme. En pratique, elles ont surtout fabriqué plus de latence, plus de coordination, et une histoire de débogage que personne ne veut posséder.

Une architecture multi-agents ne mérite son coût que dans trois cas : certaines branches peuvent vraiment s'exécuter en parallèle, les spécialisations nécessaires se contredisent dans un seul system prompt, ou vous avez besoin d'une isolation d'outils stricte entre rôles. Si rien de tout ça n'est vrai, gardez un seul agent et corrigez son plan. [AutoGen](https://microsoft.github.io/autogen/) et [LangGraph](https://langchain-ai.github.io/langgraph/) rendent l'orchestration multi-agents possible, mais aucun des deux ne vous protège contre du trafic interne inutile.

C'est l'orchestrateur qui fait dérailler la plupart des designs. Je ne veux pas qu'il raisonne sur le problème métier. Je veux qu'il route du travail structuré vers des spécialistes et agrège des résultats typés. Si le prompt de l'orchestrateur contient du jugement métier, la logique est au mauvais endroit.

Voici le niveau d'orchestration que j'accepte en production :

```python
from typing import Callable

AGENTS: dict[str, Callable] = {
    "security": security_agent,
    "pricing": pricing_agent,
    "docs": docs_agent,
}

def dispatch(subtask: Subtask) -> Result:
    handler = AGENTS.get(subtask.tool_hint)
    if handler is None:
        raise ValueError(f"No agent for {subtask.tool_hint}")
    return handler(subtask)
```

Aucun fallback vers une supposition. Aucun reroutage « best effort ». Si le plan dit qu'un spécialiste pricing est nécessaire et qu'il n'existe pas, on échoue bruyamment et on corrige le plan.

L'observabilité est le sujet que les tutos balaient du revers de la main, et c'est le premier qui fait mal en production. Chaque message qui traverse une frontière d'agent devrait porter un `task_id`, un émetteur, un destinataire, un volume de tokens, une latence, et un statut de sortie. Sinon, quand une exécution casse, vous reconstruisez le comportement à partir de logs partiels et de chance. La même préoccupation apparaît aussi dans [Semantic Kernel](https://learn.microsoft.com/en-us/semantic-kernel/overview/) : composer est utile seulement si l'on peut tracer.

Les maths sont têtues. Un chemin à trois agents avec 95 % de fiabilité par saut vous laisse environ 86 % de fiabilité bout en bout avant même les retries. Ajoutez des validations humaines, de la variance réseau, ou des appels d'outils, et le chiffre se dégrade très vite.

Ma règle est monotone mais efficace : si vous ne pouvez pas montrer du parallélisme, une spécialisation contradictoire, ou une frontière de sécurité, vous n'avez pas besoin de plusieurs agents. Vous avez besoin d'un meilleur design mono-agent.
