---
id: copilot-agents-md-setup
order: 2
difficulty: beginner
tags: [copilot, agents-md, configuration]
---

Tu as commencé à utiliser Copilot. Les suggestions sont utiles, le chat répond bien. Et puis tu remarques quelque chose d'agaçant : à chaque nouvelle session, il repart de zéro. Il utilise `npm` alors que ton projet est sous `pnpm`. Il essaie de commiter du code alors que tu lui as déjà dit de ne pas le faire la semaine dernière. Il ignore les conventions d'accessibilité que tu as pourtant bien expliquées.

Ce n'est pas un bug. Copilot n'a pas de mémoire entre les sessions. `AGENTS.md` est la solution à ça.

## Ce que fait ce fichier

`AGENTS.md` est un fichier texte à la racine de ton projet que les agents Copilot lisent automatiquement au démarrage d'une session. Tout ce que tu y mets devient du contexte permanent : l'agent le connaît sans que tu aies besoin de le répéter.

C'est la différence entre devoir briefer un prestataire à chaque réunion et avoir un document d'onboarding qu'il lit une fois. Le contenu reste le même, mais tu n'as plus à y penser.

## Le lien symbolique vers copilot-instructions.md

GitHub Copilot dans VS Code lit ses instructions depuis `.github/copilot-instructions.md`. C'est le fichier officiel reconnu par l'éditeur.

Le problème : d'autres agents (Claude Code, OpenCode, certains outils basés sur MCP) préfèrent lire `AGENTS.md` à la racine du projet. Si tu maintiens deux fichiers séparés, tu vas inévitablement les laisser diverger.

La solution : un **lien symbolique**. Un seul fichier source, deux chemins d'accès.

```bash
# Depuis la racine du projet
ln -s ../AGENTS.md .github/copilot-instructions.md
```

Après ça, tu n'as qu'un seul fichier à maintenir (`AGENTS.md`), et tous les outils qui lisent l'un ou l'autre chemin obtiennent les mêmes instructions. Le lien symbolique lui-même est suivi par git, ce qui suffit à VS Code pour le reconnaître.

## Structure de base

Un bon `AGENTS.md` est court et lisible. Chaque règle suit le même patron : titre, une phrase d'explication, exemples concrets.

```markdown
# AGENTS.md

## Package Manager — Always use pnpm

Never use npm or yarn.

- ✅ pnpm install, pnpm add <pkg>
- ❌ npm install, yarn add

## Git — No commits, no staging

Never create commits. Leave all git operations to the user.

- ✅ git diff, git status, git log
- ❌ git add, git commit
```

Ce format fonctionne parce qu'il est lisible pour un humain et non-ambigu pour un agent. Un titre descriptif dit l'essentiel, le texte précise, les exemples lèvent les doutes restants.

## Où le placer et comment le versionner

Le fichier va à la **racine du dépôt git**. Dans un monorepo, c'est la racine du dépôt entier, pas celle d'un package individuel.

Commite-le dans git comme n'importe quel fichier de configuration. C'est un artefact du projet que toute l'équipe partage, pas une préférence personnelle. Les modifications au fichier passent par les revues de code, comme le reste.

Une fois en place, le prochain guide t'explique quoi y mettre et comment formuler des règles qui changent vraiment le comportement de l'agent.
