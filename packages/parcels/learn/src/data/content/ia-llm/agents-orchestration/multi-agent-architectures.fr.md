---
id: multi-agent-architectures
order: 21
difficulty: advanced
tags: [agents, observability]
publishedAt: 2026-12-31
updatedAt: 2026-05-31
---

Quand une requête utilisateur rebondit entre un planner, un chercheur, un reviewer et un formatter, votre p95 explose et plus personne n'est capable d'expliquer quel saut a vraiment cassé. Une architecture multi-agents, c'est souvent ce genre de douleur qu'on s'inflige tout seul.

Je ne sors plusieurs agents que si je peux justifier la taxe de trois façons : un vrai travail parallèle, une frontière d'isolation dure, ou un comportement spécialiste que je refuse de mélanger dans le même runtime. [AutoGen](https://microsoft.github.io/autogen/stable/) est conçu pour des applications conversationnelles mono-agent et multi-agents, et [LangGraph](https://docs.langchain.com/oss/python/langgraph/overview) assume clairement son rôle de runtime d'orchestration pour des agents stateful et de longue durée. Les outils sont solides, l'avertissement reste le même : si vous n'avez pas besoin d'orchestration, vous payez juste des sauts en plus.

C'est l'orchestrateur qui transforme l'architecture en théâtre. Je ne veux pas qu'il fasse du raisonnement métier. Je veux qu'il valide un plan, route du travail typé, et rejette les chemins inconnus. Si le prompt de l'orchestrateur déborde de jugement métier, vous avez caché la logique produit dans l'endroit le moins testable.

Avant le code de handoff, verrouillez le contrat pour que l'échec soit bruyant au lieu d'être poli.

```python
from typing import Callable

AGENTS: dict[str, Callable] = {
    "security": security_agent,
    "pricing": pricing_agent,
    "docs": docs_agent,
}

def dispatch(subtask: Subtask) -> Result:
    handler = AGENTS.get(subtask.role)
    if handler is None:
        raise ValueError(f"No agent for {subtask.role}")
    return handler(subtask)
```

Aucune supposition, aucun reroutage silencieux, aucun fallback magique. Si le plan demande pricing et que vous n'avez que security et docs, faites échouer l'exécution et corrigez le plan. Un système multi-agents qui improvise autour de spécialistes manquants, c'est juste un agent bancal avec une fausse moustache.

L'observabilité, c'est là que la facture devient réelle. [OpenTelemetry traces](https://opentelemetry.io/docs/concepts/signals/traces/) existent pour corréler le travail à travers des frontières de processus, et [l'observabilité de Semantic Kernel](https://learn.microsoft.com/en-us/semantic-kernel/concepts/enterprise-readiness/observability/) rappelle la partie pénible que tout le monde saute : logs, métriques et tracing sont le minimum syndical pour une IA d'entreprise. Chaque handoff entre agents devrait porter un identifiant de trace, un émetteur, un destinataire, une latence, une consommation de tokens, et un statut final. Si vous êtes incapable de reconstruire une requête de bout en bout, vous n'avez pas une architecture. Vous avez du folklore.

Pour les systèmes d'agents, c'est encore plus concret. [Les spans GenAI pour agents](https://opentelemetry.io/docs/specs/semconv/gen-ai/gen-ai-agent-spans/) définissent des attributs comme `gen_ai.operation.name`, `gen_ai.agent.name`, `gen_ai.request.model`, ainsi que les données d'erreur pour les spans d'agent et de workflow. Je reprendrais ces noms avant d'inventer mon propre schéma, parce qu'un vocabulaire de télémétrie maison vieillit très mal.

Les maths restent cruelles : trois sauts à 95 % de succès chacun, ça donne à peine 86 % de fiabilité bout en bout avant les retries. Ajoutez des validations humaines, de la file d'attente, ou des appels d'outils et la queue de latence devient plus moche, pas plus intelligente.

Mon seuil est simple : si vous n'achetez pas du débit parallèle, de l'isolation, ou une vraie frontière de spécialisation, gardez un seul agent. Si vous n'avez pas encore assez d'échelle ou de risque pour sentir la douleur du tracing, ignorez le battage multi-agents et passez votre temps à construire un meilleur plan mono-agent.

## Ressources

- [Persistance LangGraph](https://docs.langchain.com/oss/python/langgraph/persistence)
- [Interruptions LangGraph](https://docs.langchain.com/oss/python/langgraph/interrupts)
