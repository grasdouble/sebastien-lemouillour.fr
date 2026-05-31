---
id: vite-tooling
order: 1
difficulty: beginner
tags: [tooling]
publishedAt: 2026-05-22
updatedAt: 2026-05-30
---

You're mid-sprint. You open your terminal, run `npm start`, and then you wait. You go refill your coffee. Forty seconds later, the dev server is finally ready. You change one component, hit save, and lose your train of thought while the page catches up.

That pain is why I'd pick [Vite's guide](https://vite.dev/guide/) for a new React + TypeScript app almost every time. If the phrase "ES modules" sounds abstract, think "the browser's built-in way to load JavaScript files". Vite leans on that during development, then uses Rolldown for production builds.

## Why it feels fast

Older setups often bundle everything before the browser sees anything. Vite avoids that bottleneck. As the [Features guide](https://vite.dev/guide/features.html) explains, it serves source files on demand, pre-bundles dependencies separately, and updates changed modules without rebuilding the whole app. That is the real win for beginners: less waiting means fewer chances to get lost.

## Create the project first

Once you know the tool is solving the waiting problem, the next risk is over-planning. I would not start with custom folders, custom ports, and five plugins. I would start with the official starter project and prove that the basics work first.

This is enough to get a React + TypeScript app running:

```bash
pnpm create vite my-app --template react-ts
cd my-app
pnpm install
pnpm dev
```

## Keep `vite.config.ts` small

After the app starts, the usual temptation is to add config because it feels like progress. I think that is where beginners get trapped. A config file is only helpful when it removes a repeated annoyance.

This is the kind of config I would keep:

```typescript
import { fileURLToPath, URL } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
```

The [resolve.alias option](https://vite.dev/config/shared-options.html#resolve-alias) expects absolute file-system paths, which is why the example resolves `./src` to a full path first. I would leave everything else out until a real need appears. Small config is easier to debug because every line has a job.

## Environment variables are intentionally strict

The next confusing moment usually arrives when `import.meta.env.MY_API_URL` comes back `undefined`. That is not Vite being picky for fun. The [env variables guide](https://vite.dev/guide/env-and-mode.html#env-variables) says only variables prefixed with `VITE_` are exposed to client code, and they arrive as strings.

Put the variable in `.env` like this:

```bash
VITE_API_URL=https://api.example.com
SECRET_KEY=do-not-expose
```

Then read it in client code like this:

```typescript
const apiUrl = import.meta.env.VITE_API_URL;
```

If you want autocomplete for your own keys, the [TypeScript IntelliSense guide](https://vite.dev/guide/env-and-mode.html#intellisense-for-typescript) shows how to extend `ImportMetaEnv` in a `vite-env.d.ts` file.

## Vite is fast because it skips one job

At this point, one beginner confusion is still left: "If Vite is handling my TypeScript files, why did it miss this type error?" The answer is that the [TypeScript guide](https://vite.dev/guide/features.html#typescript) says Vite transpiles TypeScript but does not type-check it. Transpiling means turning TypeScript into runnable JavaScript. Type-checking means verifying that your types actually line up across files.

That separation is a good trade-off. I would keep IDE warnings on and run type checks separately instead of asking the dev server to do two jobs badly.

## Path aliases are for humans

Once the app grows, the next pain is not speed. It is readability. If you keep typing `../../../`, you are spending attention on folder math instead of the feature you meant to build.

After adding the alias in `vite.config.ts`, mirror it in TypeScript so your editor resolves the same imports:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

If your app is still a normal client-side React + TypeScript project, I would choose Vite first and keep the config boring until a real constraint shows up. When you first need to tune deployment paths or production output, go to the [Build guide](https://vite.dev/guide/build) next and add one option for one reason.
