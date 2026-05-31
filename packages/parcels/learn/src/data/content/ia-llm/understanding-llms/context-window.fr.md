---
id: context-window
order: 10
difficulty: beginner
tags: [LLM, contexte]
publishedAt: 2026-05-15
updatedAt: 2026-05-31
---

Vous collez un long document, vous posez une question sur le début, et le modèle répond comme s’il n’avait surtout retenu que la fin. Ce n’est pas vous qui êtes maladroit. Le plus souvent, le prompt demande au modèle de garder trop de choses en tête en même temps. La **fenêtre de contexte**, c’est la quantité de texte qu’un modèle peut utiliser comme mémoire de travail pour une réponse, et cet espace inclut aussi la réponse qu’il est en train de produire, pas seulement ce que vous avez collé [Anthropic context windows](https://docs.anthropic.com/en/docs/build-with-claude/context-windows).

## Pourquoi la fenêtre paraît plus petite que prévu

Le morceau qui manque souvent quand on débute, c’est que les modèles comptent en **tokens**, pas en pages. Un **token** est un morceau de texte, par exemple un mot, un bout de mot ou un signe de ponctuation, et les fournisseurs raisonnent en budgets de tokens plutôt qu’en nombres de pages faciles à imaginer [Anthropic token counting](https://docs.anthropic.com/en/docs/build-with-claude/token-counting).

C’est pour ça qu’une très grande fenêtre de contexte peut quand même décevoir. Moi, je la vois comme un bureau, pas comme un cerveau. Un bureau plus grand permet d’étaler plus de feuilles, mais il ne vous oblige pas à regarder la bonne phrase.

## Pourquoi tout faire tenir ne suffit pas

Cette image du bureau aide à comprendre la suite, parce que les transformers reposent sur l’**attention**, le mécanisme qui aide le modèle à pondérer les tokens les plus utiles pour prédire la suite [Attention Is All You Need](https://arxiv.org/abs/1706.03762). L’attention aide, mais elle ne garantit pas qu’un long prompt sera exploité de façon uniforme.

C’est la réponse au problème suivant : « Si tout rentre, pourquoi le modèle rate quand même le détail important ? » Moi, je parierais d’abord sur la surcharge, pas sur un mystère. Il y a la limite dure, celle du volume maximal qui tient. Et il y a une limite plus souple, le moment où le prompt tient encore, mais devient moins fiable à utiliser correctement.

## Ce que je choisirais en pratique

Je choisirais presque toujours un prompt plus court et bien balisé plutôt qu’un énorme collage. Ce n’est pas du minimalisme pour le principe. C’est un choix de fiabilité. Quand la phrase importante est enfouie au milieu d’un contexte long, les modèles peuvent moins bien l’utiliser, et c’est précisément le phénomène étudié dans [Lost in the Middle](https://arxiv.org/abs/2307.03172).

Donc, si un document est long, je ne le collerais pas entier dans le chat sauf si je n’ai vraiment pas mieux. Je garderais la tâche en premier, je citerais exactement le passage décisif, et je couperais tout ce qui ne change pas la réponse. Si vous voulez la suite logique après ça, regardez les tokens, parce qu’une fenêtre de contexte devient beaucoup moins abstraite dès qu’on sait estimer la taille d’un prompt. Ma règle est simple : si la réponse dépend d’un passage précis, rendez ce passage impossible à manquer, et si le prompt poursuit plusieurs objectifs à la fois, découpez-le avant de l’envoyer.
