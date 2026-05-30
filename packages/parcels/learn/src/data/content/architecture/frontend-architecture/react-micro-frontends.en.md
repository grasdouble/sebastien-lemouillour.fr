---
id: react-micro-frontends
order: 1
difficulty: advanced
tags: [React, architecture, micro-frontend]
publishedAt: 2026-05-29
updatedAt: 2026-05-29
---

You're in a meeting where three teams are arguing about whether the deploy is safe to go out. Each team touched a different section of the app. One found a bug at the last minute in their slice. Nobody wants to delay everybody, but nobody wants to ship broken code either. So everyone waits. Again.

This is the concrete failure mode that micro-frontends are designed to prevent, not as an abstraction, but as a real deployment boundary.

## The actual premise

The bet with micro-frontends is that independent deployment is worth more than a single unified codebase. Each team owns its piece of the UI from first commit to production. They deploy when they're ready. A bug in Checkout doesn't hold up Account. The price you pay is real: a shared dependency problem you have to solve explicitly, a new coordination surface at the boundaries, and a debugging experience that is genuinely harder than in a monolith.

I wouldn't recommend this for a single team. For multiple autonomous teams deploying on the same interface, it's often the only structure that actually scales.

## single-spa: the orchestrator

The container (sometimes called the shell) needs to know which UI piece to load based on the current URL, and how to swap pieces without a full page reload. single-spa handles exactly that. You register each micro-frontend with a name and an activation rule; single-spa calls mount and unmount at the right moments.

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

From the container's perspective, each micro-frontend is a named application with an activation rule. It doesn't care about the internals.

## Import maps: module resolution

The dynamic imports in the container code (`import('@my/parcel-home')`) are bare module specifiers: no path, no URL. The browser needs a way to resolve them. Import maps solve this:

```json
{
  "imports": {
    "@my/parcel-home": "https://cdn.example.com/parcel-home/1.2.0/parcel.js",
    "@my/parcel-about": "https://cdn.example.com/parcel-about/0.9.1/parcel.js"
  }
}
```

This is where independent deployment actually happens. The Home team ships a new version, updates the URL in the import map, and that's it: no container rebuild, no coordination with the About team. The import map is the deployment artifact for every micro-frontend, and I think it's genuinely elegant once you get used to it.

## Parcel lifecycle

Each micro-frontend must export three functions that single-spa calls at the right moment. Getting this right with React 18 is the part that tripped me up the first time: you need to keep the `createRoot` reference alive between mount/unmount cycles, otherwise React will warn you about creating a root on a container that already has one.

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

If each micro-frontend bundles its own copy of React, users download React multiple times. On a product with ten teams, that's easily a megabyte of duplicated library code. The fix is to load React once through the import map and mark it as external in every parcel's build config:

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

The catch: all parcels must use the same React version. If one team upgrades to React 19 before the others, you have a problem: React can't coexist in two versions on the same page without hooks breaking. Shared dependencies require cross-team coordination, which is exactly the thing micro-frontends were supposed to reduce. Plan for this explicitly before you commit to the architecture.
