---
id: tokens
order: 8
difficulty: beginner
tags: [LLM, tokens]
publishedAt: 2026-05-31
updatedAt: 2026-05-31
---

Vous collez un court paragraphe, puis l’interface annonce 180 tokens et, d’un coup, la demande qui vous semblait bon marché paraît plus coûteuse. Cette confusion est normale. Beaucoup de débutants imaginent qu’un modèle lit des mots comme nous. Ce n’est pas le cas. Si je ne devais surveiller qu’une seule chose avec un LLM, un **large language model**, c’est-à-dire un modèle de langage qui prédit du texte, je choisirais les tokens, parce qu’ils décident du coût, de la vitesse et de la quantité de texte que le modèle peut garder active à un instant donné.

## Pourquoi compter les mots vous trompe

Un **token** est un morceau de texte utilisé en interne par le modèle. Selon le modèle, un token peut être un mot entier, un bout de mot, un signe de ponctuation, ou même un espace attaché au mot suivant. [OpenAI](https://platform.openai.com/tokenizer) et [Anthropic](https://docs.anthropic.com/en/docs/build-with-claude/token-counting) expliquent tous les deux que les modèles comptent des tokens, pas des mots ni des caractères.

Cela répond au premier résultat bizarre : « banane » et « bananes » ne sont pas forcément facturées pareil. Le français, l’anglais, les emoji et le code se découpent aussi différemment. Il n’existe pas de formule universelle mots-vers-tokens, parce que chaque famille de modèles a son propre **tokenizer**, l’outil qui découpe le texte en tokens avant que le modèle le traite.

L’image que je garderais, c’est celle du déménagement. Votre phrase, c’est ce qu’il y a dans l’appartement. Les tokens, ce sont les cartons que les déménageurs comptent. Vous payez les cartons, pas l’impression de brièveté de la phrase.

## Pourquoi les tokens deviennent un vrai problème

Une fois que vous savez que le modèle compte des cartons, la question suivante arrive vite : pourquoi s’en soucier ? Parce que les fournisseurs comptent les tokens envoyés et les tokens renvoyés. [Google AI](https://ai.google.dev/gemini-api/docs/tokens) présente le même principe pour Gemini.

C’est important dans trois cas, et j’ai un avis net là-dessus : je mesurerais seulement quand la décision change quelque chose. D’abord, plus de tokens veut généralement dire plus de coût. Ensuite, les tokens remplissent la **fenêtre de contexte**, la quantité maximale de texte qu’un modèle peut prendre en compte dans une requête. Enfin, quand vous approchez de cette limite, des instructions utiles peuvent se faire pousser dehors par des notes collées, des logs ou des transcriptions.

Il y a aussi une limite à garder en tête tôt : une estimation de tokens ne se transporte pas proprement d’un modèle à l’autre. Un comptage obtenu avec un tokenizer sert de repère pour cette famille de modèles, pas de vérité universelle.

## Ce que je ferais vraiment

Je ne compterais pas les tokens pour chaque petit échange. Cela devient vite du travail inutile. Je les compterais quand l’argent compte, quand le prompt devient long, ou quand je construis un usage que je veux répéter.

Si cela reste abstrait, faites un test concret ensuite : prenez un prompt que vous réutilisez, passez-le dans le tokenizer du modèle que vous utilisez vraiment, puis comparez le résultat à votre intuition. Ensuite, allez voir la notion de fenêtre de contexte, parce que c’est là que les tokens cessent d’être une idée théorique. Ma règle est simple : si un prompt est réutilisé, facturable, ou plus long que quelques paragraphes, comptez avant d’envoyer.
