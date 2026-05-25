---
id: vite-tooling
difficulty: beginner
tags: [tooling, Vite, build]
---

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

## Variables d'environnement

Vite expose au bundle client les variables préfixées par `VITE_`. Les variables sans ce préfixe restent côté serveur uniquement (scripts de build, SSR).

```bash
# .env
VITE_API_URL=https://api.example.com
SECRET_KEY=ne-pas-exposer          # non exposé au navigateur
```

```typescript
// Accès dans le code client
const apiUrl = import.meta.env.VITE_API_URL;

// Typage TypeScript
/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_API_URL: string;
}
```

## Alias de chemins

Utilisez l'option `resolve.alias` pour éviter les imports relatifs profonds :

```typescript
// Avant

// Après (avec l'alias "@" → "src/")
import { Button } from '@/components/ui/Button';

import { Button } from '../../../components/ui/Button';
```

Ajoutez également l'alias dans `tsconfig.json` pour que TypeScript résolve les chemins :

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

## Avantages vs Webpack

- Démarrage en millisecondes (pas de bundling initial)
- HMR basé sur ESM natif — mise à jour chirurgicale
- Configuration minimaliste par défaut
- Rollup en production — output optimisé
- Plugins compatibles Rollup
