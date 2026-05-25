## What is a micro-frontend?

A micro-frontend is an architectural approach that decomposes a web application into several independent parts, each developed, deployed and maintained separately. Each team can choose its own stack, release cycle and functional scope.

## single-spa: the orchestrator

single-spa is a framework that orchestrates the loading and unloading of micro-frontends based on the active URL. It manages the lifecycle (bootstrap, mount, unmount) of each application.

## Import maps: module resolution

```json
{
  "imports": {
    "@my/parcel-home": "http://localhost:4100/src/parcel.tsx",
    "@my/parcel-about": "http://localhost:4101/src/parcel.tsx"
  }
}
```

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
