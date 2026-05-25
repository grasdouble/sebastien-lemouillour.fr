---
id: vite-tooling
order: 1
difficulty: beginner
tags: [tooling, Vite, build]
---

Tu es en plein sprint. Tu ouvres ton terminal, tu lances `npm start`, et tu attends. Tu vas te faire un café. Quarante secondes plus tard, Webpack a fini d'analyser le graphe de dépendances et tu peux enfin voir l'appli. Tu modifies un composant, tu sauvegardes, et tu attends encore (cinq secondes cette fois, ce qui paraît raisonnable jusqu'à ce que tu le fasses cent fois dans la journée).

C'est exactement cette frustration qui m'a fait passer définitivement à Vite.

## Pourquoi Vite fonctionne comme ça

La lenteur de Webpack est structurelle : il bundle tout en amont, avant de servir le moindre fichier. Vite fait l'inverse. Il exploite les ES Modules natifs que tous les navigateurs modernes savent charger directement. En mode développement, Vite ne bundle rien : il sert les fichiers un par un, à la demande, exactement quand le navigateur les réclame. C'est pour ça que le serveur démarre en moins d'une seconde quelle que soit la taille du projet, et que le HMR ne met à jour que le module qui a changé, sans rebuild complet.

En production, Vite utilise Rollup en coulisses : tree-shaking, code splitting, output minifié. Les deux modes ne se contredisent pas : vitesse pendant le développement, optimisation à la livraison.

## Créer un projet Vite + React + TypeScript

Quatre commandes et c'est parti :

```bash
pnpm create vite my-app --template react-ts
cd my-app
pnpm install
pnpm dev
```

Quand le navigateur touche le serveur pour la première fois, chaque import devient une requête HTTP. Vite intercepte, transforme TypeScript et JSX à la volée, et répond. Pas de compilation en amont, pas d'attente.

## Structure du vite.config.ts

Je garde ma config de base minimaliste; les valeurs par défaut de Vite sont bonnes, et chaque option qu'on ajoute est une option à maintenir. Voici ce que j'utilise vraiment :

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

Le plugin React active Fast Refresh (la version React du HMR qui préserve l'état des composants entre les sauvegardes). L'alias `@` devient quasi-indispensable dès que le projet grandit (j'explique pourquoi juste en dessous). Les sourcemaps en production, je les active toujours : ça ne coûte rien au build et ça évite beaucoup de souffrance quand il faut déboguer une erreur en prod.

## Variables d'environnement

La première fois que j'ai eu besoin d'injecter une URL d'API, je l'ai mise dans `.env` et j'ai essayé de la lire, et j'ai passé vingt minutes à me demander pourquoi c'était `undefined`. Vite a une règle délibérée : **seules les variables préfixées par `VITE_` sont exposées au client**. Tout le reste reste côté serveur, invisible pour le navigateur. J'aime bien cette contrainte: elle rend les fuites de secrets accidentelles plus difficiles.

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

`../../../components/ui/Button`, c'est le signe que quelque chose a mal tourné. Pas techniquement, mais cognitivement : les imports relatifs profonds rendent le refactoring pénible, parce que déplacer un fichier implique de corriger une dizaine de chemins. L'alias `@` mappe tout l'arbre `src/` vers une racine stable unique :

```typescript
// Avant

// Après (avec l'alias "@" → "src/")
import { Button } from '@/components/ui/Button';

import { Button } from '../../../components/ui/Button';
```

Il faut aussi l'indiquer à TypeScript, sinon tu te retrouves avec des soulignements rouges partout malgré un code qui fonctionne parfaitement à l'exécution :

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

## Comparé à Webpack

Je ne vais pas prétendre que Webpack est mauvais : il est puissant, il fonctionne, et certains projets ont vraiment besoin de sa flexibilité. Mais si tu pars de zéro avec un projet React + TypeScript standard, il n'y a aucune raison de l'utiliser. Les différences concrètes :

- **Démarrage en moins d'une seconde**: pas de bundling en amont, le serveur répond immédiatement
- **HMR chirurgical**: seul le module modifié est remplacé, l'état des composants survit
- **Config minimaliste**: la plupart des cas fonctionnent sans cinq fichiers de configuration
- **Rollup en production**: tree-shaking agressif, pas de décisions d'outillage supplémentaires
- **Un vrai écosystème de plugins**: la majorité des plugins Rollup sont déjà compatibles

Le seul cas où Webpack garde l'avantage : les pipelines de build très personnalisés, les intégrations legacy qui supposent du CommonJS partout, ou les vieux outils qui génèrent des configs spécifiques à Webpack. Pour un projet en greenfield, ces cas de bord ne s'appliquent pas.
