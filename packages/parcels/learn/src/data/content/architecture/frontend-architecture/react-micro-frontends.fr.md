---
id: react-micro-frontends
order: 1
difficulty: advanced
tags: [React, architecture, micro-frontend]
publishedAt: 2026-05-10
updatedAt: 2026-05-30
---

Tu es en réunion de release parce que trois équipes ont touché le même frontend, l'une a trouvé un bug tard, et maintenant personne ne sait s'il faut livrer ou geler. Tout le monde attend. Encore.

C'est le mode d'échec que les micro-frontends sont censés résoudre : transformer un frontend fragile en frontières de déploiement.

## Le vrai pari

Les micro-frontends sont une stratégie de déploiement, pas un pattern de composants. Avec [single-spa](https://single-spa.js.org/docs/configuration/), le shell enregistre des applications nommées et les active selon l'URL. Tu y gagnes des déploiements indépendants. Tu y gagnes aussi un débogage plus dur, une discipline de version plus stricte et une couche plateforme que quelqu'un doit vraiment posséder.

Je ne ferais pas ça pour une seule équipe. Je commence à l'envisager quand plusieurs équipes autonomes livrent sur la même surface et que la coordination de release est déjà le goulot.

## Le shell reste bête

Un shell doit décider quoi monter, pas contenir de logique produit. Les [lifecycles single-spa](https://single-spa.js.org/docs/building-applications/) sont volontairement petits : `bootstrap` tourne une seule fois, `mount` et `unmount` tournent quand la route change, et ces fonctions de cycle de vie doivent retourner des promesses ou être `async`.

La root config doit rester ennuyeuse exprès :

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

Du point de vue du shell, chaque micro-frontend n'est qu'un nom, un loader et une règle d'activation.

## La résolution de modules est la couche de déploiement

Les [import maps](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/script/type/importmap) existent parce que `import('@my/parcel-home')` est un spécificateur nu et que le navigateur a besoin d'une URL. C'est cette table de correspondance qui rend le déploiement indépendant réel : tu changes une URL, tu déploies un frontend, tu laisses les autres tranquilles.

La table elle-même doit être aussi banale que possible :

```json
{
  "imports": {
    "@my/parcel-home": "https://cdn.example.com/parcel-home/1.2.0/parcel.js",
    "@my/parcel-about": "https://cdn.example.com/parcel-about/0.9.1/parcel.js"
  }
}
```

Si ton process de déploiement ne sait pas mettre à jour cette map proprement, tu n'as pas des déploiements indépendants. Tu as de l'espoir distribué.

## Le montage React est l'endroit où les équipes créent de la dette

Avec React 18+, [createRoot](https://react.dev/reference/react-dom/client/createRoot) doit être créé une fois par container puis réutilisé via `render`. Recréer une root sur le même nœud DOM, c'est la manière la plus rapide de fabriquer des warnings et des unmounts instables.

Le point d'entrée React est l'endroit où les équipes deviennent négligentes :

```typescript
import { createRoot } from 'react-dom/client';
import App from './App';

let root: ReturnType<typeof createRoot> | null = null;

export async function bootstrap() {}

export async function mount() {
  const container = document.getElementById('app-container');
  if (!container) throw new Error('Container not found');

  root ??= createRoot(container);
  root.render(<App />);
}

export async function unmount() {
  root?.unmount();
  root = null;
}
```

Si tu veux moins de plomberie faite à la main, utilise un helper comme `single-spa-react`. La contrainte ne change pas : la propriété de la root doit rester explicite.

## Les dépendances partagées ne sont pas optionnelles

Pour les grosses bibliothèques partagées, je les externaliserais et je laisserais le navigateur charger une seule copie. [Rollup external](https://rollupjs.org/configuration-options/#external) est le contrat côté build, et l'import map est le contrat à l'exécution.

Garde ce contrat explicite aux deux endroits :

```json
{
  "imports": {
    "react": "https://cdn.example.com/shared/react.js",
    "react-dom": "https://cdn.example.com/shared/react-dom.js"
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

Le warning React [invalid hook call](https://react.dev/warnings/invalid-hook-call-warning) est plus précis que la version cargo-cult de ce conseil : plusieurs copies de React sur une même page ne sont pas automatiquement fatales, mais les hooks cassent quand tes composants et `react-dom` ne résolvent pas vers le même module React. En pratique, je traite quand même React partagé comme obligatoire, parce que laisser chaque micro-frontend choisir sa copie transforme une simple politique de version en dette de débogage permanente.

Si tu n'as pas au moins trois équipes frontend qui déploient indépendamment et quelqu'un prêt à posséder le shell, l'import map et la politique de dépendances, reste sur un monolithe modulaire.
