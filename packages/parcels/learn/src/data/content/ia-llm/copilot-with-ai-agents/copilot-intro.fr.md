---
id: copilot-intro
order: 1
difficulty: beginner
tags: [copilot, ai-agents, github]
publishedAt: 2026-12-31
updatedAt: 2026-12-31
---

Copilot devient vite étrange quand il utilise `npm` dans un projet `pnpm`, invente une commande de test, ou modifie le mauvais fichier avec un aplomb presque insultant. Dans la plupart des cas, le problème ne vient pas du modèle. Le problème, c'est qu'on demande à un outil généraliste d'agir dans un projet très spécifique.

C'est pour ça que je préfère voir GitHub Copilot comme trois métiers différents, pas comme un assistant magique un peu flou.

## Trois métiers sous la même marque

Les [suggestions de code](https://docs.github.com/en/copilot/concepts/completions/code-suggestions) sont les propositions inline qui apparaissent pendant que tu tapes. Dans certains IDE, ça inclut le ghost text classique et les next edit suggestions. J'utilise ce mode quand je connais déjà la forme du code et que j'ai juste envie d'arrêter de faire du travail à la chaîne avec mes doigts.

[Copilot Chat](https://docs.github.com/en/copilot/concepts/about-github-copilot-chat), c'est la couche conversationnelle. Il est disponible dans GitHub, plusieurs IDE, GitHub Mobile et Copilot CLI. C'est le bon outil quand tu veux une explication, une première version de refactor, ou un brouillon de tests que tu vas quand même relire toi-même. Utile, oui. Magique, non. Il faut toujours lire ce qu'il a produit.

Quand la tâche dépasse une simple réponse, [Copilot cloud agent](https://docs.github.com/en/copilot/concepts/agents/cloud-agent/about-cloud-agent) peut analyser un dépôt, préparer un plan d'implémentation, modifier du code sur une branche, exécuter des tests et des linters dans son propre environnement, puis préparer une pull request pour relecture. C'est là que Copilot cesse de ressembler à de l'autocomplétion et commence à ressembler à un collègue junior très rapide qui a parfois besoin qu'on lui rappelle le monde réel.

## Pourquoi le contexte cesse d'être optionnel

Dès qu'on passe des suggestions au chat ou au travail en mode agent, les prompts vagues deviennent chers. Copilot CLI prend en charge les [instructions personnalisées](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/add-custom-instructions), y compris les instructions globales au dépôt, les instructions par chemin, et les instructions d'agent comme `AGENTS.md`. En pratique, je préfère écrire ces règles une bonne fois plutôt que répéter le même prompt vingt fois et faire semblant que c'est une méthode.

Un petit fichier `AGENTS.md` suffit souvent à éviter les bêtises les plus prévisibles, donc voilà le genre de base que j'aime poser dès le début :

```md
# AGENTS.md

- Use pnpm, never npm.
- Run lint and build before proposing completion.
- Do not edit generated files by hand.
- Prefer accessible HTML and visible focus states.
```

## Ce que la mémoire change, et ce qu'elle ne change pas

[Copilot Memory](https://docs.github.com/en/copilot/concepts/agents/copilot-memory) est en préversion publique. Elle peut stocker des faits au niveau du dépôt et, pour les utilisateurs Copilot Pro, Pro+ ou Max, des préférences utilisateur qui aideront plus tard Copilot cloud agent, la revue de code et Copilot CLI. J'aime bien cette fonctionnalité, mais je n'en ferais pas ma première ligne de défense. Les entrées inutilisées sont supprimées automatiquement après 28 jours. Un fichier d'instructions versionné est banal, explicite, et visible en revue de code, ce qui est précisément la raison pour laquelle je lui fais plus confiance.

## Par où commencer

Si Copilot t'aide surtout à terminer des lignes que tu allais déjà écrire, commence par les suggestions de code et arrête-toi là. Si tu veux qu'il explique du code ou prépare des tests, utilise le chat. Si tu veux qu'il touche à plusieurs fichiers ou lance des commandes, ajoute d'abord des instructions au dépôt. C'est ma règle perso : pas d'instructions dans le dépôt, pas d'agent sur autre chose qu'un nettoyage trivial.
