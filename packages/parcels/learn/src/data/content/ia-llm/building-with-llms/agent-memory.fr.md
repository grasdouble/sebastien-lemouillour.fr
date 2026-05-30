---
id: agent-memory
order: 18
difficulty: advanced
tags: [LLM, OpenAI, LangChain, memory, agents]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

Sans mémoire, l’agent a l’air amnésique. Avec une mauvaise mémoire, il se transforme en incident de conformité qui répond avec beaucoup d’assurance.

La mémoire ne mérite sa place que si elle change les décisions futures. Tout le reste, c’est du prompt stuffing avec une base de données accrochée derrière. Je sépare ça en trois catégories. La mémoire de travail appartient à l’exécution en cours. La mémoire épisodique stocke ce qui s’est passé. La mémoire sémantique stocke les faits stables qui doivent survivre d’une session à l’autre. [OpenAI Agents](https://platform.openai.com/docs/guides/agents) traite l’état conversationnel comme un sujet de premier plan, [LangGraph memory](https://langchain-ai.github.io/langgraph/concepts/memory/) formalise mémoire court terme et long terme, et je valide quand même les enregistrements persistés avec [Pydantic](https://docs.pydantic.dev/) parce qu’une mémoire corrompue est pire que pas de mémoire du tout.

La partie difficile que la plupart des tutos évitent, c’est la politique d’écriture. Qui a le droit de créer une mémoire ? Quelle preuve faut-il ? Combien de temps vit-elle ? Comment est-elle supprimée ? Si tu ne peux pas répondre à ces quatre questions, ne livre pas la mémoire. Le vrai problème produit n’est pas de stocker plus de faits. C’est de décider quels faits valent la peine d’être transportés sans contaminer les runs suivants.

Avant le code, voilà la leçon de prod que beaucoup apprennent trop tard : une mémoire a besoin de provenance. “L’utilisateur aime les réponses courtes” ne suffit pas. Il faut savoir d’où ça vient, quand ça a été observé et à quel niveau de confiance tu le crois.

Voilà le type d’enregistrement que je veux en base :

```py
from datetime import datetime, timedelta
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

memory = MemoryRecord(
    user_id='u_123',
    kind='preference',
    fact='Prefers concise release summaries',
    confidence=0.92,
    source='chat:turn-84',
    created_at=datetime.utcnow(),
    expires_at=datetime.utcnow() + timedelta(days=180),
)
```

Ce que je surveille vraiment en prod, c’est la qualité de la mémoire, pas son volume. Les mauvaises écritures créent de la dérive, et cette dérive est sournoise. L’agent paraît sûr de lui tout en transportant des préférences périmées, des permissions obsolètes ou des sorties d’outils qui n’auraient jamais dû devenir des faits durables. Ajoute des TTL, des chemins de suppression et un moyen d’inspecter chaque mémoire utilisée dans une réponse. Et garde les écritures derrière un garde-fou plus strict que les lectures, parce que le prompt injection adore les systèmes qui stockent d’abord et posent des questions ensuite.

Active la mémoire quand des tâches répétées gagnent réellement à conserver de la continuité, par exemple des préférences utilisateur ou un contexte de compte durable. Si tu n’es pas capable d’expliquer la politique de rétention au juridique, au support et à l’utilisateur en une phrase chacun, laisse la mémoire éteinte.
