---
id: vite-tooling
order: 1
difficulty: beginner
tags: [tooling, Vite, build]
publishedAt: 2026-05-22
updatedAt: 2026-05-30
---

You're mid-sprint. You open your terminal, run `npm start`, and then you wait. You go refill your coffee. Forty seconds later, Webpack has finished analyzing the dependency graph and you can finally see the app. You change one component, hit save, and wait again.

That pain is exactly why I'd reach for [Vite's guide](https://vite.dev/guide/) for a new React + TypeScript app almost every time. Vite's core bet is simple: keep development fast with a dev server built around native ES modules, then use Rolldown for production builds.

## Why it feels fast

Webpack makes you pay the bundling cost before the browser gets anything. Vite changes that trade-off. As the [Features guide](https://vite.dev/guide/features.html) explains, it serves source modules on demand, pre-bundles dependencies separately, and pushes updates through HMR instead of rebuilding the whole app. That's the part people feel immediately: the wait gets shorter, so your train of thought survives.

## Create the project first

If all you need is a normal React + TypeScript app, I would start with the official template and resist the urge to customize anything on day one.

A clean scaffold is enough to prove the setup before you start tuning it:

```bash
pnpm create vite my-app --template react-ts
cd my-app
pnpm install
pnpm dev
```

## Keep `vite.config.ts` small

Once the app is running, the next temptation is to add config because it feels productive. I usually do the opposite. I keep only the options that remove daily friction.

This is the kind of config I would keep:

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
  server: {
    port: 3000,
  },
});
```

The [resolve.alias option](https://vite.dev/config/shared-options.html#resolve-alias) expects absolute file-system paths, which is why `path.resolve(__dirname, 'src')` matters. I'd add `build.sourcemap` later only if your debugging setup actually needs it. Beginner setups are easier to trust when the config stays boring.

## Environment variables are intentionally strict

The first time `import.meta.env.MY_API_URL` comes back `undefined`, it feels a little rude. Then it makes sense. The [Env and Mode guide](https://vite.dev/guide/env-and-mode.html) says only variables prefixed with `VITE_` are exposed to client code, and they are exposed as strings. That rule is helpful because it makes accidental secret leaks harder.

Put the variable in `.env` like this:

```bash
VITE_API_URL=https://api.example.com
SECRET_KEY=do-not-expose
```

Then read it in client code like this:

```typescript
const apiUrl = import.meta.env.VITE_API_URL;
```

If you want editor autocomplete for custom keys, add `vite/client` types in a `vite-env.d.ts` file or your `tsconfig` types. One more thing beginners trip on: Vite transpiles TypeScript, but it does not type-check it for you. I'd keep your IDE warnings on and run a separate type check in scripts or CI.

## Path aliases are for humans

Deep relative imports are not morally wrong, but they do make refactors feel like punishment. Once you catch yourself typing `../../../`, give yourself a cleaner escape hatch.

After adding the alias in `vite.config.ts`, mirror it for TypeScript so the editor agrees with the runtime:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

If you're starting a standard React + TypeScript project today, I'd choose Vite and not overthink it. I would only reach for a heavier setup when you already know you need a very custom or legacy build pipeline.
