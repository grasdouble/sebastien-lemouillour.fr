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

## Environment variables

Vite exposes env variables prefixed with `VITE_` to the client bundle. Variables without the prefix remain server-side only (build scripts, SSR).

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

Use the `resolve.alias` option to avoid deep relative imports:

```typescript
// Before

// After (with alias "@" → "src/")
import { Button } from '@/components/ui/Button';

import { Button } from '../../../components/ui/Button';
```

Also add the alias to `tsconfig.json` so TypeScript resolves the paths:

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

- Startup in milliseconds (no initial bundling)
- HMR based on native ESM — surgical hot updates
- Minimal configuration by default
- Rollup in production — optimized output
- Rollup-compatible plugins
