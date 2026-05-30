---
id: api-vs-local-models
order: 1
difficulty: beginner
tags: [LLM, api, local, Ollama, HuggingFace]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

Vous avez bricolé votre première fonctionnalité LLM, et la question suivante arrive très vite : est-ce que ça doit appeler une API externe, ou faire tourner le modèle sur votre propre machine ? Beaucoup de débutants pensent que c'est un choix purement technique. En pratique, c'est surtout un choix d'exploitation.

Un modèle via API veut dire que vous envoyez une requête à un fournisseur qui héberge le modèle pour vous. Un modèle local veut dire que les poids, donc les paramètres appris par le modèle, tournent sur une machine que vous contrôlez, souvent avec un outil comme [Ollama](https://ollama.com/). Si vous voulez voir ce qui existe du côté open, le hub [Hugging Face](https://huggingface.co/models) est l'endroit où presque tout le monde finit par passer.

Mon réflexe est simple : je prends l'API presque à chaque fois. Pas parce que les modèles locaux sont mauvais, mais parce que les débutants sous-estiment souvent toute la partie pénible. Avec une API, vous évitez les téléchargements de modèles, le dimensionnement GPU, les mises à jour, la supervision, et la moitié des pannes bizarres qui arrivent tard le soir. Vous accédez aussi tout de suite à des modèles très solides, et la facture est lisible parce que les fournisseurs publient des tarifs au token, voir [OpenAI pricing](https://openai.com/api/pricing/) et [Anthropic pricing](https://www.anthropic.com/pricing/).

Les modèles locaux deviennent intéressants quand les contraintes sont réelles, pas théoriques. Si vous devez garder les données dans votre réseau, si l'application doit fonctionner hors ligne, ou si vous anticipez un gros volume prévisible, le local peut devenir le meilleur choix. Le prix à payer, c'est que vous devenez l'équipe d'hébergement. Vous devez penser à la RAM, à la mémoire GPU, aux cold starts, aux fichiers de modèles, à l'espace disque, à la concurrence, et à la question la plus importante : est-ce qu'un plus petit modèle suffit vraiment pour le travail demandé ?

C'est le morceau que beaucoup de tutoriels sautent : local ne veut pas dire gratuit automatiquement. Vous payez en temps d'ingénierie, en matériel, en électricité, et en support. API ne veut pas dire cher automatiquement non plus. Pour un produit jeune avec quelques centaines ou quelques milliers d'appels par jour, l'API est souvent le choix le moins coûteux parce que vous achetez de la vitesse, de la fiabilité, et moins de charge mentale côté exploitation.

Une règle simple aide bien au début :

- Choisissez l'API si vous validez un produit, si vous allez vite, ou si vous avez besoin de la meilleure qualité tout de suite.
- Choisissez le local si la conformité, le hors ligne, ou une frontière de données stricte existent déjà aujourd'hui.
- Ne choisissez pas le local juste parce que ça semble plus indépendant. L'indépendance est utile seulement si vous pouvez vraiment l'opérer.

L'erreur classique consiste à vouloir résoudre les deux problèmes en même temps. Commencez par décider ce dont l'application a besoin : meilleure qualité, moins d'opérations, confidentialité plus stricte, ou accès hors ligne. Ensuite, choisissez le mode de déploiement qui sert cette contrainte.

Et ensuite ? Si l'API vous attire mais reste floue, lisez le guide suivant sur le coût. C'est souvent au moment de projeter la facture mensuelle que l'intuition casse.
