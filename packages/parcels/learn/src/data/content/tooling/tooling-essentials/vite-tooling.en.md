---
id: vite-tooling
order: 1
difficulty: beginner
tags: [tooling, Vite, build]
---

For years, starting a frontend project meant waiting. Webpack had to analyze and bundle the entire app before serving the first page — 20, 30, sometimes 60 seconds every time you ran `npm start`. Then you changed one file, and Hot Module Replacement rebuilt the dependency graph again. In a medium-sized project, saving a file and seeing the result in the browser could still take several seconds.

Vite changes the question entirely: what if we did not bundle anything at all during development?

## Why Vite?

Vite relies on native ES Modules, which modern browsers can load directly. In development, it does not bundle your code up front — it serves each file on demand, exactly when the browser requests it. That is why startup feels almost instant, even in projects with hundreds of components, and why HMR only updates the module that actually changed.

For production, Vite switches back to a bundling step powered by Rollup: tree-shaking, code splitting, and optimized output. The result is a pragmatic split: speed while developing, optimization when shipping.

## Create a Vite + React + TypeScript project

Getting started takes only three commands:

```bash
pnpm create vite my-app --template react-ts
cd my-app
pnpm install
pnpm dev
```

The dev server usually starts in under a second. On the first page load, imports become HTTP requests and Vite transforms each file on the fly — TypeScript, JSX, and CSS Modules included.

## Structure of vite.config.ts

Once the project is running, configuration usually comes next. The good news is that Vite's base config fits in just a few lines:

```typescript
import path from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  server: {
    port: 3000,
    hmr: true,
  },
});
```

The most useful options here are the plugin setup (React with Fast Refresh), path aliases to avoid deep relative imports, and the dev server settings.

## Environment variables

A concrete question comes up quickly: how do you pass an API URL to the frontend without exposing everything in your environment? Vite uses a simple rule: only variables prefixed with `VITE_` are injected into the client bundle. Everything else stays server-side and remains invisible to the browser.

```bash
# .env
VITE_API_URL=https://api.example.com
SECRET_KEY=do-not-expose          # not exposed to the browser
```

```typescript
// Access in client code
const apiUrl = import.meta.env.VITE_API_URL;

// TypeScript typing
/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_API_URL: string;
}
```

## Path aliases

As soon as a project grows, relative imports become hard to read: `../../../components/ui/Button`. A path alias fixes that by giving the whole `src/` tree a stable entry point:

```typescript
// Before

// After (with alias "@" → "src/")
import { Button } from '@/components/ui/Button';

import { Button } from '../../../components/ui/Button';
```

Add the same alias to `tsconfig.json` so TypeScript resolves those imports too:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

## Advantages vs Webpack

If you are coming from Webpack, the gains are very concrete:

- **Startup in milliseconds** — no initial bundling, so the server answers immediately
- **Surgical HMR** — only the changed module is replaced, without resetting the whole app state
- **Minimal configuration** — common setups work with very little custom code
- **Rollup in production** — optimized output without extra tooling decisions
- **A mature plugin ecosystem** — much of the Rollup ecosystem is already compatible

Vite does not replace Webpack in every case. Very custom build pipelines or unusual integrations can still require extra work. But for a standard React + TypeScript project, it is hard to find a more practical default.
