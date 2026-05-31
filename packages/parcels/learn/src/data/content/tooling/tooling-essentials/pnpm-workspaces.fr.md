---
id: pnpm-workspaces
order: 2
difficulty: intermediate
tags: [tooling, monorepo]
publishedAt: 2026-05-22
updatedAt: 2026-05-30
---

Tu découpes un repo en packages pour arrêter le copier-coller, puis ta première semaine part dans trois corvées très bêtes : tout installer d'un coup, lancer un script dans un seul package, et vérifier que les dépendances internes ne viennent pas discrètement du registre.

J'ai déjà assez perdu de temps là-dessus pour avoir un avis tranché : pars sur pnpm workspaces sauf si tes packages ne se croisent vraiment jamais. Le gain, ce n'est pas la grande théorie du monorepo. Le gain, c'est de revenir à un lockfile unique et à un seul flux d'installation avant que le repo devienne bruyant.

## Garde un workspace volontairement petit

Le fichier [pnpm-workspace.yaml](https://pnpm.io/pnpm-workspace_yaml) à la racine est l'endroit où pnpm décide quels dossiers appartiennent au workspace. Je pars du glob le plus étroit qui colle à l'arborescence, parce que les patterns trop larges ont l'air malins jusqu'au jour où ils attrapent des dossiers que tu ne voulais jamais traiter comme des packages.

Avant le premier bloc de config, voilà la forme que je choisirais pour une structure simple en `packages/*` :

```yaml
packages:
  - 'packages/*'
  - '!**/test/**'
```

Cet exemple reste volontairement banal. Il montre d'abord le cas courant, et la doc pnpm précise aussi que le package racine reste inclus même quand tu personnalises les globs de `packages`.

## Une install, puis une cible

Dans un workspace, [pnpm install](https://pnpm.io/cli/install) installe les dépendances de tous les projets par défaut. Ensuite, le quotidien ressemble surtout à "lancer ça partout" ou "lancer ça ici", donc je garde le [mode récursif](https://pnpm.io/cli/recursive) et le [filtering](https://pnpm.io/filtering) en mémoire.

Avant de copier ces commandes, je ferais juste une petite correction qui évite des surprises : ajoute `--if-present` quand tu ne maîtrises pas tous les scripts de tous les packages.

```bash
# Installer les dépendances de tous les projets du workspace
pnpm install

# Builder les packages qui exposent vraiment un script build
pnpm -r --if-present run build

# Lancer un script dans un package précis
pnpm --filter @my/package run dev

# Ajouter une dépendance de dev à un package précis
pnpm --filter @my/package add -D typescript

# Ajouter un package local du workspace et échouer s'il n'existe pas dedans
pnpm --filter @my/app add @my/shared --workspace

# Lancer lint partout sans casser sur les packages qui n'ont pas ce script
pnpm -r --parallel --if-present run lint
```

J'utilise `--filter` en permanence. Sans lui, un monorepo finit vite par ressembler à un open space où chaque commande interrompt tous les packages.

## Utilise `workspace:` quand tu veux dire "local ou erreur"

Le [protocole workspace](https://pnpm.io/workspaces#workspace-protocol-workspace) sert exactement au moment où "ça devrait se lier en local" ne te rassure plus. Si une dépendance doit venir du workspace courant, dis-le clairement et laisse pnpm échouer bruyamment quand le package ou la version manque.

Avant l'exemple suivant, la règle est simple : si le package est interne par choix, je préfère être explicite plutôt que compter sur une plage de versions qui tombe juste.

```json
{
  "dependencies": {
    "@my/shared": "workspace:*",
    "@my/ui": "workspace:^"
  }
}
```

Sans `workspace:`, pnpm ne lie les packages locaux correspondants que si `linkWorkspacePackages` est activé. Avec `workspace:`, il refuse de retomber sur le registre, puis réécrit ces références en semver classique au moment du pack ou de la publication.

## Les workspaces règlent les installs, pas les releases

Dès que quelques packages sont publiés, l'install n'est plus la partie pénible. La release, si. Le [workflow de release](https://pnpm.io/workspaces#release-workflow) de pnpm le dit clairement : il n'y a pas de solution intégrée pour versionner un workspace, donc il faut choisir un outil dédié. Si je veux le chemin le moins surprenant, je suis le [guide Changesets](https://pnpm.io/using-changesets) de pnpm.

Avant de le brancher dans la CI, le flux local ressemble à ça :

```bash
# Installer la CLI Changesets à la racine du workspace
pnpm add -Dw @changesets/cli

# Créer la config une bonne fois
pnpm changeset init

# Enregistrer l'intention de release pour un changement
pnpm changeset

# Appliquer les montées de version en attente
pnpm changeset version

# Publier les packages versionnés du workspace
pnpm publish -r
```

Si ton repo a deux ou trois packages qui bougent souvent ensemble, les workspaces suffisent généralement. Dès que tu as besoin d'une coordination stricte des releases sur des dizaines de packages, garde pnpm workspaces pour les dépendances et laisse un outil de release gérer le reste.
