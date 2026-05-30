---
id: why-use-rag
order: 2
difficulty: beginner
tags: [RAG, LLM, grounding, retrieval]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

Vous collez dix pages de documentation dans un prompt, la réponse a l'air correcte, puis quinze jours plus tard la doc change et tout le système commence à mentir discrètement. C'est la vraie raison d'utiliser le RAG. Pas parce que ça fait sophistiqué, mais parce que la connaissance réelle bouge.

Le premier bénéfice, c'est la **fraîcheur** de l'information. Avec un pipeline RAG, le modèle peut aller chercher les passages les plus pertinents au moment de la requête, au lieu de dépendre uniquement de ce qui a été appris pendant l'entraînement. C'est précisément l'objectif du [RAG paper](https://arxiv.org/abs/2005.11401) : combiner un modèle de langage avec une mémoire externe que l'on peut mettre à jour sans réentraîner tout le modèle.

Le deuxième bénéfice, c'est l'accès aux **données privées**. Vos articles de support, procédures internes, contrats ou spécifications produit ne font généralement pas partie des données d'entraînement du modèle. En transformant ces documents en vecteurs avec le [embeddings guide](https://platform.openai.com/docs/guides/embeddings) puis en les stockant dans un système pensé pour la recherche de similarité, vous rendez cette connaissance récupérable. Des plateformes comme [Weaviate](https://weaviate.io/developers/weaviate) et [Qdrant](https://qdrant.tech/documentation/) sont faites pour cela : stocker des vecteurs avec leurs métadonnées, puis retrouver les bons morceaux quand un utilisateur pose une question.

Le troisième bénéfice, c'est le **grounding**, c'est-à-dire le fait d'ancrer la réponse dans des sources au lieu de laisser le modèle improviser seul. Je n'appellerais pas le RAG un bouton magique contre les hallucinations, parce que ce serait faux. En revanche, je le considère comme le réflexe de base dès qu'on attend des réponses justifiables par des documents.

Il y a aussi un gain très concret que les débutants sous-estiment souvent : le coût et la taille des prompts. Sans retrieval, les équipes ont tendance à empiler énormément de texte dans chaque requête « au cas où ». C'est lent, coûteux et vite illisible. Le RAG permet d'envoyer un contexte plus petit et mieux ciblé. Mon avis est assez net là-dessus : dès que la base de connaissance dépasse ce qu'un humain raisonnable collerait à la main dans un prompt, la retrieval devient plus saine que le prompt stuffing.

La découverte un peu tardive, chez beaucoup d'équipes, c'est que le RAG ne répare pas une mauvaise documentation. Si vos sources sont obsolètes, contradictoires ou écrites uniquement pour des experts internes, le modèle héritera de cette confusion. La retrieval donne accès à des preuves. Elle n'améliore pas la qualité de la preuve.

Je choisirais le RAG quand la connaissance change régulièrement, appartient à votre organisation, ou quand les utilisateurs attendent des réponses sourcées. Je l'éviterais pour une mini FAQ avec cinq réponses stables. Une bonne règle tient en une phrase : si le contenu change plus que quelques fois par an, ou si les réponses doivent venir de documents que vous contrôlez, le RAG vaut généralement l'effort. Le guide suivant montre l'autre face du problème : ce qu'un LLM ne fait pas de manière fiable quand on lui retire cette couche de retrieval.
