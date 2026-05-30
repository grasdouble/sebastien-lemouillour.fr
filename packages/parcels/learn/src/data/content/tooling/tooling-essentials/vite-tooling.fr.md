---
id: vite-tooling
order: 1
difficulty: beginner
tags: [tooling, Vite, build]
publishedAt: 2026-05-22
updatedAt: 2026-05-30
---

Tu es en plein sprint. Tu ouvres ton terminal, tu lances `npm start`, puis tu attends. Tu vas remplir ton mug. Quarante secondes plus tard, Webpack a fini d'analyser le graphe de dépendances et tu peux enfin voir l'appli. Tu modifies un composant, tu sauvegardes, et tu attends encore.

C'est exactement pour ça que je choisirais presque toujours le [guide Vite](https://vite.dev/guide/) pour un nouveau projet React + TypeScript. L'idée de Vite est simple : garder le développement rapide avec un serveur basé sur les ES modules natifs, puis utiliser Rolldown pour les builds de production.

## Pourquoi c'est plus rapide

Avec Webpack, tu paies le coût du bundling avant que le navigateur reçoive quoi que ce soit. Vite change ce compromis. Comme l'explique le [guide des fonctionnalités](https://vite.dev/guide/features.html), il sert les modules source à la demande, pré-bundle les dépendances à part, puis pousse les mises à jour via le HMR au lieu de reconstruire toute l'application. C'est ce que tu ressens tout de suite : l'attente raccourcit, donc tu gardes ton fil de pensée.

## Commence par le template officiel

Si tu veux juste une appli React + TypeScript classique, je partirais du template officiel et je résisterais à l'envie de tout personnaliser dès le premier jour.

Un scaffold propre suffit pour valider le setup avant de commencer à le bricoler :

```bash
pnpm create vite my-app --template react-ts
cd my-app
pnpm install
pnpm dev
```

## Garde `vite.config.ts` petit

Une fois l'appli lancée, la tentation suivante, c'est d'ajouter de la config parce que ça donne l'impression d'avancer. Je fais plutôt l'inverse. Je garde seulement les options qui enlèvent une vraie friction au quotidien.

Voilà le genre de config que je garderais :

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

L'option [resolve.alias](https://vite.dev/config/shared-options.html#resolve-alias) attend des chemins absolus sur le système de fichiers, d'où le `path.resolve(__dirname, 'src')`. J'ajouterais `build.sourcemap` plus tard, seulement si ton outillage de débogage en a vraiment besoin. Les setups débutants sont plus rassurants quand la config reste ennuyeuse.

## Les variables d'environnement sont volontairement strictes

La première fois que `import.meta.env.MY_API_URL` renvoie `undefined`, ça pique un peu. Puis la règle devient logique. Le [guide Env and Mode](https://vite.dev/guide/env-and-mode.html) dit que seules les variables préfixées par `VITE_` sont exposées au code client, et elles le sont sous forme de chaînes. J'aime bien cette contrainte parce qu'elle réduit les fuites de secrets accidentelles.

Mets la variable dans `.env` comme ceci :

```bash
VITE_API_URL=https://api.example.com
SECRET_KEY=ne-pas-exposer
```

Puis lis-la dans le code client comme ceci :

```typescript
const apiUrl = import.meta.env.VITE_API_URL;
```

Si tu veux l'autocomplétion de l'éditeur pour tes clés personnalisées, ajoute les types `vite/client` dans un fichier `vite-env.d.ts` ou dans les types de ton `tsconfig`. Il y a aussi un piège classique au début : Vite transpile TypeScript, mais il ne fait pas le type-checking à ta place. Je garderais donc les alertes de l'IDE actives et un type check séparé dans les scripts ou la CI.

## Les alias de chemins sont là pour les humains

Les imports relatifs profonds ne sont pas un péché, mais ils rendent les refactors franchement punitifs. Dès que tu te surprends à taper `../../../`, offre-toi une sortie plus propre.

Après avoir ajouté l'alias dans `vite.config.ts`, reflète-le dans TypeScript pour que l'éditeur soit d'accord avec l'exécution :

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

Si tu démarres aujourd'hui un projet React + TypeScript standard, je choisirais Vite sans trop réfléchir. Je ne passerais sur un setup plus lourd que si tu sais déjà que tu dépends d'une chaîne de build très personnalisée ou franchement legacy.
