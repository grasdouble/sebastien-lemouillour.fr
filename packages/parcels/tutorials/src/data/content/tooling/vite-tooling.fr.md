## Pourquoi Vite ?

Vite est un build tool nouvelle génération qui exploite les ES Modules natifs du navigateur en mode développement. Contrairement à Webpack qui bundle tout au démarrage, Vite sert les fichiers à la demande — ce qui donne des démarrages quasi-instantanés et un HMR ultra-rapide.

## Créer un projet Vite + React + TypeScript

```bash
pnpm create vite my-app --template react-ts
cd my-app
pnpm install
pnpm dev
```

## Structure du vite.config.ts

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

## Avantages vs Webpack

- Démarrage en millisecondes (pas de bundling initial)
- HMR basé sur ESM natif — mise à jour chirurgicale
- Configuration minimaliste par défaut
- Rollup en production — output optimisé
- Plugins compatibles Rollup
