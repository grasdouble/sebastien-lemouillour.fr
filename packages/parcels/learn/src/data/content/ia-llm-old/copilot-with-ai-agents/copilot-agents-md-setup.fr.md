---
id: copilot-agents-md-setup
order: 2
difficulty: beginner
tags: [copilot, agents-md, configuration]
publishedAt: 2026-05-15
updatedAt: 2026-05-30
---

Tu as probablement déjà vu ça : Copilot réussit une tâche, ouvre le fichier suivant, puis agit soudain comme si ton projet n'avait aucune histoire. Il oublie la commande de test, invente une règle de nommage, et modifie la mauvaise couche avec une confiance presque joyeuse.

GitHub appelle ça des instructions personnalisées : `.github/copilot-instructions.md` pour les règles globales du dépôt, des fichiers `.instructions.md` pour les règles ciblées par chemin, et des fichiers d'instructions pour agents comme `AGENTS.md` [GitHub Docs](https://docs.github.com/en/copilot/concepts/about-customizing-github-copilot-chat-responses). Si tu mets en place un workflow orienté agents, je commencerais par `AGENTS.md`. La [matrice de support](https://docs.github.com/en/copilot/reference/custom-instructions-support) montre que l'agent cloud de GitHub et Copilot CLI lisent tous les deux ce nom de fichier, donc c'est le point de départ le plus sûr quand tu veux une seule source pour les règles destinées aux agents.

## Ce que `AGENTS.md` règle vraiment

`AGENTS.md`, c'est simplement un fichier Markdown qui donne à un agent le contexte pénible que tu ne veux pas répéter : comment tester, ce qu'il ne faut pas toucher, et quelles conventions sont réelles. Dans VS Code, ce contexte influence le chat et le mode agent, pas les suggestions inline pendant que tu tapes [VS Code Docs](https://code.visualstudio.com/docs/copilot/customization/custom-instructions). Cette limite surprend souvent au début, donc autant la connaître tôt.

Une fois le fichier en place, tu arrêtes de bourrer chaque prompt avec les mêmes rappels. Le fichier porte les règles du projet, et ton prompt peut enfin parler du vrai travail.

## Commencer avec un seul fichier à la racine

GitHub explique que les agents Copilot peuvent utiliser des fichiers `AGENTS.md` partout dans un dépôt et choisir le plus proche, mais le guide de configuration pour VS Code précise aussi que la prise en charge des `AGENTS.md` en sous-dossiers reste désactivée par défaut aujourd'hui [guide de config](https://docs.github.com/en/copilot/how-tos/configure-custom-instructions-in-your-ide/add-repository-instructions-in-your-ide?tool=vscode). C'est pour ça que je garderais le premier jour très simple : un `AGENTS.md` à la racine du dépôt, tu regardes si ça supprime les erreurs qui reviennent, puis tu découpes plus tard seulement si un dossier a vraiment besoin d'autres règles.

Voici la plus petite version que je mettrais réellement en place au départ.

```markdown
# AGENTS.md

## Règles de travail

- Lance la commande de test documentée avant de terminer une modification.
- Demande avant d'ajouter une nouvelle dépendance d'exécution.
- Mets à jour la documentation quand un comportement public change.
```

## Si tu utilises aussi Claude Code

La portabilité devient vite agaçante. Les [OpenAI Docs](https://developers.openai.com/codex/guides/agents-md) expliquent que Codex lit `AGENTS.md` directement et empile les instructions générales puis les plus proches. Les [Claude docs](https://code.claude.com/docs/en/memory) expliquent que Claude Code utilise des fichiers `CLAUDE.md` pour les instructions de projet. À cause de ce décalage, je préfère dupliquer seulement les quelques règles qui comptent vraiment au lieu d'inventer un montage malin dès le premier jour.

Ce petit fichier compagnon suffit quand tu veux que les deux outils démarrent avec les mêmes habitudes.

```markdown
# CLAUDE.md

## Règles de travail

- Lance la commande de test documentée avant de terminer une modification.
- Demande avant d'ajouter une nouvelle dépendance d'exécution.
- Mets à jour la documentation quand un comportement public change.
```

## Quoi écrire dedans

Garde le fichier court, précis, et légèrement assumé. Un bon `AGENTS.md` ressemble à des notes laissées par une personne soigneuse, pas à une affiche de règles internes. Nomme les dossiers importants, écris la vraie commande de test, et note les deux ou trois erreurs que tu ne veux plus revoir.

Ce modèle reste volontairement générique, pour que tu puisses copier la forme sans récupérer les habitudes d'un autre projet.

```markdown
# AGENTS.md

## Carte du projet

- Le code de l'application vit dans `packages/my-app`.
- Les utilitaires partagés vivent dans `packages/my-shared`.

## Règles de code

- Préfère les imports depuis `@my/shared` au copier-coller de helpers.
- Garde les fonctions ciblées et nomme-les d'après ce qu'elles renvoient ou modifient.

## Workflow

- Lance `pnpm --filter my-app test` après un changement de comportement dans `packages/my-app`.
- Demande avant d'introduire une nouvelle dépendance d'exécution.

## Définition de terminé

- Mets à jour les tests quand le comportement change.
- Mets à jour la documentation quand l'installation ou le comportement public change.
```

Si un seul fichier à la racine suffit déjà à faire disparaître les erreurs répétées, arrête-toi là. Ajoute des instructions ciblées par chemin seulement quand un dossier a besoin de règles qui embrouilleraient le reste du dépôt. Ensuite, lis le guide sur les fichiers `.instructions.md` pour savoir quand il vaut mieux découper.
