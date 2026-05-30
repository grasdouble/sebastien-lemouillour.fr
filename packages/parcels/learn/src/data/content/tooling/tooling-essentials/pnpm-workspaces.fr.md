---
id: pnpm-workspaces
order: 2
difficulty: intermediate
tags: [tooling, monorepo, pnpm]
publishedAt: 2026-05-31
updatedAt: 2026-05-31
---

Tu copies un utilitaire de validation du projet A vers le projet B parce que c'est plus rapide que de configurer un package partagé. Six mois plus tard, il y a un bug dans le validateur. Tu le corriges dans A. Tu ne le corriges pas dans B parce que tu as oublié qu'il y est. Un utilisateur de B trouve le bug trois semaines plus tard.

Je l'ai vécu deux fois. La deuxième fois, c'était suffisamment embarrassant pour que je prenne enfin le temps de mettre en place un monorepo correctement.

## Le monorepo, c'est pas une mode

Un seul dépôt git, plusieurs packages, des outils partagés. Avec pnpm workspaces, chaque package garde son propre `package.json` et déclare ses propres dépendances. Ils peuvent se référencer mutuellement sans passer par npm. Les versions de TypeScript restent alignées. On lance lint et les tests depuis un seul endroit. Ça ne paraît pas révolutionnaire jusqu'à ce qu'on se souvienne comment c'était avant.

## Configuration pnpm-workspace.yaml

Un seul fichier à la racine indique à pnpm quels répertoires contiennent des packages :

```yaml
packages:
  - 'packages/**'
  - '!packages/**/node_modules/**'
```

Le pattern d'exclusion est facile à oublier et il est important : sans lui, pnpm pourrait essayer de traiter les répertoires `node_modules` comme des packages, avec des résultats prévisiblement mauvais.

## Commandes essentielles

Le changement de workflow est réel. Au lieu de faire des `cd` entre les repos et de réinstaller des dépendances partout, tu pilotes tout depuis une seule racine :

```bash
# Installer toutes les dépendances du workspace
pnpm install

# Builder tous les packages (récursif)
pnpm -r build

# Lancer un script dans un package spécifique
pnpm --filter @my/package dev

# Ajouter une dépendance à un package spécifique
pnpm add -D typescript --filter @my/package

# Ajouter un package du workspace comme dépendance
pnpm add @my/shared --filter @my/app --workspace

# Lancer une commande dans tous les packages qui ont un script donné
pnpm -r --parallel run lint
```

J'utilise `--filter` en permanence. C'est ce qui permet de rester dans le monorepo sans perdre de vue le package sur lequel on travaille vraiment.

## Packages internes (protocole workspace)

C'est la fonctionnalité qui rend le partage de code vraiment opérationnel. Quand le package A dépend du package B dans le même monorepo, on le déclare comme ça :

```json
{
  "dependencies": {
    "@my/shared": "workspace:*",
    "@my/ui": "workspace:^"
  }
}
```

En développement, pnpm crée un lien direct de B dans le `node_modules` de A : toute modification dans B est immédiatement visible dans A, sans étape de build. Au moment de publier, pnpm substitue automatiquement le vrai numéro de version. Pas de `npm link`, pas de symlinks manuels, pas de "attends, c'est quelle version là ?"

## Changesets pour la gestion des versions

Dès qu'on a plusieurs packages publiés, "bumper la version" cesse d'être une simple commande. Quel package a changé ? De combien ? Changesets règle ça en demandant d'attacher une petite déclaration à chaque changement significatif, puis en agrégeant ces déclarations au moment de la release.

```bash
# Ajouter un changeset (interactif)
pnpm changeset

# Bumper les versions selon les changesets
pnpm changeset version

# Publier les packages modifiés sur npm
pnpm changeset publish
```

Un fichier changeset ressemble à ceci :

```md
---
'@my/ui': minor
'@my/app': patch
---

feat: ajout du variant "ghost" sur le Button
```

Le fichier vit dans le repo, il est reviewé dans la PR, mergé avec la feature. Au moment de lancer `changeset version`, tu as déjà un historique clair de ce qui a changé et pourquoi.

Un avertissement honnête : les dépendances circulaires, les builds incrémentaux qui fonctionnent vraiment, et les déploiements coordonnés deviennent tous plus difficiles à mesure que le monorepo grossit. pnpm workspaces couvrent l'essentiel, mais ce n'est pas une réponse complète à tous les problèmes de passage à l'échelle d'un monorepo. Sache dans quoi tu t'embarques avant de migrer six repos.
