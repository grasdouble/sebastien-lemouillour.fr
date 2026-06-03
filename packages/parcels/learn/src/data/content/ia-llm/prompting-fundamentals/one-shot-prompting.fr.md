---
id: one-shot-prompting
order: 5
difficulty: beginner
tags: [prompting, llm]
publishedAt: 2026-06-08
updatedAt: 2026-06-08
---

Vous demandez à un LLM, c'est-à-dire un grand modèle de langage, de renvoyer un seul label propre, et il ajoute quand même une phrase inutile. Ce raté est très courant, donc si vous bloquez ici, vous n'êtes pas en train de mal faire les choses.

Le **one-shot prompting** consiste à mettre un exemple déjà résolu dans le prompt avant la vraie demande. Les guides de [Gemini](https://ai.google.dev/gemini-api/docs/prompting-strategies), [OpenAI](https://platform.openai.com/docs/guides/prompt-engineering) et [Anthropic](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview) présentent tous les exemples comme un moyen concret d'orienter le format et le comportement du modèle quand les instructions seules restent trop floues.

### Pourquoi un seul exemple aide

Un exemple résolu, c'est un peu comme une fiche déjà remplie que l'on montre avant de tendre la fiche vide. « Sois concis » reste abstrait. « Réponds comme ceci » devient concret. J'utilise le one-shot quand le modèle a déjà compris la tâche, mais rate encore le format, le style de label ou le ton.

Cette limite compte. Le one-shot donne une impulsion, ce n'est pas un plan de sauvetage. Si la tâche elle-même est vague, ou si vos labels se recouvrent, un seul exemple ne corrigera pas la règle de fond. Dans le vocabulaire du prompting, le **zero-shot** consiste à donner seulement des instructions, sans exemple. Si le zero-shot est déjà proche du bon résultat, le one-shot est souvent l'amélioration la plus légère et la plus utile.

### À quoi ressemble un prompt one-shot pour débuter

Imaginez que vous vouliez ranger des messages de support dans trois cases : **Bug** pour un défaut, **Billing** pour un problème de paiement, et **Feature Request** pour une capacité demandée. Voici un prompt qui montre clairement ce motif.

```text
Classe chaque message de support comme Bug, Billing ou Feature Request.
Réponds uniquement avec le label.

Exemple :
Message : "J'ai été débité deux fois pour mon abonnement ce mois-ci."
Label : Billing

Classe maintenant ce message :
"Le mode sombre est réussi, mais l'application mobile plante quand j'ouvre les réglages."
```

Cet exemple unique apprend plus que l'instruction seule. Il montre le format exact de sortie, les labels autorisés et le niveau de brièveté attendu. C'est pour cela que je préfère les exemples simples aux exemples malins.

### Le piège classique côté débutant

Les débutants choisissent souvent un exemple trop long ou trop décoratif. Le modèle recopie alors la décoration au lieu de comprendre la règle. Si votre exemple contient des blagues, des explications en trop ou une mise en forme mélangée, ces détails peuvent revenir dans la réponse suivante.

Ma position est simple : les exemples un peu ennuyeux sont souvent les meilleurs professeurs. Gardez un exemple court, représentatif et aussi propre que la sortie attendue.

### Quand un seul shot suffit

Restez en one-shot quand un exemple clair enlève l'essentiel de la dérive. Passez à l'étape suivante quand vous ajoutez sans cesse des exceptions pour les cas voisins, parce que c'est souvent le moment où le **few-shot prompting**, c'est-à-dire plusieurs exemples au lieu d'un seul, montrera mieux la frontière de la règle.

Règle de décision : si un exemple corrige le cas courant, gardez-le. Si vous continuez à corriger les cas limites à la main après un shot propre, passez au few-shot prompting avant d'ajouter encore du texte.
