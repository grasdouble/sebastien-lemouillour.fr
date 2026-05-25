## Qu'est-ce qu'un monorepo ?

Un monorepo est un dépôt git unique qui contient plusieurs packages ou applications. Il facilite le partage de code, la cohérence des versions et les workflows CI/CD unifiés.

## Configuration pnpm-workspace.yaml

```yaml
packages:
  - 'packages/**'
  - '!packages/**/node_modules/**'
```

## Commandes essentielles

- `pnpm install` — installe toutes les dépendances du workspace
- `pnpm -r build` — build tous les packages
- `pnpm --filter @my/package dev` — lance un package spécifique
- `pnpm add -D typescript --filter @my/package` — ajoute une dep à un package

## Changesets pour la gestion des versions

Changesets est un outil qui gère les versions et changelogs dans un monorepo. Chaque PR ajoute un fichier de changeset décrivant l'impact (patch/minor/major) sur les packages affectés.

```bash
# Ajouter un changeset
pnpm changeset

# Bumper les versions
pnpm changeset version

# Publier
pnpm changeset publish
```
