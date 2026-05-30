---
id: embeddings
order: 11
difficulty: beginner
tags: [LLM, embeddings]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

Vous cherchez « comment résilier un abonnement », mais le document utile parle de « mettre fin à une souscription ». Une recherche par mots-clés peut passer à côté, et c’est frustrant parce qu’humainement le sens est proche. Les **embeddings** existent précisément pour ce genre de problème. Un embedding est une liste de nombres qui représente le sens d’un texte d’une manière que la machine peut comparer. Si je devais résumer leur intérêt en une phrase, je dirais ceci : ils aident les systèmes à repérer une proximité de sens, pas seulement un chevauchement de mots.

## Ce qu’est réellement un embedding

Le [guide embeddings](https://platform.openai.com/docs/guides/embeddings) d’OpenAI décrit les embeddings comme des vecteurs, c’est-à-dire des listes ordonnées de nombres. Ces nombres ne sont pas une explication lisible par un humain. Ce sont des coordonnées dans un espace mathématique où des textes similaires ont tendance à se retrouver proches.

Dit comme ça, c’est abstrait. L’image que je préfère est celle d’une immense carte. Des phrases de sens voisin s’y retrouvent dans le même quartier. « Hôtel pas cher » et « logement à petit budget » n’occupent pas exactement le même point, mais un bon modèle d’embeddings essaie de les placer dans la même zone.

Cette idée n’est pas tombée du ciel. Des travaux plus anciens comme [word2vec](https://arxiv.org/abs/1301.3781) ont montré comment apprendre des représentations numériques utiles à partir du langage. Les systèmes modernes ont étendu cette logique à des phrases entières, des paragraphes, des images, et bien plus.

## Comment on les utilise vraiment

L’usage le plus fréquent, c’est la **recherche sémantique**, c’est-à-dire le fait de retrouver du texte par le sens plutôt que par la formulation exacte. Sentence Transformers, présenté dans [SBERT](https://www.sbert.net/), a beaucoup simplifié cet usage pour comparer des phrases entières.

Un deuxième usage courant, c’est la recommandation. Si deux produits, deux articles ou deux tickets de support tombent près l’un de l’autre dans l’espace des embeddings, on peut suggérer l’un quand l’utilisateur consulte l’autre.

Un troisième usage, c’est le clustering, autrement dit le regroupement automatique d’éléments similaires. C’est très utile quand on a des milliers de commentaires ou de documents et qu’on veut faire émerger des thèmes.

Pour que cela reste rapide à grande échelle, on stocke souvent les embeddings dans des systèmes pensés pour la recherche de similarité. [FAISS](https://faiss.ai/) est un exemple très utilisé. Il permet de retrouver rapidement des vecteurs proches sans comparer chaque élément à tous les autres.

## Là où je les choisirais, et là où je ne les choisirais pas

Je prendrais des embeddings quand le problème porte sur la similarité, la recherche, le regroupement ou la recommandation. Je ne les prendrais pas comme réponse finale à un besoin où chaque fait doit déjà être exact et justifié. Un embedding peut signaler ce qui paraît lié. Il ne vérifie pas les faits à lui seul.

Cette différence est importante. Beaucoup de débutants imaginent que les embeddings « comprennent » le texte de manière presque magique. Ce n’est pas le cas. Ils compressent des régularités utiles du sens dans des nombres. C’est puissant, mais ça reste une approximation.

Une règle simple aide beaucoup : si les formulations changent mais que l’intention reste proche, les embeddings sont souvent un bon choix. Votre prochaine étape peut être très concrète : prenez cinq phrases presque équivalentes, ajoutez-en deux qui ne veulent pas dire la même chose, puis regardez comment un système de recherche basé sur des embeddings les rapproche ou les sépare. En général, c’est l’expérience la plus rapide pour que le concept devienne clair.
