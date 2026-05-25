## What is a micro-frontend?

A micro-frontend is an architectural approach that decomposes a web application into several independent parts, each developed, deployed and maintained separately. Each team can choose its own stack, release cycle and functional scope. The container (or shell) is responsible for orchestrating the parts together.

## single-spa: the orchestrator

single-spa is a framework that orchestrates the loading and unloading of micro-frontends based on the active URL. It manages the lifecycle (bootstrap, mount, unmount) of each application and decouples routing from rendering.

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

## Import maps: module resolution

Import maps allow the browser to resolve bare module specifiers (e.g. `@my/parcel-home`) to a URL. In development, they point to localhost; in production, to a CDN.

```json
{
  "imports": {
    "@my/parcel-home": "https://cdn.example.com/parcel-home/1.2.0/parcel.js",
    "@my/parcel-about": "https://cdn.example.com/parcel-about/0.9.1/parcel.js"
  }
}
```

This enables independent deployments: updating one micro-frontend only requires changing its URL in the import map — no rebuild of the container needed.

## Parcel lifecycle

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

To avoid shipping React multiple times, declare shared dependencies as externals in each parcel's build config and import them via the import map.

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
