---
id: how-does-an-llm-generate-text
order: 5
difficulty: beginner
tags: [LLM, tokens]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

Quand vous posez une question à un chatbot et qu'il répond phrase après phrase, cela ressemble presque à quelqu'un qui réfléchit en temps réel. C'est précisément là que beaucoup de débutants se perdent. On imagine un esprit caché qui "sait" quoi dire, puis le déroule. En réalité, le mécanisme est plus simple et, à mes yeux, plus intéressant : un LLM génère du texte en choisissant un **token** après l'autre.

### Tout commence par les tokens

Un token est une petite unité de texte manipulée par le modèle. Ce n'est pas toujours un mot entier. Selon le **tokenizer**, l'outil qui découpe le texte pour le modèle, un token peut être un mot, une partie de mot, un signe de ponctuation ou même un espace. OpenAI montre ce principe avec son [Tokenizer](https://platform.openai.com/tokenizer), et les [Transformers docs](https://huggingface.co/docs/transformers/tokenizer_summary) expliquent pourquoi cette découpe est nécessaire.

Quand vous écrivez un prompt, le système le convertit d'abord en tokens. Le modèle regarde cette séquence et calcule quelle suite a le plus de chances de suivre. Il ne rédige pas un paragraphe complet dans sa tête avant de l'afficher : il fait un choix, ajoute ce token au contexte, puis recommence.

### Prédire le prochain token

La meilleure façon de se représenter cela est l'autocomplétion, mais une autocomplétion extrêmement puissante. À chaque étape, le modèle attribue une probabilité à de nombreux tokens possibles. Il peut choisir le plus probable, ou **échantillonner** parmi plusieurs candidats selon des réglages comme la **température** : une valeur faible rend la sortie plus prévisible, une valeur élevée la rend plus diverse, parfois au prix de la fiabilité. Ce fonctionnement découle directement de l'architecture [Transformer](https://arxiv.org/abs/1706.03762).

Le mot **probabilité** compte beaucoup ici. Le modèle ne sait pas qu'une réponse est vraie ; il estime qu'une suite est plausible compte tenu du contexte et de ce qu'il a appris pendant l'entraînement.

### Pourquoi la réponse peut sembler cohérente

Si cette mécanique semble trop simple pour produire de bons résultats, c'est une réaction normale. Le point décisif est l'échelle. Avec énormément de données, de paramètres et de calcul, prédire le prochain token force le modèle à apprendre des structures grammaticales, du style, des associations de faits et même certaines étapes de raisonnement. C'est ce qui rend les modèles modernes si utiles, comme l'expliquent les [Claude docs](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview).

Mais cette cohérence apparente peut tromper. Une phrase fluide n'est pas une preuve d'exactitude. Le modèle peut continuer un motif de manière élégante tout en se trompant sur le fond, et c'est l'un des pièges les plus courants pour les débutants.

### Le réflexe utile à garder

Gardez une idée simple : un LLM ne "parle" pas comme un humain, il **complète** comme un système statistique très entraîné. Cette image vous aide à mieux écrire vos prompts, à comprendre pourquoi l'ordre des mots change la réponse, et à rester prudent face aux erreurs convaincantes. Si vous voulez aller plus loin, regardez ensuite les différents types de modèles IA, cela aide à comprendre pourquoi tous les modèles ne génèrent pas du texte de la même façon.
