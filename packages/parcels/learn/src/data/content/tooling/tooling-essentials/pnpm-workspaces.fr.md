---
id: pnpm-workspaces
difficulty: intermediate
tags: [tooling, monorepo, pnpm]
---

## Qu'est-ce qu'un monorepo ?

Un monorepo est un dépôt git unique qui contient plusieurs packages ou applications. Il facilite le partage de code, la cohérence des versions et les workflows CI/CD unifiés. Avec pnpm workspaces, chaque package conserve son propre `package.json` et peut déclarer des dépendances sur d'autres packages du workspace.

## Configuration pnpm-workspace.yaml

```yaml
packages:
  - 'packages/**'
  - '!packages/**/node_modules/**'
```

## Commandes essentielles

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

## Packages internes (protocole workspace)

Référencez les packages du workspace avec le protocole `workspace:*` dans `package.json`. pnpm les résout localement en développement et remplace par les vraies versions au moment de la publication.

```json
{
  "dependencies": {
    "@my/shared": "workspace:*",
    "@my/ui": "workspace:^"
  }
}
```

## Changesets pour la gestion des versions

Changesets est un outil qui gère les versions et changelogs dans un monorepo. Chaque PR ajoute un fichier de changeset décrivant l'impact (patch/minor/major) sur les packages affectés.

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
