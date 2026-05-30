---
id: what-is-rag
order: 1
difficulty: beginner
tags: [RAG, LLM, retrieval, embeddings]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

Vous avez construit un chatbot. Il répond avec assurance, dans un français impeccable, puis il invente la moitié de ce qui concerne votre produit, vos documents internes ou la règle modifiée mardi dernier. C'est à ce moment-là que le RAG cesse d'être un acronyme à la mode et devient enfin concret.

Le [RAG paper](https://arxiv.org/abs/2005.11401) désigne le **Retrieval-Augmented Generation**. Le nom paraît intimidant, mais l'idée est simple : avant de répondre, le système récupère des informations pertinentes dans une source externe, puis demande au LLM de formuler sa réponse avec ces éléments sous les yeux. La **retrieval**, c'est l'étape où l'on retrouve les bons passages. La **generation**, c'est l'étape où le modèle rédige la réponse finale.

L'image que je trouve la plus juste, c'est celle d'un examen avec documents autorisés. Un LLM seul répond depuis sa mémoire interne, c'est-à-dire les régularités numériques apprises pendant l'entraînement. Un système RAG lui permet d'ouvrir les bonnes pages juste avant de parler. Le modèle génère toujours du texte, mais il ne travaille plus à l'aveugle.

En pratique, beaucoup de systèmes RAG s'appuient sur le [embeddings guide](https://platform.openai.com/docs/guides/embeddings), qui transforme les textes en vecteurs, des listes ordonnées de nombres représentant le sens. Quand un utilisateur pose une question, on transforme aussi cette question. Un moteur de similarité comme [FAISS](https://faiss.ai/) peut ensuite retrouver rapidement les morceaux de texte les plus proches. Si vous voulez une ressource claire pour comprendre cette logique côté débutant, [Sentence Transformers](https://www.sbert.net/) reste l'une des meilleures, parce qu'elle met l'accent sur le sens des phrases plutôt que sur le simple recouvrement de mots.

Cette séparation est importante, car elle clarifie deux rôles que beaucoup de tutos mélangent. Le LLM est bon pour produire une réponse lisible. La retrieval est bonne pour injecter de la connaissance fraîche ou privée dans le prompt. Si le manuel interne de votre entreprise change tous les mois, je choisirais un RAG bien conçu bien avant un fine-tuning. Le fine-tuning modifie le comportement du modèle. Le RAG modifie l'information à laquelle il a accès au moment de répondre.

La partie que la plupart des tutoriels survolent, c'est que le RAG n'est jamais meilleur que ce qu'il récupère. Si le mauvais chunk remonte, le modèle rédigera une mauvaise réponse avec beaucoup d'élégance. Une mauvaise retrieval contamine une bonne generation. C'est pour cela que le chunking, les métadonnées, les droits d'accès et la qualité des sources comptent beaucoup plus tôt qu'on ne l'imagine.

Ma règle est simple : si la réponse doit venir de documents qui vivent en dehors des données d'entraînement du modèle, utilisez du RAG. Si la connaissance est minuscule, stable et tient déjà dans un prompt, gardez quelque chose de plus simple. Le guide suivant rend ce choix très concret : pourquoi les équipes utilisent réellement le RAG dans des produits, au lieu de se contenter d'aimer le sigle.
