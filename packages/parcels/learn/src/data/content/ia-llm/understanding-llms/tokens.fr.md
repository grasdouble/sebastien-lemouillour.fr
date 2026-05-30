---
id: tokens
order: 8
difficulty: beginner
tags: [LLM, tokens]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

Vous collez un paragraphe qui vous semble court, puis l’interface vous affiche 180 tokens. Presque tout le monde bute là-dessus au début. On imagine naturellement qu’un modèle lit des mots comme nous. Ce n’est pas le cas. Si je ne devais surveiller qu’une seule unité quand j’utilise un LLM, un **large language model**, c’est-à-dire un modèle de langage capable de prédire du texte, je choisirais les tokens avant tout le reste, parce qu’ils pilotent le coût, la vitesse et la quantité d’informations que le modèle peut garder en tête en une fois.

## Pourquoi les mots ne suffisent pas

Un **token** est un morceau de texte utilisé en interne par le modèle. Parfois, un token correspond à un mot entier. Parfois, c’est une partie de mot, un signe de ponctuation, ou même un espace placé avant un mot. La bibliothèque [tiktoken](https://github.com/openai/tiktoken) d’OpenAI et la documentation [token counting](https://docs.anthropic.com/en/docs/build-with-claude/token-counting) d’Anthropic montrent la même idée de fond : les modèles comptent en tokens, pas en mots ni en caractères.

C’est pour ça que « banane » et « bananes » ne coûtent pas forcément pareil. C’est aussi pour ça que le français, l’anglais, les emoji et le code ne gonflent pas tous de la même manière. Une phrase courte avec beaucoup de ponctuation ou des termes rares peut consommer plus de tokens que prévu. Une phrase plus longue avec des mots fréquents peut en utiliser moins.

L’image qui m’aide le plus, c’est celle des cartons de déménagement. Votre phrase, c’est le contenu. Les tokens, ce sont les cartons. Et la compagnie vous facture au nombre de cartons, pas à l’impression que donne la phrase.

## Pourquoi les tokens comptent vraiment

Chaque prompt consomme des tokens, et chaque réponse en consomme aussi. Les fournisseurs comptent les deux quand ils parlent de limites et d’usage. La page [Gemini tokens](https://ai.google.dev/gemini-api/docs/tokens) l’explique de la même manière : les tokens sont le budget de ce que vous envoyez et de ce que le modèle renvoie.

Ça a trois conséquences concrètes.

D’abord, les tokens influencent le coût. Plus il y a de tokens, plus la facture monte en général.

Ensuite, les tokens influencent la **fenêtre de contexte**, c’est-à-dire la quantité maximale de texte que le modèle peut prendre en compte dans une requête. Si votre prompt est trop gros, il faut raccourcir, retirer ou refuser quelque chose.

Enfin, les tokens influencent la fiabilité. Quand vous approchez de la limite du modèle, des instructions importantes peuvent se faire écraser par des notes trop longues, des logs ou des transcriptions collées sans tri.

## Ce que je ferais à votre place

Je n’essaierais pas de compter les tokens pour chaque petit prompt du quotidien. Ça devient vite fatigant. En revanche, je les compterais dans trois cas précis : quand le budget compte, quand vous êtes proche d’une limite, ou quand vous construisez un usage répétable.

Si vous êtes dans l’un de ces cas, utilisez un compteur ou un tokenizer au lieu de deviner. Une estimation grossière suffit pour discuter, mais deviner devient une mauvaise habitude dès que les limites se resserrent. Votre prochaine étape peut être très simple : prenez un prompt que vous utilisez souvent, passez-le dans un compteur de tokens, puis comparez le résultat avec votre intuition. Ce petit test enlève beaucoup de flou pour la suite.
