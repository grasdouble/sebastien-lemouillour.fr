---
id: embeddings
order: 11
difficulty: beginner
tags: [LLM, embeddings]
publishedAt: 2026-05-15
updatedAt: 2026-05-31
---

Vous cherchez « comment résilier un abonnement », mais la page dit « mettre fin à votre souscription ». La recherche par mots-clés hausse les épaules, et vous vous dites : « franchement, c’est la même idée ». Si le problème est « même sens, mots différents », un embedding est souvent le premier outil que je choisirais.

## Ce qu’est réellement un embedding

Le [guide embeddings](https://platform.openai.com/docs/guides/embeddings) d’OpenAI décrit un embedding comme un vecteur, c’est-à-dire une liste ordonnée de nombres, et explique que la distance entre deux vecteurs mesure à quel point deux textes sont liés. Ces nombres ne sont pas un résumé secret lisible par un humain. Ce sont des coordonnées qui permettent à une machine de comparer le sens.

Dit comme ça, c’est froid et très mathématique, donc je préfère l’image d’une carte. Les phrases de sens voisin vivent dans le même quartier. « Hôtel pas cher » et « logement à petit budget » ne tombent pas au même point, mais un bon modèle d’embeddings essaie de les garer dans la même zone.

Cette astuce a des racines plus anciennes que beaucoup de débutants l’imaginent. Le [papier word2vec](https://arxiv.org/abs/1301.3781) a montré très tôt qu’on pouvait transformer le langage en vecteurs qui capturent des régularités utiles. Les modèles d’embeddings modernes font la même chose avec un contexte plus riche.

## Comment on les utilise vraiment

Une fois qu’on peut comparer le sens avec une distance, la vraie question devient pratique : à quoi ça sert ? Le [module embeddings](https://developers.google.com/machine-learning/crash-course/embeddings/) de Google met en avant la recherche, le regroupement et les recommandations comme usages classiques. En clair, cela permet de retrouver un texte lié même si la formulation change, de regrouper des documents similaires sans tout trier à la main, et de suggérer des éléments proches par le sens.

Si je devais choisir un premier usage pour débuter, je prendrais la recherche sémantique, c’est-à-dire la recherche par le sens plutôt que par les mots exacts. Le [papier SBERT](https://arxiv.org/abs/1908.10084) a rendu la similarité entre phrases beaucoup plus pratique en produisant des embeddings de phrases qu’on peut comparer efficacement.

Cette commodité crée un nouveau problème : la vitesse. Quand vous avez des milliers ou des millions de vecteurs, tout comparer à tout devient coûteux. Des outils comme [FAISS](https://faiss.ai/) existent précisément pour ça, parce qu’ils sont conçus pour faire de la recherche de similarité et du regroupement efficacement sur de grandes collections de vecteurs.

## Là où je les choisirais, et là où je m’arrêterais

Voici ma position : utilisez des embeddings quand la formulation change mais que l’intention reste proche. Ne les traitez pas comme une machine à vérité. OpenAI présente les embeddings comme un moyen de mesurer la proximité entre textes, ce qui est parfait pour classer ce qui semble lié et inutile pour prouver qu’une affirmation est correcte.

Si vous voulez une prochaine étape concrète, créez un mini jeu de recherche avec cinq phrases presque équivalentes et deux intruses évidentes, puis regardez à la main les voisins les plus proches. Si le travail consiste à « trouver des éléments liés », les embeddings sont un très bon choix par défaut. Si le travail consiste à « vérifier un fait », arrêtez-vous là et ajoutez une étape de vérification avant de faire confiance au résultat.
