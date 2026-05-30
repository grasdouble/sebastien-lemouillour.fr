---
id: agentic-workflows
order: 22
difficulty: advanced
tags: [agent, workflow, deterministic, approval, LangGraph]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

Si votre workflow rate son SLA dès que le modèle part de travers, vous n'avez pas un workflow. Vous avez une démo qui sait sourire.

Les boucles purement agentiques sont séduisantes jusqu'au moment où quelqu'un demande de la prévisibilité. Les pipelines entièrement déterministes sont séduisants jusqu'au moment où l'entrée ne ressemble plus au jeu de tests. Mon choix en production est le même à chaque fois : des arêtes déterministes, des nœuds agentiques. [LangGraph](https://docs.langchain.com/oss/python/langgraph/overview) mérite sa place parce qu'il est pensé pour l'orchestration, la persistance et le human-in-the-loop, pas pour refaire une boucle de chat avec un meilleur emballage. Le graphe gère la séquence, les branches et l'état sauvegardé. Le modèle ne garde que les étapes qui demandent vraiment du jugement.

C'est là que les opérations arrêtent de flotter dans le brouillard. Je veux des SLA, des portes d'approbation et des chemins d'échec dans le code, pas cachés dans de la poésie de prompt. Le [SDK OpenAI Agents](https://openai.github.io/openai-agents-python/) fait le même pari avec une boucle gérée, l'exécution d'outils, des guardrails et des reprises de run. Le [Process Framework de Semantic Kernel](https://learn.microsoft.com/en-us/semantic-kernel/frameworks/process/process-framework) pousse la version Microsoft du même argument : des étapes pilotées par événements, un contrôle répétable, et de l'auditabilité autour de processus enrichis par l'IA.

C'est le type d'enveloppe que je veux autour d'un nœud avant qu'un LLM touche au graphe :

```python
import time
from functools import wraps

def with_sla(timeout_seconds: float):
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            start = time.monotonic()
            result = fn(*args, **kwargs)
            elapsed = time.monotonic() - start
            if elapsed > timeout_seconds:
                metrics.record("sla_breach", {"node": fn.__name__, "elapsed": elapsed})
            return result
        return wrapper
    return decorator

@with_sla(timeout_seconds=30.0)
def classify_document(state: WorkflowState) -> WorkflowState:
    label = llm.classify(state.document_text)
    return state.with_update(label=label)
```

Ce qui compte ici, c'est le contrat. Pas de logique de branchement dans le nœud, pas de retries planqués, pas de décision d'approbation enfouie dans le prompt. Le nœud renvoie un résultat. Le workflow garde le contrôle du flux. Si ça vous paraît rigide, tant mieux. La rigidité évite qu'un incident à 3 heures du matin se transforme en danse contemporaine.

La politique de retry est souvent l'endroit où les équipes commencent à se raconter des histoires. Un timeout peut mériter une deuxième tentative. Un échec de validation de schéma mérite souvent une branche d'erreur, pas une seconde prière. La [persistance LangGraph](https://docs.langchain.com/oss/python/langgraph/persistence) aide justement parce que les checkpoints permettent de reprendre depuis un état sauvegardé au lieu de tout rejouer en appelant ça de la résilience.

Les portes d'approbation doivent être de vrais arrêts, pas des suggestions polies. Le [HITL OpenAI](https://openai.github.io/openai-agents-python/human_in_the_loop/) met l'exécution en pause jusqu'à ce qu'une personne approuve ou rejette un appel d'outil sensible, puis repart depuis un état de run sérialisé. C'est le bon modèle mental. Persistez l'état, notifiez de façon asynchrone, reprenez sur signal explicite, et auto-rejetez au timeout si l'action peut casser quelque chose de coûteux.

Gardez une règle brutale : si votre latence p95 dépasse de plus de 20 % le SLA du workflow, vous avez probablement empilé trop de nœuds LLM séquentiels. Coupez-en ou parallélisez-les avant d'ajouter un autre agent. Et si vous n'avez pas besoin d'approbations, de persistance ou de reprise sur échec, oubliez le graphe. Un simple appel de fonction coûte moins cher et vous ridiculise moins.

## Resources

- [Tools](https://openai.github.io/openai-agents-python/tools/)
- [Interrupts](https://docs.langchain.com/oss/python/langgraph/interrupts)
