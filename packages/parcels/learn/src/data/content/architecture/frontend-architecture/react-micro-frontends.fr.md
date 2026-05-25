---
id: react-micro-frontends
order: 1
difficulty: advanced
tags: [React, architecture, micro-frontend]
---

## Qu'est-ce qu'un micro-frontend ?

Un micro-frontend est une approche architecturale qui décompose une application web en plusieurs parties indépendantes, chacune développée, déployée et maintenue séparément. Chaque équipe peut choisir sa stack, son cycle de release et son périmètre fonctionnel. Le container (ou shell) est responsable d'orchestrer les parties ensemble.

## single-spa : l'orchestrateur

single-spa est un framework qui orchestre le chargement et le déchargement des micro-frontends selon l'URL active. Il gère le cycle de vie (bootstrap, mount, unmount) de chaque application et découple le routage du rendu.

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

## Import maps : résolution des modules

Les import maps permettent au navigateur de résoudre des spécificateurs de modules nus (ex. `@my/parcel-home`) vers une URL. En développement, elles pointent vers localhost ; en production, vers un CDN.

```json
{
  "imports": {
    "@my/parcel-home": "https://cdn.example.com/parcel-home/1.2.0/parcel.js",
    "@my/parcel-about": "https://cdn.example.com/parcel-about/0.9.1/parcel.js"
  }
}
```

Cela permet des déploiements indépendants : mettre à jour un micro-frontend nécessite uniquement de changer son URL dans l'import map — pas de rebuild du container.

## Cycle de vie d'un parcel

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

Pour éviter de livrer React plusieurs fois, déclarez les dépendances partagées comme externals dans la configuration de build de chaque parcel et importez-les via l'import map.

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
