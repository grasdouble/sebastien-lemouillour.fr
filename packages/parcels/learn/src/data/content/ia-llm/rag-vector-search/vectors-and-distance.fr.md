---
id: vectors-and-distance
order: 6
difficulty: beginner
tags: [RAG, LLM, vectors, cosine]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

Votre système de recherche dit qu'un document est « plus proche » de la question qu'un autre, et ce mot peut vite sembler très flou. Plus proche selon quoi ? Tant qu'on ne répond pas clairement à cette question, la recherche vectorielle reste magique dans le mauvais sens du terme.

Un **vecteur**, ici, n'est qu'une liste ordonnée de nombres. En retrieval, un modèle d'embedding associe chaque texte à l'une de ces listes, comme l'explique le [embeddings guide](https://platform.openai.com/docs/guides/embeddings). On peut imaginer chaque vecteur comme un point dans un espace à très grande dimension. « Grande dimension » signifie simplement qu'il y a beaucoup de coordonnées, bien plus que les deux ou trois dimensions qu'on peut dessiner facilement.

Une fois les textes transformés en points, il faut une règle pour décider quels points sont proches. Cette règle, c'est la **métrique de distance** ou de similarité. La plus courante dans les projets RAG débutants est la [cosine similarity](https://en.wikipedia.org/wiki/Cosine_similarity). Elle compare surtout l'angle entre les vecteurs, plus que leur longueur brute. En langage simple, elle demande : « est-ce que ces vecteurs pointent dans une direction proche ? » Pour la retrieval sémantique, cette intuition colle souvent assez bien à ce qu'on cherche.

Il existe d'autres métriques. Certains systèmes utilisent le produit scalaire. D'autres utilisent la distance euclidienne, c'est-à-dire la distance « à vol d'oiseau » que beaucoup de gens ont vue à l'école. Des outils comme [Qdrant](https://qdrant.tech/documentation/) et [FAISS](https://faiss.ai/) proposent plusieurs choix, parce que différents modèles d'embedding et différents usages se comportent mieux avec différentes métriques.

La partie que la plupart des tutoriels sautent, c'est que les nombres absolus comptent rarement pour un humain. Un score de similarité à 0,82 n'est pas « bon » dans l'absolu. Il n'a de sens que comparé aux autres candidats pour la même requête, ou à des scores observés pendant vos évaluations. Beaucoup de débutants fixent le chiffre lui-même alors qu'ils devraient regarder le classement et les documents réellement retrouvés.

Mon conseil par défaut est volontairement peu spectaculaire : pour la recherche de texte, commencez avec la cosine similarity, sauf si la documentation du modèle d'embedding recommande autre chose. Pas parce que la cosine serait toujours la meilleure, mais parce qu'aligner la métrique avec la recommandation du modèle évite très tôt des erreurs discrètes et agaçantes. La deuxième chose que je ferais, c'est d'inspecter manuellement de vrais résultats avant d'inventer des seuils.

Si tout cela reste abstrait, c'est normal. Pour moi, c'est devenu concret quand j'ai comparé une douzaine de vraies requêtes et observé comment le classement changeait selon les métriques. C'est une très bonne expérience à faire ensuite. Après ça, le guide que je lirais naturellement est celui sur les bases de données vectorielles, parce que les métriques deviennent plus faciles à raisonner quand on voit enfin l'endroit où elles vivent dans un système réel.
