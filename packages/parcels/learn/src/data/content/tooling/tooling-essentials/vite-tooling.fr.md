---
id: vite-tooling
order: 1
difficulty: beginner
tags: [tooling, Vite, build]
---

Pendant longtemps, démarrer un projet frontend signifiait attendre. Webpack devait analyser et bundler toute l'application avant de servir la première page — 20, 30, parfois 60 secondes à chaque `npm start`. Et dès qu'un fichier changeait, le Hot Module Replacement recompilait tout le graphe de dépendances. Dans un projet de taille moyenne, enregistrer un fichier et voir le résultat dans le navigateur prenait plusieurs secondes.

Vite repart de zéro en posant une question différente : et si on ne bundlait rien du tout en développement ?

## Pourquoi Vite ?

Vite exploite les ES Modules natifs que les navigateurs modernes supportent directement. En mode développement, il ne bundle pas votre code — il le sert tel quel au navigateur, fichier par fichier, à la demande. Le résultat est un démarrage quasi-instantané, même sur un projet avec des centaines de composants, et un HMR qui ne met à jour que le module qui a changé.

En production, Vite utilise Rollup pour produire un bundle optimisé : tree-shaking, code splitting, compression. Vous bénéficiez du meilleur des deux mondes — vitesse en développement, optimisation en production.

## Créer un projet Vite + React + TypeScript

Trois commandes suffisent pour démarrer :

```bash
pnpm create vite my-app --template react-ts
cd my-app
pnpm install
pnpm dev
```

Le serveur démarre en moins d'une seconde. La première visite dans le navigateur transforme les imports en requêtes HTTP — Vite répond à chacune en transformant le fichier à la volée (TypeScript, JSX, CSS Modules).

## Structure du vite.config.ts

Une fois le projet lancé, la configuration arrive généralement juste après. Bonne nouvelle : la configuration de base de Vite tient en quelques lignes.

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

Les options les plus utiles ici sont la configuration des plugins (React avec Fast Refresh), les alias de chemin pour éviter les imports relatifs profonds, et les réglages du serveur de développement.

## Variables d'environnement

Une question concrète arrive vite : comment passer l'URL d'une API au frontend sans injecter tout votre environnement dans le navigateur ? Vite applique une règle simple : seules les variables préfixées par `VITE_` sont injectées dans le bundle client. Les autres restent côté serveur et demeurent invisibles pour le navigateur.

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

Dès qu'un projet grandit, les imports relatifs deviennent difficiles à lire : `../../../components/ui/Button`. Un alias de chemin corrige ça en donnant à tout l'arbre `src/` un point d'entrée stable :

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

Si vous venez de Webpack, voici ce que vous gagnez concrètement :

- **Démarrage en millisecondes** — pas de bundling initial, le serveur répond immédiatement
- **HMR chirurgical** — seul le module modifié est mis à jour, sans recharger l'état de l'application
- **Configuration minimaliste** — la plupart des cas sont couverts par défaut, sans configuration custom
- **Rollup en production** — tree-shaking agressif et output optimisé sans configuration supplémentaire
- **Écosystème Rollup** — des centaines de plugins déjà compatibles

Vite ne remplace pas Webpack dans tous les cas. Les pipelines de build très personnalisés ou les intégrations inhabituelles peuvent encore demander davantage de travail. Mais pour un projet React + TypeScript standard, il est difficile de trouver un meilleur choix par défaut.
