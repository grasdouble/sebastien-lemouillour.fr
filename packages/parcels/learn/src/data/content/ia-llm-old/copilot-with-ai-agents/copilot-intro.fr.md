---
id: copilot-intro
order: 1
difficulty: beginner
tags: [agents, copilot, github]
publishedAt: 2026-05-15
updatedAt: 2026-05-30
---

Copilot devient vite bizarre quand il utilise `npm` dans un projet `pnpm`, invente une commande de test, ou modifie le mauvais fichier avec un aplomb total. La plupart du temps, le vrai problème ne vient pas du modèle. Le vrai problème, c'est qu'on demande à un outil généraliste de bien se comporter dans un projet très spécifique.

C'est pour ça que je vois GitHub Copilot comme trois métiers différents, pas comme un assistant magique un peu flou. Dès que j'ai fait cette séparation dans ma tête, son comportement est devenu beaucoup plus lisible.

## Trois métiers sous la même marque

Les [suggestions de code](https://docs.github.com/en/copilot/concepts/completions/code-suggestions) sont les propositions qui apparaissent directement dans l'éditeur pendant que tu tapes. Dans certains IDE, ça inclut le ghost text, c'est-à-dire du texte affiché en grisé avant ton curseur, et les next edit suggestions, qui proposent une modification plus large juste après. J'utilise ça quand je sais déjà ce que je veux écrire et que j'ai juste envie de taper moins.

[Copilot Chat](https://docs.github.com/en/copilot/concepts/about-github-copilot-chat), c'est la version conversationnelle. Tu poses une question en langage naturel, et Copilot répond dans une fenêtre de chat sur GitHub, dans plusieurs IDE, sur GitHub Mobile ou dans Copilot CLI. C'est le bon outil quand tu veux une explication, un brouillon de refactor, ou une première ébauche de tests que tu vas quand même relire toi-même. Utile, oui. Magique, non.

Quand la tâche dépasse une seule réponse, [Copilot cloud agent](https://docs.github.com/en/copilot/concepts/agents/cloud-agent/about-cloud-agent) peut analyser un dépôt, préparer un plan, modifier du code sur une branche, c'est-à-dire une ligne de travail séparée dans Git, et exécuter des tests ou des vérifications de lint, donc des contrôles automatiques de qualité, dans son propre environnement temporaire avant que tu décides d'ouvrir ou non une pull request. C'est le moment où Copilot ressemble moins à de l'autocomplétion et davantage à un collègue junior très rapide qui a encore besoin de supervision.

## Pourquoi le contexte cesse d'être optionnel

Dès qu'on passe des suggestions au chat ou au mode agent, les prompts vagues deviennent chers. Copilot CLI prend en charge les [instructions personnalisées](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/add-custom-instructions), y compris les instructions globales au dépôt, les instructions par chemin, et les instructions d'agent comme `AGENTS.md`. Moi, je choisirais des instructions écrites bien avant d'essayer un mega-prompt malin, parce que des fichiers sont visibles, répétables, et beaucoup plus simples à relire.

Un petit fichier `AGENTS.md` suffit souvent à éviter les erreurs les plus prévisibles, donc voilà le genre de base avec laquelle je commencerais :

```md
# AGENTS.md

- Use pnpm, never npm.
- Run tests and lint checks before saying the work is done.
- Do not edit generated files by hand.
- Prefer accessible HTML and visible focus states.
```

## Ce que la mémoire change, et ce qu'elle ne change pas

[Copilot Memory](https://docs.github.com/en/copilot/concepts/agents/copilot-memory) est en préversion publique. Elle peut stocker des faits sur le dépôt et, pour les utilisateurs Copilot Pro, Pro+ ou Max, des préférences personnelles pour les travaux suivants. J'aime bien cette fonctionnalité, mais je n'en ferais pas mon point de départ. Les mémoires inutilisées sont supprimées après 28 jours, donc je la traite comme une aide, et les fichiers d'instructions versionnés comme la vraie source de vérité.

## Par où je commencerais

Si Copilot t'aide surtout à terminer du code que tu comprends déjà, commence par les suggestions de code. Si tu veux des explications ou des brouillons, utilise le chat. Si tu veux qu'il modifie plusieurs fichiers ou lance des commandes, écris d'abord des instructions de dépôt. Si cette frontière te paraît encore floue, lis le guide suivant sur les instructions personnalisées avant d'essayer les agents. Ma règle est simple : pas d'instructions dans le dépôt, pas d'agent pour autre chose qu'un tout petit nettoyage.
