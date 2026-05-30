---
id: agentic-workflows
order: 22
difficulty: advanced
tags: [agent, workflow, deterministic, approval, LangGraph]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

Si votre workflow rate son SLA dès que le modèle a une mauvaise journée, vous n'avez pas un workflow. Vous avez une boucle polie avec un joli nom.

Les boucles purement agentiques sont flexibles, mais très mauvaises pour la prévisibilité. Les pipelines entièrement déterministes sont fiables, mais cassent dès qu'une entrée sort de la matrice de tests. La bonne réponse en production est hybride : des arêtes déterministes, des nœuds agentiques. [LangGraph](https://langchain-ai.github.io/langgraph/) est utile parce qu'il force cette séparation. Le graphe décide de la séquence, des branches, de la persistance et des retries. Le modèle ne gère que les quelques étapes qui demandent vraiment du jugement.

Cette séparation compte pour les opérations. Je veux des SLA, des portes d'approbation, et des branches d'erreur définis en code, pas cachés dans un paragraphe de prompt. Le [guide OpenAI Agents](https://platform.openai.com/docs/guides/agents) aide sur l'exécution d'outils et les confirmations, mais la leçon la plus importante est architecturale : l'agent occupe un emplacement borné dans le workflow, il ne doit pas avaler le workflow entier. [Semantic Kernel](https://learn.microsoft.com/en-us/semantic-kernel/overview/) pousse la même idée sous un autre angle, en mélangeant orchestration déterministe et étapes pilotées par l'IA.

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

Regardez ce qui manque : pas de logique de branchement dans le nœud, pas de retries cachés, pas de décision d'approbation enfouie dans le prompt. Le nœud produit un résultat. Le graphe décide de la suite.

La politique de retry est un autre endroit où les équipes deviennent paresseuses. Un timeout mérite un retry. Un échec de validation de schéma mérite souvent une branche d'erreur. Retenter trois fois une sortie mal formée, ce n'est pas de la résilience. C'est de l'espoir facturé.

Les portes d'approbation doivent aussi être de vraies pauses, pas des suggestions élégantes. Persistez l'état du workflow, notifiez l'approbateur de façon asynchrone, reprenez seulement sur signal explicite, et auto-rejetez au timeout. Tout modèle plus mou devient un cauchemar d'audit le jour où le workflow modifie le mauvais système.

Gardez un seuil brutal : si votre latence p95 bout en bout dépasse de plus de 20 % le SLA du workflow, vous avez trop de nœuds LLM séquentiels. Supprimez-en ou parallélisez-les avant d'ajouter un autre agent.
