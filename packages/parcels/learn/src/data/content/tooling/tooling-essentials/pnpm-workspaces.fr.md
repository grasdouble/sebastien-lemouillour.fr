---
id: pnpm-workspaces
order: 2
difficulty: intermediate
tags: [tooling, monorepo, pnpm]
---

Imaginez une équipe qui grandit. Au début, il n'y a qu'une seule application React, une seule codebase, un seul repo, et tout le monde travaille au même endroit. C'est simple. Puis les frictions apparaissent : un utilitaire de validation partagé est copié dans deux projets, les versions de TypeScript commencent à diverger, et un bug corrigé dans un repo survit discrètement dans l'autre.

C'est à ce moment-là que le monorepo cesse de sembler théorique pour devenir la réponse la plus pragmatique. Au lieu d'éparpiller des packages liés dans plusieurs dépôts, on les réunit au même endroit et on laisse l'outillage gérer les frontières.

## Qu'est-ce qu'un monorepo ?

Un monorepo est un dépôt git unique qui contient plusieurs packages ou applications. Avec pnpm workspaces, chaque package garde son propre `package.json` et peut quand même dépendre d'autres packages du même dépôt. Vous gagnez le partage de code, la cohérence des versions et un point d'entrée unique pour vos workflows, sans perdre la responsabilité au niveau package.

## Configuration pnpm-workspace.yaml

Tout commence par un seul fichier à la racine du repo. Il indique à pnpm quels dossiers contiennent des packages :

```yaml
packages:
  - 'packages/**'
  - '!packages/**/node_modules/**'
```

## Commandes essentielles

Une fois le workspace configuré, pnpm expose des commandes qui opèrent sur tout le monorepo — ou sur un package précis. C'est là que le workflow change radicalement par rapport à plusieurs dépôts séparés :

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

Au lieu de sauter d'un repo à l'autre, de réinstaller les dépendances partout et de coordonner les changements manuellement, vous travaillez depuis une seule racine tout en ciblant exactement le package dont vous avez besoin.

## Packages internes (protocole workspace)

La vraie force du monorepo apparaît quand un package consomme un autre package du même repo. Avec pnpm, cela se fait avec le protocole `workspace:*` : pnpm résout la dépendance localement en développement, et remplace automatiquement par la vraie version publiée au moment de la publication. Plus besoin de `npm link` ou de chemins relatifs fragiles :

```json
{
  "dependencies": {
    "@my/shared": "workspace:*",
    "@my/ui": "workspace:^"
  }
}
```

## Changesets pour la gestion des versions

Dans un monorepo avec plusieurs packages publiés, la gestion des versions devient vite un problème. Qui a changé quoi ? Quel package mérite un patch, et lequel a besoin d'une release mineure ? Changesets répond à ça en attachant une petite note de version à chaque PR, puis en agrégeant ces notes au moment de publier.

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

Un monorepo ne résout pas tout. Les dépendances circulaires, les builds incrémentaux et les déploiements partiels peuvent encore devenir complexes à mesure que le système grandit. Mais comme point de départ, pnpm workspaces enlève déjà l'essentiel des frictions quotidiennes du multi-repo.
