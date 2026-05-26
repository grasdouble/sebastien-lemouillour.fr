---
id: react-micro-frontends
order: 1
difficulty: advanced
tags: [React, architecture, micro-frontend]
---

Tu es dans une réunion où trois équipes débattent pour savoir si le déploiement est safe. Chacune a touché une section différente de l'appli. L'une d'elles a trouvé un bug au dernier moment dans son bout. Personne ne veut bloquer tout le monde, mais personne ne veut non plus livrer quelque chose de cassé. Alors tout le monde attend. Encore.

C'est le mode d'échec concret que les micro-frontends sont conçus pour prévenir, pas comme une abstraction, mais comme une vraie frontière de déploiement.

## Le vrai pari

Le pari des micro-frontends, c'est que le déploiement indépendant vaut plus qu'une codebase unifiée. Chaque équipe possède son bout d'interface du premier commit à la production. Elle déploie quand elle est prête. Un bug dans Checkout ne bloque pas Account. Le prix à payer est réel : un problème de dépendances partagées à résoudre explicitement, une nouvelle surface de coordination aux frontières, et une expérience de débogage objectivement plus complexe que dans un monolithe.

Je ne recommanderais pas ça à une seule équipe. Pour plusieurs équipes autonomes qui déploient sur la même interface, c'est souvent la seule structure qui passe vraiment à l'échelle.

## single-spa : l'orchestrateur

Le container (parfois appelé shell) doit savoir quelle portion d'UI charger en fonction de l'URL courante, et comment échanger les morceaux sans rechargement de page. single-spa s'occupe exactement de ça. On enregistre chaque micro-frontend avec un nom et une règle d'activation ; single-spa appelle mount et unmount au bon moment.

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

Du point de vue du container, chaque micro-frontend n'est qu'une application nommée avec une règle d'activation. Il ne se préoccupe pas de ce qu'il y a dedans.

## Import maps : résolution des modules

Les imports dynamiques dans le container (`import('@my/parcel-home')`) sont des spécificateurs de modules nus : pas de chemin, pas d'URL. Le navigateur a besoin d'un moyen de les résoudre. Les import maps règlent ça :

```json
{
  "imports": {
    "@my/parcel-home": "https://cdn.example.com/parcel-home/1.2.0/parcel.js",
    "@my/parcel-about": "https://cdn.example.com/parcel-about/0.9.1/parcel.js"
  }
}
```

C'est là que le déploiement indépendant devient concret. L'équipe Home livre une nouvelle version, met à jour l'URL dans l'import map, c'est terminé. Pas de rebuild du container, pas de coordination avec l'équipe About. L'import map est l'artefact de déploiement de chaque micro-frontend, et je trouve ça franchement élégant une fois qu'on s'y est habitué.

## Cycle de vie d'un parcel

Chaque micro-frontend doit exporter trois fonctions que single-spa appelle au bon moment. Bien faire ça avec React 18, c'est la partie qui m'a piégé la première fois : il faut garder la référence `createRoot` vivante entre les cycles mount/unmount, sinon React lance des avertissements sur la création d'une racine sur un container qui en a déjà une.

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

Si chaque micro-frontend bundle sa propre copie de React, les utilisateurs téléchargent React plusieurs fois. Sur un produit avec dix équipes, c'est facilement un mégaoctet de code de bibliothèque dupliqué. La solution : charger React une seule fois via l'import map et le marquer comme externe dans la config de build de chaque parcel :

```json
{
  "imports": {
    "react": "https://esm.sh/react@18.3.1",
    "react-dom": "https://esm.sh/react-dom@18.3.1"
  }
}
```

```typescript
export default defineConfig({
  build: {
    rollupOptions: {
      external: ['react', 'react-dom'],
    },
  },
});
```

Le piège : tous les parcels doivent utiliser la même version de React. Si une équipe passe à React 19 avant les autres, c'est un problème : React ne peut pas coexister en deux versions sur la même page sans que les hooks ne lâchent. Les dépendances partagées nécessitent une coordination inter-équipes, ce qui est exactement ce que les micro-frontends étaient censés réduire. Prévois ça explicitement avant de t'engager dans cette architecture.
