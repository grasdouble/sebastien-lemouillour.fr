---
id: why-use-rag
order: 2
difficulty: beginner
tags: [RAG, LLM, grounding, retrieval]
publishedAt: 2099-12-31
updatedAt: 2026-05-31
---

Vous mettez en ligne un chatbot, il répond avec la doc du mois dernier, et personne ne s'en rend compte avant qu'une personne suive la mauvaise consigne avec une assurance totale. Voilà la vraie raison d'utiliser le RAG. Je n'essaierais pas de forcer le modèle à « mieux se souvenir ». Je lui donnerais un moyen d'aller vérifier.

RAG, pour Retrieval-Augmented Generation, veut dire que le système récupère d'abord des passages utiles, puis demande au modèle de répondre en gardant ces passages sous les yeux. Le [RAG paper](https://arxiv.org/abs/2005.11401) présente cela comme l'association d'un modèle de langage et d'une mémoire externe que l'on peut mettre à jour sans réentraîner tout le modèle. Pour un débutant, l'idée utile est plus simple : quand la source change, on met à jour la source, pas le modèle.

La question suivante arrive tout de suite : comment retrouver le bon paragraphe au milieu de centaines de pages ? Le système transforme généralement chaque morceau de texte en embedding, c'est-à-dire une liste de nombres qui représente le sens, comme l'explique le [guide OpenAI](https://platform.openai.com/docs/guides/embeddings). J'aime bien voir ça comme des coordonnées du sens. Deux passages sur les remboursements devraient se retrouver plus proches qu'un passage sur des plantes de bureau. Ce n'est pas parfait, mais c'est bien plus utile que de prier pour qu'une recherche par mots-clés comprenne votre intention.

Ces vecteurs doivent ensuite être stockés quelque part. Une base de données vectorielle conserve le texte, ses métadonnées et son vecteur pour pouvoir faire de la recherche par similarité. [Weaviate](https://weaviate.io/developers/weaviate) décrit cela comme le stockage d'objets et de leurs embeddings vectoriels pour la recherche sémantique, et [Qdrant](https://qdrant.tech/documentation/) présente la même idée comme de la recherche vectorielle sur des données non structurées. Vous n'avez pas besoin d'épouser un produit trop tôt, mais je choisirais clairement un outil conçu pour cette récupération plutôt que de bricoler un tableur qui finira en film d'horreur.

C'est aussi pour cela que le RAG compte autant pour la connaissance privée. Contrats, notes de support, politiques internes ou spécifications produit sont généralement en dehors de la connaissance intégrée du modèle. La retrieval, c'est-à-dire l'étape qui va chercher les passages sources, permet au modèle de lire votre matière au moment de répondre. C'est bien plus fiable que d'espérer que la bonne phrase était cachée quelque part dans l'entraînement d'origine du modèle, ce qui est une excellente façon d'avoir tort avec aplomb.

Une limite, parce que les débutants méritent la version honnête : le RAG n'est pas un interrupteur magique « zéro hallucination ». Si le passage récupéré est obsolète, contradictoire ou hors sujet, la réponse peut quand même déraper. La retrieval améliore l'accès aux preuves. Elle ne nettoie pas de mauvaises preuves, ne classe pas parfaitement les passages faibles, et ne force pas le modèle à bien les utiliser.

Ma règle est assez simple : si le contenu change plus que quelques fois par an, vit dans des documents que vous contrôlez, ou doit produire des réponses que les utilisateurs peuvent vérifier, prenez du RAG. Si vous avez seulement cinq réponses stables sur une page, évitez la mécanique en plus. Ensuite, allez lire le guide sur ce qu'un LLM ne sait toujours pas faire de manière fiable, parce que cette frontière rend la décision beaucoup plus claire.
