---
id: hallucinations
order: 12
difficulty: beginner
tags: [LLM, fiabilité]
publishedAt: 2026-05-30
updatedAt: 2026-05-31
---

Vous demandez une source, le modèle en invente une, et vous ne vous en rendez compte que lorsque le titre de l’article ne mène nulle part. C’est souvent là que les débutants arrêtent de confondre réponse bien tournée et preuve. Une **hallucination** est une réponse qui a l’air sûre d’elle mais qui est fausse, non étayée ou inventée, ce qui correspond à la manière dont OpenAI décrit le problème dans son [guide hallucinations](https://cookbook.openai.com/articles/hallucinations). S’il ne fallait garder qu’une règle, je prendrais celle-ci : une formulation fluide est un signal de style, pas un signal de vérité.

## Pourquoi ça arrive

Un grand modèle de langage est entraîné à prédire les prochains **tokens**, c’est-à-dire de petits morceaux de texte comme des mots ou de la ponctuation. Le [papier GPT-3](https://arxiv.org/abs/2005.14165) reste une source primaire claire pour comprendre cet objectif d’entraînement. Ce que cet objectif ne contient pas saute vite aux yeux : il n’y a pas de vérificateur de faits intégré. Le modèle apprend des régularités de langage, pas le réflexe de s’arrêter pour vérifier une affirmation dans le monde extérieur.

C’est pour ça que je ne traite pas les hallucinations comme des bugs rares. Je les traite comme un mode d’échec normal d’un système conçu d’abord pour produire du texte plausible. Si le prompt est flou, si le contexte est mince, ou si la question demande des faits exacts, le modèle peut combler le vide avec quelque chose de statistiquement probable au lieu de quelque chose de vrai.

Je garde le mot « hallucination » parce qu’il parle à tout le monde, mais je refuse de le rendre plus mystérieux qu’il ne l’est. La plupart du temps, c’est juste une erreur ordinaire portée par un ton trop assuré.

## Ce qui la réduit vraiment

Les solutions banales sont celles auxquelles je fais le plus confiance. Donnez au modèle un contexte fiable. Demandez-lui de citer le passage qu’il utilise. Quand l’exactitude compte, branchez-le à des systèmes capables d’aller chercher l’information au lieu de deviner. La documentation [tool use docs](https://docs.anthropic.com/en/docs/agents-and-tools/tool-use/overview) d’Anthropic montre comment un modèle peut appeler des outils externes, et le [papier RAG](https://arxiv.org/abs/2005.11401) explique la génération augmentée par récupération, une approche où le modèle répond à partir de documents retrouvés plutôt qu’à partir de sa seule mémoire.

Je testerais aussi le flux de travail au lieu d’admirer trois bons exemples. Le [guide evals](https://platform.openai.com/docs/guides/evals) d’OpenAI défend l’idée de vérifier un système sur des tâches représentatives, et c’est important parce que les hallucinations se cachent souvent dans les cas qu’on a oublié de tester.

Ce que je ne ferais pas, en revanche, c’est traiter la formulation du prompt comme le remède principal. De meilleurs prompts aident, mais ils ne transforment pas un générateur de texte en témoin fiable.

## Comment je réagirais face à une réponse suspecte

Je ne demanderais pas : « Est-ce que c’est une hallucination ? » Cette question est trop molle pour aider. Je poserais des questions plus serrées : quelles affirmations doivent être vérifiées ? Lesquelles sont appuyées par une source citée ? Lesquelles dépendent d’informations à jour ? Lesquelles relèvent d’une reformulation produite de mémoire par le modèle ?

Ensuite, je rapprocherais la réponse des preuves. Demandez des passages cités. Demandez que l’incertitude soit formulée clairement. Demandez de séparer les faits, les hypothèses et les questions ouvertes. Si l’enjeu est élevé, traitez la première réponse comme un brouillon et vérifiez-la en dehors du modèle.

Si vous voulez une prochaine étape, reprenez une réponse que vous étiez prêt à croire et contrôlez chaque affirmation factuelle ligne par ligne. Mon seuil est simple : si le coût d’une erreur est élevé, une sortie non vérifiée n’est pas acceptable.
