---
id: what-is-a-prompt
order: 1
difficulty: beginner
tags: [prompting, llm]
publishedAt: 2026-06-08
updatedAt: 2026-06-08
---

Vous avez déjà tapé quelque chose dans ChatGPT, appuyé sur Entrée, puis reçu une réponse si vague que vous ne saviez même pas quoi en faire. Si ça vous arrive souvent, vous n'êtes pas en retard. Les débutants commencent presque toujours par une demande trop courte en espérant que le modèle devinera le reste.

Un **prompt**, c'est l'entrée que vous donnez à un **modèle de langage**, c'est-à-dire un système entraîné à produire du texte à partir d'exemples. Pour un débutant, l'idée utile est plus simple que la définition : un prompt est le brief qui dit au modèle quel travail faire. [Le guide OpenAI](https://platform.openai.com/docs/guides/prompt-engineering) recommande d'être explicite sur la tâche, les instructions, le contexte et le format de sortie, et c'est un point de départ bien plus sûr que d'espérer qu'une phrase maligne fera tout le travail.

### Un prompt ressemble à un brief, pas à un mot-clé

Les moteurs de recherche nous ont habitués à taper des fragments comme « idées marketing » ou « explique les API ». Un modèle de chat peut s'en contenter, mais il travaille bien mieux quand vous précisez pour qui la réponse est écrite, quelle longueur vous voulez et sous quelle forme elle doit arriver. [Les stratégies Gemini](https://ai.google.dev/gemini-api/docs/prompting-strategies) disent la même chose avec des instructions claires, des contraintes et des exemples. Mon avis, assez ferme sur ce point, est simple : mieux vaut écrire un prompt un peu plus long que miser sur une demande minuscule et floue.

C'est le contraste que je montrerais dès le premier jour.

```text
Prompt faible :
Explique ce qu'est une API.

Meilleur prompt :
Explique ce qu'est une API à un développeur web débutant en moins de 120 mots.
Utilise une analogie du quotidien et termine par une erreur fréquente à éviter.
```

La deuxième version marche mieux parce qu'elle enlève une partie des devinettes. Le **contexte**, c'est l'information de fond que le modèle doit utiliser, par exemple le public ou le texte source. Les **contraintes**, ce sont les règles comme la longueur, le ton ou les choses à éviter. Dès que ces éléments deviennent visibles, la qualité grimpe souvent très vite.

### Ce qu'un prompt ne peut pas faire

C'est la partie qui évite beaucoup de frustration. Un meilleur prompt peut guider le modèle, mais il ne peut pas lui donner un texte source que vous n'avez jamais fourni, ni transformer le mauvais outil en bon outil. [La vue d'ensemble d'Anthropic](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview) rappelle d'ailleurs que tous les problèmes ne se règlent pas avec du prompt engineering, parce qu'il faut parfois choisir un autre modèle, mieux évaluer, ou changer carrément d'outil.

C'est aussi pour ça que le prompting paraît bizarre au début. Vous n'écrivez pas du code au sens classique, mais vous guidez quand même un comportement. Si cela vous semble encore flou, tant mieux, presque tout le monde passe par là au départ.

### Et ensuite

Ensuite, passez à **La structure d'un bon prompt** et entraînez-vous à découper une demande brouillonne en tâche, contexte, contraintes et sortie. Ma règle de décision est simple : si deux réécritures soignées ratent encore la cible, arrêtez de polir la phrase et ajoutez de la structure, des exemples, ou un autre outil.
