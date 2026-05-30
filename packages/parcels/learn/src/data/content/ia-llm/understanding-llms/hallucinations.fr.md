---
id: hallucinations
order: 12
difficulty: beginner
tags: [LLM, fiabilité]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

Vous demandez une source, le modèle vous donne une citation, puis cinq minutes plus tard vous découvrez que le titre de l’article n’existe même pas. C’est le genre de moment qui marque vite. Avec les LLMs, une **hallucination** est une réponse plausible en apparence, mais fausse, non étayée, ou carrément inventée. Si vous débutez, le changement d’état d’esprit le plus important est simple : une réponse fluide n’est pas une preuve.

## Pourquoi elles arrivent

Un grand modèle de langage est entraîné à prédire les tokens probables qui viennent ensuite à partir de motifs observés dans les données. Le [papier GPT-3](https://arxiv.org/abs/2005.14165) reste une source primaire très claire pour comprendre cette logique. Ce qui manque dans cet objectif saute alors aux yeux : il n’y a pas de vérificateur de vérité intégré. Le modèle est optimisé pour produire une suite crédible, pas pour ouvrir un navigateur, interroger une base de données, ou reconnaître spontanément son incertitude, sauf si on l’y aide explicitement.

C’est pour ça que les hallucinations ne sont pas de simples bugs aléatoires. C’est un mode d’échec prévisible pour des systèmes conçus d’abord pour générer du langage. Quand le prompt est flou, quand le contexte manque, ou quand la réponse exige des faits précis, le modèle peut combler les trous avec quelque chose qui a l’air statistiquement convaincant.

Je trouve le mot « hallucination » utile, mais aussi un peu trompeur, parce qu’il peut faire croire à un phénomène rare ou spectaculaire. En pratique, beaucoup d’hallucinations sont juste des erreurs ordinaires livrées avec trop d’assurance.

## Ce qui les réduit vraiment

Les meilleurs remèdes sont assez banals, et c’est plutôt rassurant. Donnez au modèle un contexte fiable. Demandez des citations ou des extraits. Branchez-le à des outils quand des informations exactes ou à jour comptent vraiment. La documentation [tool use](https://docs.anthropic.com/en/docs/agents-and-tools/tool-use/overview) d’Anthropic montre comment un modèle peut appeler des systèmes externes au lieu de deviner, et le [papier RAG](https://arxiv.org/abs/2005.11401) explique la génération augmentée par récupération de documents, où le modèle répond à partir de sources retrouvées plutôt qu’à partir de sa seule mémoire interne.

L’évaluation compte aussi. Le [guide evals](https://platform.openai.com/docs/guides/evals) d’OpenAI rappelle utilement que la fiabilité progresse quand on teste le système sur des cas représentatifs, au lieu de se fier à quelques réponses impressionnantes.

Ce qui marche mal, en revanche, c’est la confiance aveugle dans la formulation du prompt. Un meilleur prompt aide, mais il ne transforme pas magiquement un générateur en autorité fiable.

## Comment je réagirais face à une réponse suspecte

Je n’irais pas demander : « Est-ce que c’est une hallucination ? » La question est trop vague. Je poserais des questions plus serrées : quelles affirmations doivent être vérifiées ? Lesquelles sont réellement appuyées par une source ? Lesquelles dépendent d’informations à jour ? Lesquelles relèvent seulement de la formulation du modèle ?

Ensuite, je rapprocherais la réponse des preuves. Demandez des passages cités. Demandez que l’incertitude soit formulée clairement. Demandez de séparer les faits, les hypothèses et les points ouverts. Si l’enjeu est important, utilisez une vérification externe et considérez la première réponse comme un brouillon.

Une règle de décision fonctionne très bien : plus le coût de l’erreur est élevé, moins vous devez accepter une réponse sans contrôle. Votre prochaine étape peut être toute simple : reprenez une réponse que vous auriez tendance à croire trop vite, puis vérifiez chaque affirmation factuelle ligne par ligne. Cet exercice change souvent la manière d’utiliser les LLMs bien plus qu’un grand discours sur les hallucinations.
