---
id: vectors-and-distance
order: 6
difficulty: beginner
tags: [RAG, LLM, vectors, cosine]
publishedAt: 2099-12-31
updatedAt: 2026-05-31
---

Vous posez une question, la recherche renvoie un score comme 0,82, et vous ne savez toujours pas si vous pouvez lui faire confiance. Cette confusion est normale. « Plus proche » a l'air précis, mais tant qu'on ne sait pas ce que le système mesure, la recherche vectorielle ressemble à une boîte noire.

La première idée utile est simple : un **modèle d'embedding**, c'est-à-dire un modèle qui transforme un texte en nombres, produit un **vecteur**, donc une liste ordonnée de nombres, comme l'expliquent les [docs OpenAI](https://platform.openai.com/docs/guides/embeddings). Vous pouvez imaginer ce vecteur comme un point dans un immense espace. Immense veut seulement dire qu'il y a beaucoup de coordonnées, pas qu'il se passe quelque chose de magique.

Dès que chaque texte devient un point, un nouveau problème apparaît : que veut dire « proche » ? C'est le rôle d'une **métrique de similarité**. Les [docs Google ML](https://developers.google.com/machine-learning/clustering/dnn-clustering/supervised-similarity) sont très utiles ici : la similarité cosinus compare surtout la direction, le produit scalaire dépend de la direction et de la longueur du vecteur, et la distance euclidienne mesure la distance géométrique entre deux points. Pour une recherche sémantique débutante, je partirais d'une image simple : avec le cosinus, on demande surtout si deux flèches pointent globalement dans la même direction.

Ce choix n'est pas seulement théorique. Les vrais moteurs de recherche vectorielle l'exposent comme un réglage. Les [docs Elastic](https://www.elastic.co/docs/reference/elasticsearch/mapping-reference/dense-vector) définissent la recherche des k plus proches voisins comme la recherche des vecteurs les plus proches selon une métrique de similarité, ce qui explique pourquoi deux systèmes peuvent classer différemment les mêmes documents tout en stockant les mêmes embeddings.

Un détail enlève beaucoup de confusion au début. Les [docs FAISS](https://github.com/facebookresearch/faiss/wiki/MetricType-and-distances) expliquent qu'on peut implémenter la similarité cosinus en normalisant les vecteurs puis en utilisant le produit scalaire. Le cosinus n'est donc pas une troisième magie cachée. C'est souvent une manière particulière de préparer les vecteurs avant la comparaison.

Ma règle de début est volontairement peu glamour, justement parce que les règles peu glamour aident quand le sujet reste flou : commencez par la métrique recommandée par la documentation de votre modèle d'embedding ou de votre base vectorielle, et si rien n'est précisé, partez sur le cosinus pour la recherche de texte. Je n'inventerais pas de seuil fixe dès le premier jour, parce qu'un nombre comme 0,82 dit peu de choses tout seul. Regardez d'abord le classement sur au moins vingt vraies requêtes, et gardez la limite principale en tête : un score élevé veut seulement dire « proche selon cette métrique », pas « forcément correct ».

Si vous voulez que la suite devienne plus concrète, lisez juste après ce guide celui sur les bases de données vectorielles. Voir l'endroit exact où la métrique se configure rend le sujet beaucoup moins abstrait.
