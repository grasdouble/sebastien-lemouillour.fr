---
id: react-micro-frontends
order: 1
difficulty: advanced
tags: [React, architecture, micro-frontend]
---

A growing React application eventually runs into the same organizational problem: multiple teams work in the same codebase, deployments stay coupled, and a bug in Checkout can block a release for Account. The classic answer is to split the teams. But if the code remains monolithic, most of the coordination pain stays exactly where it was.

Micro-frontends address the problem at the architectural level. Each team owns its slice of the interface end to end, from code to production, and can deploy without waiting for the others. The trade-off is clear: less coupling in the codebase, more complexity at the boundaries.

## What is a micro-frontend?

A micro-frontend is an architectural approach that decomposes a web application into several independent parts, each developed, deployed, and maintained separately. Each team can choose its own stack, release cycle, and functional scope. The container, sometimes called the shell, is responsible for bringing those parts together into one coherent product.

## single-spa: the orchestrator

Once you split the interface into independent applications, the container needs a way to load and unload UI parts based on the active URL. single-spa is the framework that plays this role: it manages each application's lifecycle and keeps routing concerns separate from rendering.

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

From the container's point of view, each micro-frontend is just a named application with an activation rule.

## Import maps: module resolution

single-spa loads applications on demand — but how does it know where to find them? That is where import maps come in. They let the browser resolve bare module specifiers such as `@my/parcel-home` to concrete URLs. During development those URLs usually point to localhost; in production, they point to a CDN.

```json
{
  "imports": {
    "@my/parcel-home": "https://cdn.example.com/parcel-home/1.2.0/parcel.js",
    "@my/parcel-about": "https://cdn.example.com/parcel-about/0.9.1/parcel.js"
  }
}
```

That makes deployments independent: updating one micro-frontend often means changing only one URL in the import map, without rebuilding the container.

## Parcel lifecycle

Each micro-frontend must expose three functions that single-spa will call at the right time: `bootstrap` for one-time initialization, `mount` to display the UI, and `unmount` to clean up when the user navigates away. In React 18, that usually means keeping a `createRoot` reference between lifecycle calls.

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

## Shared dependencies

If each micro-frontend bundles its own copy of React, the browser downloads React as many times as there are parcels. On a product with ten teams, that quickly turns into hundreds of duplicated kilobytes. The usual fix is to load React once through the import map and mark it as external in every parcel.

```json
{
  "imports": {
    "react": "https://esm.sh/react@18.3.1",
    "react-dom": "https://esm.sh/react-dom@18.3.1"
  }
}
```

Each parcel's `vite.config.ts` should mark these as external so they are not bundled:

```typescript
export default defineConfig({
  build: {
    rollupOptions: {
      external: ['react', 'react-dom'],
    },
  },
});
```

Micro-frontend architecture is not a universal solution. It trades code coupling complexity for orchestration complexity. It becomes relevant when multiple autonomous teams need to deploy independently on the same interface. For a single team, a well-structured monorepo with lazy loading is often enough.
