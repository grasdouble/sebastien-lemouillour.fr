---
id: what-is-an-llm
order: 4
difficulty: beginner
tags: [LLM]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

Quand quelqu'un dit « j'utilise l'IA pour écrire mes emails », ce qu'il veut presque toujours dire, c'est « j'utilise un grand modèle de langage ». L'abréviation **LLM** apparaît partout, dans les articles, les descriptions de produits, les offres d'emploi, généralement sans explication. L'objectif ici est de la rendre enfin concrète.

### Les trois mots de "Large Language Model"

Commencez par **modèle** : un système mathématique entraîné à produire ou compléter du texte. **Langage** signifie qu'il travaille sur des mots, ou plus précisément sur des unités de texte appelées **tokens**, que nous verrons au guide suivant. **Large** signifie qu'il a été entraîné sur d'énormes volumes de texte et qu'il contient un très grand nombre de **paramètres**, des valeurs numériques ajustées pendant l'entraînement. OpenAI présente cette famille dans ses [text generation docs](https://platform.openai.com/docs/guides/text), et Anthropic dans sa [documentation Claude](https://docs.anthropic.com/en/docs/intro-to-claude).

Je préfère cette définition : un LLM est un modèle entraîné à prédire la suite la plus probable d'un texte, assez grand pour capturer beaucoup de régularités du langage humain. Cette simple capacité, poussée à grande échelle, permet de répondre à des questions, reformuler, résumer, traduire et raisonner sur du texte.

### Pourquoi cela donne l'impression qu'il "comprend"

Le mot important ici est **prédire**. Pendant l'entraînement, le modèle voit d'immenses quantités de texte et apprend quelles séquences ont tendance à aller ensemble. L'article original [Transformer](https://arxiv.org/abs/1706.03762), qui a lancé l'architecture moderne des LLM, a montré comment faire cela très efficacement à grande échelle.

Quand vous écrivez un **prompt**, votre consigne, le LLM ne cherche pas une phrase pré-enregistrée dans une base secrète. Il calcule, token après token, quelle suite est la plus plausible compte tenu du contexte. Comme il a appris beaucoup de structures linguistiques et de faits présents dans ses données, le résultat peut donner une impression de compréhension. Mais cette impression mérite d'être maniée avec prudence : un LLM n'a ni intention, ni expérience vécue, ni garantie de vérité.

### Ce qu'un LLM fait bien, et ses limites

Les LLM sont particulièrement utiles pour les tâches où le langage compte plus que l'exactitude absolue : reformuler un texte, résumer un document, classer des retours clients, extraire des informations, produire un premier brouillon. Ils peuvent aussi suivre des instructions complexes, surtout quand ils ont été affinés après entraînement par des techniques d'**alignement**, méthodes visant à rendre le modèle plus utile et moins nuisible, comme le décrit [InstructGPT](https://arxiv.org/abs/2203.02155).

Leur faiblesse principale est simple : ils peuvent produire des réponses convaincantes et fausses. Je les considère comme d'excellents assistants de formulation, mais de mauvais arbitres de vérité quand l'enjeu est élevé.

### La bonne question à poser

Quand vous voyez "LLM" sur un outil, ne demandez pas d'abord « est-ce intelligent ? ». Demandez : **travaille-t-il sur du langage, sous quelle forme, et avec quel niveau de fiabilité attendu ?** Si votre problème est centré sur le texte, le résumé, la rédaction ou l'analyse d'instructions, un LLM est souvent un bon point de départ. Si vous voulez comprendre pourquoi il répond mot par mot plutôt que tout d'un coup, la prochaine étape logique est la génération token par token.
