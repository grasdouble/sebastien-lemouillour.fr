---
id: model-routing
order: 24
difficulty: advanced
tags: [production]
publishedAt: 2026-12-31
updatedAt: 2026-05-31
---

Quand votre chemin bon marché redirige en douce la moitié du trafic vers un plus gros modèle, vous n'avez pas du routage. Vous avez un bug de facturation avec un joli nom. La classification, l'extraction, la modération et la synthèse longue ne méritent pas le même profil de modèle, et faire semblant du contraire est une excellente façon de cramer le budget avant même d'avoir du volume.

Le but est d'envoyer chaque classe de tâche vers le modèle le moins cher qui tient encore le SLA. Le [guide des modèles OpenAI](https://platform.openai.com/docs/models) le dit sans détour : les gros modèles achètent de la capacité, les petits achètent de la latence et du coût. Donc je classerais d'abord les tâches, puis je routerais ensuite. Un modèle par défaut pour tout faire, c'est de l'architecture paresseuse.

Je veux cinq champs par route : alias primaire, alias de fallback, plancher de qualité, budget de latence et plafond de coût. La route doit être choisie avant de lancer l'appel modèle. Ne demandez pas au modèle s'il est le bon modèle. C'est une fausse bonne idée.

Écrivez la politique d'abord, comme ça la dispute a lieu en review plutôt qu'en plein incident.

```python
from dataclasses import dataclass

@dataclass(frozen=True)
class RoutePolicy:
    primary_alias: str
    fallback_alias: str | None
    quality_floor: float
    latency_budget_ms: int
    max_input_cost_per_million: float

ROUTES = {
    "classification": RoutePolicy("fast-classifier", "deep-generalist", 0.88, 500, 0.40),
    "extraction": RoutePolicy("fast-extractor", "deep-generalist", 0.90, 800, 0.60),
    "synthesis": RoutePolicy("deep-generalist", None, 0.94, 4000, 8.00),
}
```

Une fois la politique écrite, gardez la couche de transport sous laisse. LiteLLM documente déjà les fallbacks ordonnés dans son [guide de fiabilité](https://docs.litellm.ai/docs/proxy/reliability) et le routage entre déploiements dans son [guide de load balancing](https://docs.litellm.ai/docs/proxy/load_balancing). Parfait. La couche transport peut exécuter la politique, mais elle ne doit pas inventer la politique.

Voilà la séparation que je mettrais en prod.

```python
from litellm import Router

router = Router(
    model_list=[
        {
            "model_name": "fast-classifier",
            "litellm_params": {"model": "provider/small-instruct", "rpm": 600},
        },
        {
            "model_name": "fast-extractor",
            "litellm_params": {"model": "provider/medium-instruct", "rpm": 300},
        },
        {
            "model_name": "deep-generalist",
            "litellm_params": {"model": "provider/large-reasoner", "rpm": 60},
        },
    ],
    fallbacks=[
        {"fast-classifier": ["deep-generalist"]},
        {"fast-extractor": ["deep-generalist"]},
    ],
)


def run_route(task_class: str, messages: list[dict]) -> str:
    spec = ROUTES[task_class]
    response = router.completion(model=spec.primary_alias, messages=messages)
    return response.choices[0].message.content
```

Le routage se dégrade plus vite que ce que les équipes aiment admettre. Le [guide OpenAI sur les evals](https://developers.openai.com/api/docs/guides/evals) dit explicitement que les evals sont essentielles quand on change ou qu'on teste de nouveaux modèles, et c'est exactement pour ça que je veux des evals par route sur une cadence fixe au lieu de dépendre de l'intuition de quelqu'un dans Slack. Si un fournisseur refresh un modèle et que qualité ou latence bougent, la table doit changer dans la même semaine.

Mon seuil est volontairement banal : si une route envoie plus de 30 % du trafic de production vers le fallback pendant sept jours d'affilée, la route primaire est morte. Reclassifiez la tâche, élargissez le budget de latence, ou payez le plus gros modèle. Le fallback est une assurance, pas votre vraie architecture.

## Ressources

- [Graders OpenAI](https://platform.openai.com/docs/guides/graders)
- [Semantic Kernel](https://learn.microsoft.com/en-us/semantic-kernel/overview/)
