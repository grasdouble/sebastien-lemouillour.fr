---
id: what-is-a-prompt
order: 1
difficulty: beginner
tags: [LLM, prompting, prompts]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

Vous avez déjà tapé quelque chose dans ChatGPT, appuyé sur Entrée, puis reçu une réponse tellement vague qu'elle ne servait à rien. La plupart du temps, ce n'est pas un problème de modèle. C'est un problème de prompt.

Un **prompt**, c'est le texte que vous donnez à un modèle de langage pour qu'il comprenne le travail à faire. Il peut contenir une instruction, du contexte, des contraintes, des exemples et le format de sortie attendu. Les fournisseurs répètent tous plus ou moins la même chose dans le [guide OpenAI](https://platform.openai.com/docs/guides/prompt-engineering), la [vue d'ensemble Anthropic](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview) et les [stratégies Gemini](https://ai.google.dev/gemini-api/docs/prompting-strategies) : soyez clair, donnez du contexte, et montrez la forme de la réponse quand c'est important.

Ce que les débutants ratent souvent, c'est ceci : un prompt n'est pas une formule magique. Le modèle n'attend pas un mot-clé secret. Il lit le texte que vous lui donnez comme du **contexte**, c'est-à-dire l'information disponible avant de commencer à répondre. Si ce contexte est flou, la réponse sera souvent floue aussi.

### Un prompt ressemble plus à un brief qu'à un mot-clé

On commence souvent par quelque chose comme « idées marketing » ou « explique les API ». C'est normal, les moteurs de recherche nous ont habitués à taper des fragments. Un modèle conversationnel fonctionne autrement. Il suit mieux un brief qu'il ne devine votre objectif implicite.

C'est le contraste que je montrerais à n'importe qui dès le premier jour.

```text
Prompt faible :
Explique les API.

Meilleur prompt :
Explique ce qu'est une API à un développeur web débutant en moins de 120 mots.
Utilise une analogie concrète et termine par une erreur fréquente à éviter.
```

La seconde version marche mieux parce qu'elle répond aux questions que le modèle ne peut pas deviner proprement tout seul : le public, la longueur et le résultat attendu. C'est cette manière d'écrire que je choisirais presque à chaque fois, sauf si la forme de la réponse m'importe vraiment très peu.

### Les petits détails changent beaucoup le résultat

Un prompt peut préciser le ton, le format, le niveau de détail ou les limites. « Donne-moi trois options » n'a pas le même effet que « choisis la meilleure option et justifie-la ». « Résume ce texte » n'a pas le même effet que « résume ce texte pour un manager pressé qui n'a pas lu l'original ».

C'est pour ça que le prompting semble étrange au début. Vous ne programmez pas au sens classique, mais vous spécifiez quand même un comportement. Ne vous inquiétez pas si cela paraît encore abstrait. Chez moi, le déclic est venu quand j'ai commencé à traiter le modèle comme un stagiaire ultra rapide : utile, capable, et totalement incapable de lire dans mes pensées.

### Le bon modèle mental

Si la sortie est mauvaise, vérifiez quatre choses avant d'accuser le modèle : la tâche demandée, le contexte fourni, les contraintes fixées et le format demandé. Le prompting débutant progresse très vite dès que ces quatre éléments deviennent explicites.

Ma règle est donc simple : quand une réponse sonne faux, je réécris le prompt avant de changer de modèle. Si vous voulez une méthode concrète pour le faire, le guide suivant est celui que je lirais tout de suite, parce qu'une bonne structure bat presque toujours une formulation prétendument brillante.
