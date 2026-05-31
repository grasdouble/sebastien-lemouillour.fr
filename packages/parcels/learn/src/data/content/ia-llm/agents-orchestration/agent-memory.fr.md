---
id: agent-memory
order: 18
difficulty: advanced
tags: [agents, memory, llm]
publishedAt: 2026-05-31
updatedAt: 2026-05-31
---

Tu finis enfin par calmer ton agent, puis la session suivante oublie les préférences du user et repose la même question. Si tu branches la mauvaise couche mémoire, tu n’obtiens pas un produit plus intelligent. Tu obtiens un incident de conformité avec un ton sympa.

La mémoire ne mérite sa place que si elle change les décisions futures. Tout le reste, c’est du prompt stuffing avec du stockage collé derrière. Je la découpe en trois catégories : mémoire de travail pour l’exécution en cours, mémoire épisodique pour ce qui s’est passé, et mémoire sémantique pour les faits stables qui valent le coup de survivre d’une session à l’autre. [LangGraph memory](https://docs.langchain.com/oss/python/concepts/memory) pose clairement la frontière entre court terme et long terme, [OpenAI results and state](https://platform.openai.com/docs/guides/agents/results) traite l’état comme une surface du runtime plutôt qu’une note de bas de page, et je valide quand même les enregistrements persistés avec [Pydantic fields](https://docs.pydantic.dev/latest/concepts/fields/) parce qu’une mémoire corrompue est pire que pas de mémoire du tout.

La plupart des tutos esquivent le morceau qui fait vraiment mal en prod : la politique d’écriture. Qui a le droit de créer une mémoire ? Quelle preuve faut-il ? Combien de temps vit-elle ? Comment est-elle supprimée ? Si tu ne peux pas répondre à ces quatre questions, ne livre pas la mémoire. Le vrai problème produit n’est pas de stocker plus de faits. C’est de décider quels faits méritent d’être transportés sans polluer les runs suivants.

Avant le code, voilà la leçon que les équipes apprennent trop tard : une mémoire a besoin de provenance. “L’utilisateur aime les réponses courtes” ne suffit pas. Il faut savoir d’où ça vient, quand ça a été observé et à quel niveau de confiance tu y crois.

Et oui, les horodatages doivent être timezone-aware, parce que Python est très clair sur la différence entre datetimes naïfs et conscients dans la [doc datetime](https://docs.python.org/3/library/datetime.html#aware-and-naive-objects).

```py
from datetime import datetime, timedelta, timezone
from pydantic import BaseModel, Field
from typing import Literal

class MemoryRecord(BaseModel):
    user_id: str
    kind: Literal['preference', 'profile', 'episodic']
    fact: str = Field(min_length=8, max_length=280)
    confidence: float = Field(ge=0.0, le=1.0)
    source: str  # id de ticket, instruction explicite, résultat d'outil
    created_at: datetime
    expires_at: datetime | None = None

now = datetime.now(timezone.utc)

memory = MemoryRecord(
    user_id='u_123',
    kind='preference',
    fact='Prefers concise release summaries',
    confidence=0.92,
    source='chat:turn-84',
    created_at=now,
    expires_at=now + timedelta(days=180),
)
```

Ce que je surveille vraiment en prod, c’est la qualité de la mémoire, pas son volume. Les mauvaises écritures créent de la dérive, et cette dérive est vicieuse. L’agent paraît sûr de lui tout en traînant des préférences périmées, des permissions obsolètes ou des sorties d’outils qui n’auraient jamais dû être promues en faits durables. Ajoute des TTL, des chemins de suppression et un moyen d’inspecter chaque mémoire utilisée dans une réponse. Et garde les écritures derrière un garde-fou plus strict que les lectures, parce que [OWASP prompt injection](https://owasp.org/www-community/attacks/PromptInjection) adore précisément les systèmes qui stockent d’abord et posent des questions ensuite.

Active la mémoire quand des tâches répétées gagnent vraiment à conserver de la continuité, par exemple des préférences user ou un contexte de compte durable. Si tu n’es pas capable d’expliquer la politique de rétention au juridique, au support et à l’utilisateur en une phrase chacun, laisse la mémoire éteinte.
