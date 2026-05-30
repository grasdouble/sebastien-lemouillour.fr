---
id: context-window
order: 10
difficulty: beginner
tags: [LLM, contexte]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

Vous collez un long document, vous posez une question sur le début, et le modèle répond surtout à partir des derniers paragraphes. Ce n’est pas forcément un mauvais prompt. C’est très souvent un problème de contexte. La **fenêtre de contexte** est le nombre maximal de tokens qu’un modèle peut prendre en compte dans une requête. Si vous la traitez comme une mémoire infinie, vous finirez presque toujours par obtenir des réponses brouillonnes.

## Ce qui tient dans la fenêtre

Le point important quand on débute, c’est que cette fenêtre est un espace partagé. Vos instructions, le document collé, l’historique de la conversation et la réponse du modèle se disputent tous la même place. La documentation [token counting](https://docs.anthropic.com/en/docs/build-with-claude/token-counting) d’Anthropic et la page [Gemini tokens](https://ai.google.dev/gemini-api/docs/tokens) de Google présentent le contexte comme un budget de tokens, pas comme un nombre de pages ou de mots.

Autrement dit, un modèle avec une grande fenêtre de contexte n’est pas simplement « meilleur pour se souvenir ». Il dispose surtout d’un espace de travail plus grand pour la requête en cours. L’image que je préfère, c’est celle d’un bureau. Un bureau plus large permet d’étaler plus de feuilles, mais ça ne garantit pas que vous remarquerez la phrase essentielle cachée au milieu.

C’est utile de le rappeler parce que les transformers, l’architecture présentée dans [Attention Is All You Need](https://arxiv.org/abs/1706.03762), utilisent un mécanisme appelé **attention** pour pondérer les parties du texte qui comptent le plus au moment de prédire la suite. Avoir plus d’espace aide, mais l’attention n’a rien de magique.

## Pourquoi les longs prompts ratent quand même

Beaucoup de débutants pensent que si un modèle accepte une entrée très longue, il exploitera tout son contenu de façon équitable. Je ne partirais pas sur cette hypothèse. Des travaux comme [Lost in the Middle](https://arxiv.org/abs/2307.03172) montrent que les modèles peuvent moins bien utiliser des informations placées au milieu d’un contexte long.

Il faut donc respecter deux limites. La première est la limite dure, le maximum technique de tokens autorisés. La seconde est une limite plus souple : le moment où le prompt rentre encore, mais devient plus difficile à exploiter correctement.

C’est pour ça que les énormes prompts déçoivent souvent. Pour l’humain qui les écrit, ils paraissent complets. Pour le modèle, ils mélangent parfois instruction cruciale, bruit, contexte répété, logs, exemples et arrière-plan peu utile. Une grande fenêtre de contexte réduit la pression, mais elle ne supprime pas le besoin de hiérarchiser.

## Ce que je ferais à la place

Je traiterais le contexte comme un budget, pas comme une benne de stockage. Je mettrais la tâche en premier, les preuves essentielles juste après, puis le reste seulement si cela change vraiment la réponse. Si un document est long, je ne le collerais pas brut sauf en dernier recours. Je le découperais, je le résumerais, ou je ne récupérerais que les passages pertinents.

Une règle simple fonctionne bien : si la réponse dépend d’un passage précis, rendez ce passage impossible à rater. Citez-le, nommez-le, et gardez-le près de la question. Votre prochaine étape peut être très concrète : reprenez un prompt trop long que vous utilisez déjà, coupez-en un tiers, puis comparez la qualité des réponses. On apprend souvent plus vite avec cette expérience qu’en mémorisant des limites théoriques.
