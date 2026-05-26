---
id: vite-tooling
order: 1
difficulty: beginner
tags: [tooling, Vite, build]
---

You're mid-sprint. You open your terminal, run `npm start`, and then you wait. You go refill your coffee. Forty seconds later, Webpack has finished analyzing the dependency graph and you can finally see the app. You change one component, hit save, and wait again (five seconds this time, which sounds fine until you do it a hundred times a day).

That pain is what made me permanently switch to Vite.

## Why Vite works the way it does

The reason Webpack is slow is structural: it bundles everything upfront, before serving a single file. Vite takes the opposite approach. It relies on native ES Modules, which every modern browser can load directly. In dev mode, Vite doesn't bundle anything: it serves files one at a time, on demand, exactly when the browser requests them. That's why the dev server starts in under a second regardless of project size, and why HMR only swaps the exact module that changed instead of triggering a full rebuild.

For production, Vite uses Rollup under the hood: tree-shaking, code splitting, minified output. The two modes don't fight each other. Speed while you develop, optimization when you ship.

## Create a Vite + React + TypeScript project

Four commands and you're running:

```bash
pnpm create vite my-app --template react-ts
cd my-app
pnpm install
pnpm dev
```

When the browser hits the dev server for the first time, each import becomes an HTTP request. Vite intercepts, transforms TypeScript and JSX on the fly, and responds. No upfront compilation, no wait.

## Structure of vite.config.ts

I keep my base config minimal on purpose; Vite's defaults are good, and every option you add is one you have to maintain. Here's what I actually use:

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

The React plugin gives you Fast Refresh (React's version of HMR that preserves component state between saves). The `@` alias is almost mandatory once the project grows (more on that below). Sourcemaps in the build output are something I always enable; they cost nothing at build time and save a lot of pain when debugging a production error.

## Environment variables

The first time I needed to inject an API URL, I put it in `.env` and tried to read it, and spent twenty minutes wondering why it was `undefined`. Vite has a deliberate rule: **only variables prefixed with `VITE_` are exposed to the client**. Everything else stays server-side, invisible to the browser. I actually like this design; it makes accidental secret leakage harder.

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

`../../../components/ui/Button` is a sign that something has gone wrong. Not technically, but cognitively: deep relative imports make refactoring painful because moving a file means fixing a dozen paths. The `@` alias maps the entire `src/` tree to a single stable root:

```typescript
// Before

// After (with alias "@" → "src/")
import { Button } from '@/components/ui/Button';

import { Button } from '../../../components/ui/Button';
```

You also need to tell TypeScript about it, or you'll get red underlines everywhere despite the code working perfectly at runtime:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

## Compared to Webpack

I'm not going to pretend Webpack is bad: it's powerful, it works, and some projects genuinely need its flexibility. But if you're starting fresh with a standard React + TypeScript setup, there's no reason to reach for it. The concrete differences:

- **Sub-second startup**: no upfront bundling means the server answers immediately
- **Surgical HMR**: only the changed module is replaced, component state survives
- **Minimal config**: common setups work out of the box without five config files
- **Rollup in production**: aggressive tree-shaking, no additional tooling decisions needed
- **A real plugin ecosystem**: most of Rollup's plugins are already compatible

The one edge case where Webpack still wins: very custom build pipelines, legacy integrations that assume CommonJS everywhere, or older tools that generate Webpack-specific configs. For a greenfield project, those edge cases don't apply.
