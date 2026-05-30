---
id: vector-search
order: 5
difficulty: beginner
tags: [RAG, LLM, vectors, FAISS]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

Vous avez 40 000 morceaux de documentation, un utilisateur pose une question, et vous devez retrouver les trois bons passages assez vite pour que l'application reste agréable. Lire tous les morceaux un par un fonctionnerait en théorie, mais serait insupportable en pratique. La recherche vectorielle est le raccourci qui rend la retrieval sémantique utilisable.

L'idée de base est la suivante. On transforme d'abord chaque chunk de document en vecteur grâce au [embeddings guide](https://platform.openai.com/docs/guides/embeddings). On fait ensuite la même chose pour la question de l'utilisateur. Au lieu de chercher des mots identiques, on cherche les vecteurs les plus proches du vecteur de la requête. « Proches » signifie ici les plus similaires selon une mesure mathématique de distance ou de similarité. Le résultat est une liste de chunks qui parlent probablement du même sujet.

Cette étape de recherche a besoin d'un index, c'est-à-dire d'une structure de données optimisée pour retrouver rapidement les voisins les plus pertinents. [FAISS](https://faiss.ai/) est l'un des outils classiques pour ce travail. Il est devenu populaire parce qu'il offre une recherche de similarité vectorielle efficace sans exiger toute une plateforme autour. Si vous avez besoin d'une expérience plus complète, avec filtres, API et fonctionnalités d'exploitation, des outils comme [Weaviate](https://weaviate.io/developers/weaviate) et [Qdrant](https://qdrant.tech/documentation/) sont pensés pour ce type de workflow.

Un bon [Pinecone guide](https://www.pinecone.io/learn/vector-search/) montre bien pourquoi cette approche compte autant pour la retrieval moderne : la recherche vectorielle permet de retrouver des documents par le sens, pas seulement par la formulation exacte. Si un utilisateur demande « comment me faire rembourser ? », le système peut quand même retrouver un chunk intitulé « politique de remboursement », même si les mots ne coïncident pas parfaitement.

Mon avis est assez ferme : les débutants se focalisent souvent trop sur la base de données, et pas assez sur les données elles-mêmes. Le moteur vectoriel compte, bien sûr, mais la qualité de la retrieval dépend bien plus souvent du chunking, des métadonnées, de la propreté des documents et de la manière dont on évalue le système. Si vos chunks sont trop gros, trop bruités, ou privés de contexte essentiel, la base la plus brillante du monde renverra quand même des résultats médiocres.

Je démarrerais plus simplement que la plupart des schémas d'architecture. Pour un prototype modeste, un index FAISS local suffit souvent à apprendre presque tout ce qu'il faut comprendre sur la retrieval dans un RAG. Passez à une vraie base vectorielle quand vous avez besoin de filtres sur les métadonnées, d'une infrastructure multi-utilisateur, de réplication ou d'un meilleur confort d'exploitation. Pas besoin de jouer au système distribué dès le premier jour.

Une règle utile tient bien : si vous pouvez encore inspecter tout le corpus à la main en quelques minutes, commencez par l'installation vectorielle la plus simple qui marche. Quand l'échelle, les filtres ou le travail en équipe deviennent pénibles, vous aurez alors une bonne raison d'accepter plus de complexité. Le guide suivant s'attaque au mot « proche », pour que tout cela semble moins magique : les vecteurs et la distance.
