---
id: one-shot-prompting
order: 5
difficulty: beginner
tags: [LLM, prompting, one-shot, examples]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

Vous avez sûrement déjà vu cette situation agaçante : le modèle est presque bon. La structure est proche, le ton est presque juste, et pourtant la réponse reste à côté de la plaque de 15 %. C'est exactement là que le one-shot prompting devient utile.

Le **one-shot prompting** consiste à donner au modèle un exemple du type d'entrée et de sortie attendu avant de lui soumettre un nouveau cas. Les documentations officielles de [Gemini](https://ai.google.dev/gemini-api/docs/prompting-strategies), [OpenAI](https://platform.openai.com/docs/guides/prompt-engineering) et [Anthropic](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview) recommandent toutes l'usage d'exemples quand les instructions seules laissent trop de place à l'interprétation.

### Pourquoi un seul exemple aide autant

Un exemple unique fait quelque chose que les instructions font mal : il montre le goût attendu. « Sois concis » reste vague. « Réponds comme ceci » devient concret. Le one-shot est donc particulièrement utile pour le ton, le format, les labels, et toutes les tâches où le modèle choisit le mauvais motif alors qu'il a pourtant compris le sujet.

Je le sors quand le zero-shot est proche mais glissant. Si le zero-shot échoue complètement, un seul exemple ne suffira peut-être pas. S'il est déjà à 85 %, le one-shot peut donner l'impression de tricher un peu.

### À quoi ça ressemble en pratique

L'exemple doit être court, propre et représentatif. Il n'est pas là pour impressionner le modèle. Il est là pour ancrer le motif.

C'est typiquement le genre de prompt que j'utiliserais.

```text
Classe chaque message de support comme Bug, Billing ou Feature Request.
Réponds uniquement avec le label.

Exemple :
Message : "J'ai été débité deux fois pour mon abonnement ce mois-ci."
Label : Billing

Classe maintenant ce message :
"Le mode sombre est réussi, mais l'application mobile plante quand j'ouvre les réglages."
```

Cet exemple apprend plus que l'instruction seule. Il montre le format exact de sortie, le niveau de brièveté et le style de labellisation.

### Le piège classique côté débutant

Beaucoup de gens choisissent un exemple trop sophistiqué, trop long, ou trop spécifique. Ensuite, le modèle copie des détails accidentels au lieu du motif que vous vouliez enseigner. Si votre exemple contient des blagues, des commentaires inutiles ou un format bizarre, ne soyez pas surpris de les revoir revenir.

Je préfère les exemples ennuyeux. Les exemples ennuyeux enseignent mieux la règle.

### Quand s'arrêter au one-shot

Le one-shot sert à donner une impulsion, pas à construire tout un programme scolaire. Si le modèle continue de se tromper sur des cas limites après un exemple, ce n'est pas un échec. Cela veut juste dire que le motif a besoin d'une couverture plus large.

Ma règle est la suivante : quand la sortie est presque correcte et que vous pouvez montrer un exemple propre du motif manquant, utilisez le one-shot. Si un seul exemple corrige un cas mais pas les voisins, passez au guide suivant, parce que le few-shot prompting correspond justement au moment où l'on arrête de suggérer et où l'on commence à vraiment enseigner.
