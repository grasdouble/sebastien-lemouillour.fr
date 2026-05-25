## Why Vite?

Vite is a next-generation build tool that leverages native ES Modules in the browser during development. Unlike Webpack which bundles everything at startup, Vite serves files on demand — resulting in near-instant startup times and ultra-fast HMR.

## Create a Vite + React + TypeScript project

```bash
pnpm create vite my-app --template react-ts
cd my-app
pnpm install
pnpm dev
```

## Structure of vite.config.ts

```typescript
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
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

## Advantages vs Webpack

- Startup in milliseconds (no initial bundling)
- HMR based on native ESM — surgical hot updates
- Minimal configuration by default
- Rollup in production — optimized output
- Rollup-compatible plugins
