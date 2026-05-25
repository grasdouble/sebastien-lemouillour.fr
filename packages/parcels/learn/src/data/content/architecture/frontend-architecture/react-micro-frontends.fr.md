---
id: react-micro-frontends
order: 1
difficulty: advanced
tags: [React, architecture, micro-frontend]
---

Une application React qui grandit finit toujours par rencontrer le même problème organisationnel : plusieurs équipes travaillent dans la même codebase, les déploiements restent couplés, et un bug dans Checkout peut bloquer une release de la partie Compte. La réponse classique consiste à découper les équipes. Mais si le code reste monolithique, l'essentiel de la douleur de coordination reste exactement au même endroit.

Les micro-frontends traitent le problème au niveau architectural. Chaque équipe possède son morceau d'interface de bout en bout, du code à la production, et peut déployer sans attendre les autres. Le compromis est clair : moins de couplage dans la codebase, plus de complexité aux frontières.

## Qu'est-ce qu'un micro-frontend ?

Un micro-frontend est une approche architecturale qui décompose une application web en plusieurs parties indépendantes, chacune développée, déployée et maintenue séparément. Chaque équipe peut choisir sa stack, son cycle de release et son périmètre fonctionnel. Le container, parfois appelé shell, est chargé de rassembler ces parties en un produit cohérent.

## single-spa : l'orchestrateur

Une fois l'interface découpée en applications indépendantes, le container a besoin d'un moyen de charger et de décharger les morceaux d'UI en fonction de l'URL active. single-spa est le framework qui joue ce rôle : il gère le cycle de vie de chaque application et sépare les enjeux de routage de ceux du rendu.

```typescript
import { registerApplication, start } from 'single-spa';

registerApplication({
  name: '@my/parcel-home',
  app: () => import('@my/parcel-home'),
  activeWhen: ['/'],
});

registerApplication({
  name: '@my/parcel-about',
  app: () => import('@my/parcel-about'),
  activeWhen: ['/about'],
});

start();
```

Du point de vue du container, chaque micro-frontend n'est qu'une application nommée avec une règle d'activation.

## Import maps : résolution des modules

single-spa charge les applications à la demande — mais comment sait-il où les trouver ? C'est là qu'interviennent les import maps : elles permettent au navigateur de résoudre des spécificateurs de modules nus (ex. `@my/parcel-home`) vers une URL concrète. En développement, elles pointent vers localhost ; en production, vers un CDN.

```json
{
  "imports": {
    "@my/parcel-home": "https://cdn.example.com/parcel-home/1.2.0/parcel.js",
    "@my/parcel-about": "https://cdn.example.com/parcel-about/0.9.1/parcel.js"
  }
}
```

Cela rend les déploiements indépendants : mettre à jour un micro-frontend nécessite uniquement de changer son URL dans l'import map — pas de rebuild du container.

## Cycle de vie d'un parcel

Chaque micro-frontend doit exposer trois fonctions que single-spa appellera au bon moment : `bootstrap` pour l'initialisation unique, `mount` pour afficher l'UI, et `unmount` pour nettoyer quand l'utilisateur navigue ailleurs. Avec React 18, cela revient généralement à conserver une référence `createRoot` entre les appels du cycle de vie.

```typescript
import { createRoot } from 'react-dom/client';
import App from './App';

let root: ReturnType<typeof createRoot> | null = null;

export const bootstrap = () => Promise.resolve();

export const mount = () => new Promise((resolve, reject) => {
  const container = document.getElementById('app-container');
  if (!container) return reject(new Error('Container not found'));
  root ??= createRoot(container);
  root.render(<App />);
  resolve(void 0);
});

export const unmount = () => new Promise((resolve) => {
  root?.unmount();
  root = null;
  resolve(void 0);
});
```

## Dépendances partagées

Si chaque micro-frontend bundle sa propre copie de React, le navigateur télécharge React autant de fois qu'il y a de parcels. Sur un produit avec dix équipes, c'est plusieurs centaines de kilooctets dupliqués. La solution : déclarer React comme externe dans chaque parcel et le charger une seule fois via l'import map :

```json
{
  "imports": {
    "react": "https://esm.sh/react@18.3.1",
    "react-dom": "https://esm.sh/react-dom@18.3.1"
  }
}
```

Le `vite.config.ts` de chaque parcel doit les marquer comme externes pour ne pas les bundler :

```typescript
export default defineConfig({
  build: {
    rollupOptions: {
      external: ['react', 'react-dom'],
    },
  },
});
```

L'architecture micro-frontend n'est pas une solution universelle. Elle échange la complexité du couplage de code contre celle de l'orchestration. Elle devient pertinente quand plusieurs équipes autonomes doivent déployer indépendamment sur la même interface. Pour une seule équipe, un monorepo bien structuré avec du lazy loading suffit souvent.
