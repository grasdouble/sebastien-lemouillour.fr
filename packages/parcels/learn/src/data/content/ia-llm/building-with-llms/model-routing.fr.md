---
id: model-routing
order: 24
difficulty: advanced
tags: [routing, latency, cost, fallback, LiteLLM]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

Si vous envoyez chaque tâche vers votre modèle le plus cher, vous n'êtes pas prudent. Vous refusez de mesurer. La classification, l'extraction, la modération, la synthèse longue et la review de code n'ont pas besoin du même profil de modèle, et faire semblant que si est une méthode très fiable pour rendre la facture absurde.

Le rôle du routage est simple : envoyer chaque tâche vers le modèle le moins cher qui dépasse encore le seuil de qualité attendu. Le [guide des modèles OpenAI](https://platform.openai.com/docs/models) montre clairement que capacité, latence et prix varient vraiment selon les modèles. Cette réalité devrait vous pousser à raisonner en classes de tâches, pas avec un modèle par défaut unique.

J'aime les tables de routage avec quatre champs par classe : plancher de qualité, plafond de latence, plafond de coût, et cible de fallback. La tâche arrive déjà classée, puis le routeur choisit le modèle viable le moins cher. Ne laissez pas le modèle se choisir lui-même. C'est exactement le genre d'autonomie qui se transforme discrètement en dépense.

C'est le minimum de politique que je veux voir codé :

```python
from dataclasses import dataclass
from typing import Optional

@dataclass
class ModelSpec:
    name: str
    quality_floor: float
    latency_ceiling_ms: int
    cost_ceiling_per_1k: float
    fallback: Optional[str] = None

ROUTES = {
    "classification": ModelSpec("gpt-4o-mini", 0.88, 500, 0.005, fallback="gpt-4o"),
    "extraction":     ModelSpec("gpt-4o-mini", 0.90, 700, 0.005, fallback="gpt-4o"),
    "synthesis":      ModelSpec("gpt-4o", 0.92, 4000, 0.040, fallback=None),
}
```

Une fois la politique en place, il faut une couche de transport. [LiteLLM](https://docs.litellm.ai/) est utile parce qu'il normalise les API des fournisseurs et apporte des primitives de fallback et de load balancing sans vous obliger à enfouir la logique de routage dans le SDK. Gardez le routage au-dessus de la couche transport. Une abstraction utile doit faciliter le changement de fournisseur, pas vous cacher l'économie réelle.

Voici le point de passage que j'implémente en général juste après :

```python
import litellm

def call_route(task_class: str, messages: list[dict]) -> str:
    spec = ROUTES[task_class]
    try:
        response = litellm.completion(model=spec.name, messages=messages)
        return response.choices[0].message.content
    except litellm.exceptions.APIError:
        if not spec.fallback:
            raise
        response = litellm.completion(model=spec.fallback, messages=messages)
        return response.choices[0].message.content
```

Le routage n'est jamais terminé. Les fournisseurs mettent les modèles à jour, la qualité bouge, et la route premium d'hier devient le gaspillage d'aujourd'hui. C'est pour ça que je veux des évaluations hebdomadaires qui alimentent la table, pas de la connaissance orale. La leçon d'orchestration que l'on retrouve aussi dans [Semantic Kernel](https://learn.microsoft.com/en-us/semantic-kernel/overview/) reste valable ici : les abstractions aident seulement si vos politiques restent explicites et testables.

Un seul seuil suffit pour savoir que la table est mauvaise : si plus de 30 % du trafic de production finit sur le modèle de fallback pour une route, votre primaire est mal configuré. Corrigez la politique. Le fallback est une assurance, pas le vrai chemin.
