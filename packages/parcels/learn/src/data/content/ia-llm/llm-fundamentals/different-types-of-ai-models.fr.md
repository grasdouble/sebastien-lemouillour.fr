---
id: different-types-of-ai-models
order: 6
difficulty: beginner
tags: [llm]
publishedAt: 2026-05-31
updatedAt: 2026-05-31
---

Vous ouvrez un outil IA et vous voyez « classifier ». Vous en ouvrez un autre et vous voyez « LLM », pour **large language model**, autrement dit un grand modèle de langage. Un troisième promet du « raisonnement multimodal ». On a vite l'impression d'entrer dans un magasin de bricolage où toutes les boîtes sont étiquetées dans une langue qu'on ne parle pas encore. Le moyen le plus rapide de faire baisser cette confusion, ce n'est pas de mémoriser des noms de modèles. C'est de poser d'abord une seule question : quel type de sortie vous faut-il vraiment ?

### Commencez par la sortie

Si vous avez besoin qu'un modèle choisisse une étiquette comme « spam » ou « pas spam », vous êtes dans la **classification**. Google définit la classification comme la tâche qui consiste à prédire à quelle classe, donc à quelle catégorie, appartient un exemple ([Google classification](https://developers.google.com/machine-learning/crash-course/classification)). Si vous avez besoin d'un nombre comme un prix ou un délai de livraison, vous êtes dans la **régression**, qui prédit une valeur numérique à partir de données ([Google regression](https://developers.google.com/machine-learning/crash-course/linear-regression)).

Les deux appartiennent en général à l'**apprentissage supervisé**, ce qui veut dire que le modèle apprend à partir d'exemples qui contiennent déjà la bonne réponse. Si j'avais des données bien étiquetées et un critère de réussite clair, je commencerais ici avant de toucher à un modèle génératif. C'est moins coûteux, plus simple à déboguer et, la plupart du temps, plus facile à expliquer.

### Et si vous n'avez pas encore les bonnes réponses ?

Parfois, vous avez des données mais pas d'étiquettes, donc personne n'a marqué chaque exemple avec la bonne catégorie. Vous passez alors à l'**apprentissage non supervisé**. L'exemple le plus parlant pour un débutant est le **clustering**, qui regroupe ensemble des exemples non étiquetés mais similaires ([Google clustering](https://developers.google.com/machine-learning/clustering/overview)).

Cela règle un premier problème, mais pas le suivant. Les jeux de données réels peuvent avoir trop de **dimensions**, c'est-à-dire trop de caractéristiques numériques à comparer confortablement. Les **embeddings** sont des représentations numériques compactes qui placent les éléments similaires plus près les uns des autres dans un espace plus petit, ce qui explique leur utilité pour la recherche et les recommandations ([Google embeddings](https://developers.google.com/machine-learning/crash-course/embeddings/video-lecture)).

### Et si le système doit apprendre par essai-erreur ?

Certains problèmes ressemblent moins au tri d'e-mails qu'à l'apprentissage d'un jeu. En **apprentissage par renforcement**, ou **RL**, le modèle progresse en prenant des actions puis en recevant des récompenses ou des pénalités. L'image mentale la plus simple, c'est un joueur qui gagne des points quand il fait un bon coup. [AlphaGo](https://www.nature.com/articles/nature16961) de DeepMind est l'exemple célèbre : le système a appris à jouer au Go grâce au renforcement et à l'auto-jeu, pas à partir d'un joli tableau rempli de bonnes réponses.

Je n'irais vers le RL que si la tâche est vraiment interactive, parce que c'est bien plus difficile à entraîner et à évaluer que l'apprentissage supervisé de base.

### Quand les modèles génératifs et multimodaux deviennent-ils utiles ?

Si le travail consiste à produire un nouveau texte, une image ou de l'audio, vous êtes dans l'**IA générative**. Un modèle **multimodal** va un cran plus loin et gère plusieurs types de données dans le même système, par exemple du texte et une image. Les [Gemini docs](https://ai.google.dev/gemini-api/docs/models) décrivent des modèles qui travaillent avec du texte, des images, de l'audio et de la vidéo, ce qui correspond bien au sens pratique de « multimodal » pour un débutant.

C'est là que tout le bruit médiatique se concentre, mais je le traiterais comme un dernier recours, pas comme le choix par défaut. Si votre tâche a une seule bonne réponse que vous pouvez mesurer, un classificateur ou un régresseur est en général le pari le plus raisonnable.

Si je devais traduire toute cette théorie en vrais choix produit, c'est ce tableau de comparaison que je garderais sous la main :

| Type de modèle                      | Ce qu'il produit                                                                   | Entrées typiques                                                                | Cas d'usage typiques                                                     |
| ----------------------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Modèle de classification            | Une étiquette parmi un ensemble fermé                                              | Des variables structurées, du texte ou des signaux associés à des labels connus | Détection de spam, signalement de fraude, routage de tickets             |
| Modèle de régression                | Une valeur numérique                                                               | Des exemples historiques avec un résultat mesurable                             | Estimation de prix, prédiction de délai, prévision de demande            |
| Modèle de clustering                | Des groupes ou segments                                                            | Des exemples non étiquetés décrits par des caractéristiques comparables         | Segmentation clients, regroupement d'anomalies, exploration de dataset   |
| Modèle d'embeddings                 | Un vecteur numérique                                                               | Du texte, des images ou d'autres contenus qu'on veut comparer par le sens       | Recherche sémantique, recommandations, déduplication                     |
| Modèle de génération de texte (LLM) | Un nouveau texte                                                                   | Des prompts, des instructions, un historique de conversation, des documents     | Rédaction, résumé, reformulation, extraction avec garde-fous             |
| Modèle de génération d'images       | De nouvelles images                                                                | Des prompts textuels, des images de référence, des indications de style         | Concept art, visuels marketing, maquettes                                |
| Modèle multimodal                   | Du texte, des réponses structurées ou des actions appuyées sur plusieurs modalités | Un mélange de texte, d'images, d'audio ou de vidéo                              | Questions-réponses sur image, compréhension de documents, agents visuels |

Voici un résumé des six familles pour garder la vue d'ensemble :

| Famille                        | Type de sortie                | Exemple concret      | Choisir quand                                                         |
| ------------------------------ | ----------------------------- | -------------------- | --------------------------------------------------------------------- |
| Classification                 | Étiquette discrète            | Filtre anti-spam     | La réponse est une catégorie parmi un ensemble fixe                   |
| Régression                     | Valeur numérique              | Estimation de prix   | La réponse est un nombre continu                                      |
| Clustering                     | Groupes                       | Segmentation clients | Pas d'étiquettes, on cherche une structure cachée                     |
| Embeddings                     | Vecteur numérique             | Recherche sémantique | Similarité, recommandation, réduction de dimensions                   |
| Apprentissage par renforcement | Action dans un environnement  | AlphaGo              | La tâche est interactive avec récompenses et pénalités                |
| IA générative                  | Texte, image ou audio nouveau | ChatGPT, DALL-E      | La sortie est ouverte et ne se mesure pas par une seule bonne réponse |

Mon seuil est simple : si la réussite se mesure avec une réponse clairement correcte, commencez par la classification ou la régression ; ne passez à un générateur que si la tâche est vraiment ouverte.
