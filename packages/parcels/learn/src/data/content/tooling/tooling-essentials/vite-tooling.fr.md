---
id: vite-tooling
order: 1
difficulty: beginner
tags: [tooling, Vite, build]
publishedAt: 2026-05-22
updatedAt: 2026-05-30
---

Tu es en plein sprint. Tu ouvres ton terminal, tu lances `npm start`, puis tu attends. Tu vas remplir ton mug. Quarante secondes plus tard, le serveur de dev est enfin prêt. Tu modifies un composant, tu sauvegardes, et tu perds ton fil pendant que la page rattrape son retard.

C'est pour cette douleur-là que je choisirais presque toujours le [guide Vite](https://vite.dev/guide/) pour un nouveau projet React + TypeScript. Si l'expression "ES modules" te paraît floue, pense "la façon native du navigateur pour charger des fichiers JavaScript". Vite s'appuie là-dessus pendant le développement, puis utilise Rolldown pour les builds de production.

## Pourquoi c'est plus rapide

Les setups plus anciens bundle souvent tout avant même que le navigateur reçoive quoi que ce soit. Vite évite ce goulot d'étranglement. Comme l'explique le [guide des fonctionnalités](https://vite.dev/guide/features.html), il sert les fichiers source à la demande, pré-bundle les dépendances à part, puis met à jour les modules modifiés sans reconstruire toute l'application. Pour un débutant, le vrai bénéfice est là : moins d'attente, donc moins d'occasions de te perdre.

## Commence par créer le projet

Une fois que tu as compris que l'outil règle surtout un problème d'attente, le risque suivant, c'est d'en faire trop trop vite. Je ne commencerais pas avec des dossiers personnalisés, des ports personnalisés et cinq plugins. Je partirais d'abord du starter officiel pour vérifier que les bases fonctionnent.

Ça suffit pour lancer une appli React + TypeScript :

```bash
pnpm create vite my-app --template react-ts
cd my-app
pnpm install
pnpm dev
```

## Garde `vite.config.ts` petit

Après le premier lancement, la tentation classique, c'est d'ajouter de la config parce que ça donne l'impression d'avancer. Je pense que c'est là que beaucoup de débutants se piègent. Un fichier de config n'aide que s'il enlève une gêne répétée.

Voilà le genre de config que je garderais :

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

L'option [resolve.alias](https://vite.dev/config/shared-options.html#resolve-alias) attend des chemins absolus sur le système de fichiers, donc l'exemple transforme d'abord `./src` en chemin complet. Je laisserais le reste de côté jusqu'au jour où un vrai besoin apparaît. Une petite config se débogue mieux parce que chaque ligne a une raison d'être.

## Les variables d'environnement sont volontairement strictes

Le moment de confusion suivant arrive souvent quand `import.meta.env.MY_API_URL` renvoie `undefined`. Ce n'est pas Vite qui fait du zèle. Le [guide des variables d'environnement](https://vite.dev/guide/env-and-mode.html#env-variables) dit que seules les variables préfixées par `VITE_` sont exposées au code client, et elles arrivent sous forme de chaînes.

Mets la variable dans `.env` comme ceci :

```bash
VITE_API_URL=https://api.example.com
SECRET_KEY=ne-pas-exposer
```

Puis lis-la dans le code client comme ceci :

```typescript
const apiUrl = import.meta.env.VITE_API_URL;
```

Si tu veux l'autocomplétion pour tes propres clés, le [guide IntelliSense](https://vite.dev/guide/env-and-mode.html#intellisense-for-typescript) montre comment étendre `ImportMetaEnv` dans un fichier `vite-env.d.ts`.

## Vite reste rapide parce qu'il saute un travail

À ce stade, il reste souvent une question de débutant : « Si Vite gère mes fichiers TypeScript, pourquoi il n'a pas vu cette erreur de type ? » La réponse, c'est que le [guide TypeScript](https://vite.dev/guide/features.html#typescript) explique que Vite transpile TypeScript mais ne fait pas le type-checking. Transpiler, c'est transformer du TypeScript en JavaScript exécutable. Le type-checking, c'est vérifier que tes types sont cohérents entre les fichiers.

Je trouve ce choix sain. Je garderais les alertes de l'IDE actives et un type check séparé, au lieu de demander au serveur de dev de faire deux jobs à moitié.

## Les alias de chemins sont là pour les humains

Quand l'application grandit, le problème suivant n'est plus la vitesse. C'est la lisibilité. Si tu tapes `../../../` toute la journée, tu dépenses ton attention en calcul de dossiers au lieu de la garder pour la fonctionnalité.

Après avoir ajouté l'alias dans `vite.config.ts`, reflète-le dans TypeScript pour que l'éditeur résolve les mêmes imports :

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

Si ton appli reste un projet React + TypeScript côté client assez classique, je choisirais Vite d'abord et je garderais la config ennuyeuse jusqu'à l'apparition d'une vraie contrainte. Le jour où tu dois régler les chemins de déploiement ou la sortie de build, passe ensuite au [guide Build](https://vite.dev/guide/build) et ajoute une option pour une seule raison.
