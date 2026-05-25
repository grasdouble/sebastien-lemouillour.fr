## Qu'est-ce qu'un micro-frontend ?

Un micro-frontend est une approche architecturale qui décompose une application web en plusieurs parties indépendantes, chacune développée, déployée et maintenue séparément. Chaque équipe peut choisir sa stack, son cycle de release et son périmètre fonctionnel.

## single-spa : le orchestrateur

single-spa est un framework qui orchestre le chargement et le déchargement des micro-frontends selon l'URL active. Il gère le cycle de vie (bootstrap, mount, unmount) de chaque application.

## Import maps : résolution des modules

```json
{
  "imports": {
    "@my/parcel-home": "http://localhost:4100/src/parcel.tsx",
    "@my/parcel-about": "http://localhost:4101/src/parcel.tsx"
  }
}
```

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
