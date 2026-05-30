---
id: pnpm-workspaces
order: 2
difficulty: intermediate
tags: [tooling, monorepo, pnpm]
publishedAt: 2026-05-22
updatedAt: 2026-05-30
---

Tu découpes un repo en quelques packages pour arrêter de copier du code partout, puis la première question pénible tombe tout de suite : comment faire une seule install, viser un seul package, et garder les dépendances locales cohérentes sans bricoler des scripts shell tout le week-end ?

J'ai déjà perdu trop de temps là-dessus. Je partirais sur [pnpm workspaces](https://pnpm.io/workspaces) presque à chaque fois, sauf si tes packages n'ont vraiment rien à partager, parce qu'un lockfile unique et le lien entre packages locaux règlent le problème plus tôt qu'on l'imagine.

## Le monorepo n'aide que si le workflow reste ennuyeux

Chaque package garde son propre `package.json`, mais le workspace racine donne à pnpm un point central pour les installs. C'est ça qui m'intéresse en pratique : tu arrêtes de répéter la même plomberie de dépendances partout, et tu peux travailler sur des packages locaux sans les publier d'abord.

## Configurer pnpm-workspace.yaml

Le fichier racine [pnpm-workspace.yaml](https://pnpm.io/pnpm-workspace_yaml) décide quels dossiers font partie du workspace. Je préfère partir du glob le plus petit qui colle à la structure du repo, puis n'ajouter des exclusions que si l'arborescence l'exige vraiment.

```yaml
packages:
  - 'packages/*'
  - '!**/test/**'
```

Ce pattern est volontairement banal. Il colle au cas classique où les packages vivent un niveau plus bas, et il évite d'enseigner un glob attrape-tout avant d'en avoir besoin.

## Les deux commandes que tu vas garder ouvertes

La doc du [mode récursif](https://pnpm.io/cli/recursive) et celle du [filtering](https://pnpm.io/filtering) sont les deux pages que je mettrais en favori en premier, parce que le quotidien d'un workspace ressemble surtout à "lancer ça partout" ou "lancer ça seulement ici".

```bash
# Installer toutes les dépendances du workspace
pnpm install

# Builder tous les packages qui exposent un script build
pnpm -r run build

# Lancer un script dans un package spécifique
pnpm --filter @my/package dev

# Ajouter une dépendance à un package spécifique
pnpm add -D typescript --filter @my/package

# Ajouter un package du workspace comme dépendance
pnpm add @my/shared --filter @my/app --workspace

# Lancer lint dans tous les packages qui ont un script lint
pnpm -r --parallel run lint
```

J'abuse de `--filter`. Sans lui, un monorepo ressemble vite à un open space où chaque commande dérange tous les packages.

## Les packages internes sans zone grise

C'est là que le [protocole workspace](https://pnpm.io/workspaces#workspace-protocol-workspace) devient vraiment utile. Si tu veux qu'une dépendance se résolve uniquement depuis le workspace local, dis-le explicitement au lieu d'espérer qu'une plage semver fasse ce que tu voulais.

```json
{
  "dependencies": {
    "@my/shared": "workspace:*",
    "@my/ui": "workspace:^"
  }
}
```

pnpm peut déjà lier des packages locaux quand les versions correspondent, même sans `workspace:`, mais je l'utiliserais quand même pour les dépendances internes censées rester locales. Ça enlève le doute du "ça vient du registre ou du repo ?", et pnpm réécrit ces plages en semver classique au moment du pack ou de la publication.

## Le versioning est un problème à part

Dès que plusieurs packages sont publiés, l'install n'est plus la partie pénible. La release, si. La [CLI Changesets](https://github.com/changesets/changesets/blob/main/packages/cli/README.md) est le choix que je ferais avec pnpm, justement parce que pnpm ne cherche pas à résoudre lui-même le versioning du workspace.

```bash
# Ajouter un changeset (interactif)
pnpm changeset

# Mettre à jour les versions à partir des changesets en attente
pnpm changeset version

# Publier les packages dont la version est prête
pnpm changeset publish
```

Un fichier changeset ressemble à ceci :

```md
---
'@my/ui': minor
'@my/app': patch
---

feat: add Button variant "ghost"
```

Ce qui compte, ce n'est pas le format du fichier. C'est le fait que l'intention de release est relue avec le code, au lieu d'être reconstituée depuis l'historique git au pire moment.

Si tu as deux ou trois packages qui évoluent ensemble, un workspace rentabilise vite son coût. Si tu as déjà besoin d'une orchestration de build stricte, de trains de release et de graphes de dépendances sur des dizaines de packages, considère les workspaces comme le point de départ, pas comme toute la stratégie monorepo.
