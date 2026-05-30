---
id: api-vs-local-models
order: 1
difficulty: beginner
tags: [LLM, api, local, Ollama, HuggingFace]
publishedAt: 2099-12-31
updatedAt: 2026-05-31
---

Vous avez bricolé une petite fonctionnalité avec un LLM, un grand modèle de langage, peut-être un assistant de réponse ou un outil de recherche, et vous tombez vite sur le premier vrai carrefour : envoyer les prompts, c'est-à-dire les instructions texte envoyées au modèle, vers une API hébergée, ou faire tourner le modèle sur une machine que vous contrôlez ? Si ça vous semble encore abstrait, pas de panique, pour moi aussi ça a vraiment cliqué le jour où j'ai chiffré les deux options sur un cas concret.

Un modèle via API signifie qu'un fournisseur héberge le modèle et que vous l'appelez par le réseau, comme avec [OpenAI API](https://platform.openai.com/docs/overview) ou [Anthropic API](https://docs.anthropic.com/en/api/overview). Un modèle local signifie que les poids du modèle, donc les nombres appris pendant l'entraînement, tournent sur votre laptop ou votre serveur, souvent avec [Ollama](https://docs.ollama.com/). Si vous voulez voir pourquoi le mot "local" cache quand même une énorme quantité de choix, ouvrez [Hugging Face](https://huggingface.co/models) deux minutes et regardez le nombre de modèles, de tailles et de formats de fichiers à trier.

Moi, je commencerais par une API presque à chaque fois. Ce n'est pas parce que les modèles locaux sont inutiles. C'est parce que les API hébergées enlèvent les tâches que les débutants oublient presque toujours de compter : télécharger des fichiers de modèles, vérifier s'il faut un processeur graphique, souvent appelé GPU, mettre à jour l'environnement d'exécution, surveiller les pannes, et absorber les pics de trafic. Le vrai cadeau, c'est la concentration : vous restez sur le produit au lieu de devenir l'équipe infra par accident. En plus, l'estimation des coûts est plus simple au départ, parce que les fournisseurs publient leurs tarifs au token dans [OpenAI pricing](https://openai.com/api/pricing) et [Anthropic pricing](https://platform.claude.com/docs/en/about-claude/pricing).

Le local devient intéressant quand la contrainte existe vraiment dès le premier jour. Si l'application doit fonctionner hors ligne, si vos règles interdisent de faire sortir les prompts de votre environnement, ou si vous savez déjà que le volume sera gros et prévisible, alors le local peut devenir le meilleur pari. Le piège, c'est que vous récupérez aussi le vocabulaire pénible : la RAM, c'est la mémoire de travail de la machine ; la mémoire GPU, c'est la mémoire rapide des cartes graphiques dont beaucoup de modèles ont besoin ; un cold start, c'est le délai pendant lequel le modèle se charge avant de répondre ; la concurrence, c'est le nombre de requêtes que vous voulez traiter en même temps. Rien d'impossible là-dedans, mais c'est beaucoup plus de travail que le petit "on va juste le faire tourner en local".

Si vous voulez une règle que j'assumerais vraiment, la voici :

- Commencez par une API si vous êtes encore en train de valider la fonctionnalité, si vous voulez la meilleure qualité tout de suite, ou si vous cherchez à réduire les surprises côté exploitation.
- Commencez en local uniquement si le hors ligne, des règles très strictes sur l'endroit où les données peuvent aller, ou un volume élevé et prévisible sont déjà des contraintes non négociables.
- Ne choisissez pas le local juste pour le petit frisson de l'indépendance. L'indépendance à 14 h, c'est sympa ; l'indépendance à 2 h du matin quand le modèle ne charge plus, c'est une autre histoire.

Si ça reste un peu flou, gardez ce seuil simple : si vous n'avez pas aujourd'hui une contrainte forte de hors ligne ou d'emplacement des données, je choisirais l'API d'abord et je réévaluerais le local plus tard. Ensuite, enchaînez avec le guide sur le coût, parce que c'est souvent là qu'une intuition devient une vraie décision.
