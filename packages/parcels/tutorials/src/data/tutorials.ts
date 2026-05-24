export type ContentBlock =
  | { type: 'heading'; level: 2 | 3; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'code'; language: string; text: string }
  | { type: 'list'; items: string[] };

export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export type Tutorial = {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: Difficulty;
  tags: string[];
  content: ContentBlock[];
};

export const CATEGORY_ORDER: readonly string[] = ['IA & LLM', 'Tooling', 'Architecture'];

export const TUTORIALS: readonly Tutorial[] = [
  {
    id: 'intro-ia-generative',
    title: "Introduction à l'IA générative",
    description: "Comprendre les bases de l'IA générative, les LLMs et comment les utiliser dans vos projets.",
    category: 'IA & LLM',
    difficulty: 'beginner',
    tags: ['IA', 'LLM'],
    content: [
      { type: 'heading', level: 2, text: "Qu'est-ce que l'IA générative ?" },
      {
        type: 'paragraph',
        text: "L'IA générative désigne des modèles capables de produire du contenu original (texte, images, code, audio) à partir d'une invite (prompt). Ces modèles sont entraînés sur de grandes quantités de données et apprennent à modéliser la distribution statistique de ces données.",
      },
      { type: 'heading', level: 2, text: 'Les grands modèles de langage (LLMs)' },
      {
        type: 'paragraph',
        text: 'Un LLM (Large Language Model) est un réseau de neurones transformer entraîné sur des milliards de tokens. GPT-4, Claude, Gemini ou Llama en sont des exemples. Ils peuvent raisonner, résumer, traduire et générer du code.',
      },
      { type: 'heading', level: 3, text: 'Concepts clés' },
      {
        type: 'list',
        items: [
          'Token : unité de base du traitement du texte (environ 4 caractères)',
          'Contexte (context window) : nombre maximum de tokens que le modèle peut traiter en une seule fois',
          'Temperature : paramètre qui contrôle la créativité du modèle (0 = déterministe, 1 = créatif)',
          'Prompt engineering : art de formuler des instructions efficaces',
        ],
      },
      { type: 'heading', level: 2, text: 'Exemple : appeler un LLM via API' },
      {
        type: 'code',
        language: 'typescript',
        text: `const response = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': \`Bearer \${process.env.OPENAI_API_KEY}\`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: 'Explique les LLMs en 3 phrases.' }],
  }),
});
const data = await response.json();
console.log(data.choices[0].message.content);`,
      },
    ],
  },
  {
    id: 'vite-tooling',
    title: 'Vite : le build tool moderne',
    description:
      'Découvrez Vite, ses avantages par rapport à Webpack et comment configurer un projet React/TypeScript.',
    category: 'Tooling',
    difficulty: 'beginner',
    tags: ['tooling', 'Vite', 'build'],
    content: [
      { type: 'heading', level: 2, text: 'Pourquoi Vite ?' },
      {
        type: 'paragraph',
        text: 'Vite est un build tool nouvelle génération qui exploite les ES Modules natifs du navigateur en mode développement. Contrairement à Webpack qui bundle tout au démarrage, Vite sert les fichiers à la demande — ce qui donne des démarrages quasi-instantanés et un HMR ultra-rapide.',
      },
      { type: 'heading', level: 2, text: 'Créer un projet Vite + React + TypeScript' },
      {
        type: 'code',
        language: 'bash',
        text: `pnpm create vite my-app --template react-ts
cd my-app
pnpm install
pnpm dev`,
      },
      { type: 'heading', level: 2, text: 'Structure du vite.config.ts' },
      {
        type: 'code',
        language: 'typescript',
        text: `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

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
});`,
      },
      { type: 'heading', level: 2, text: 'Avantages vs Webpack' },
      {
        type: 'list',
        items: [
          'Démarrage en millisecondes (pas de bundling initial)',
          'HMR basé sur ESM natif — mise à jour chirurgicale',
          'Configuration minimaliste par défaut',
          'Rollup en production — output optimisé',
          'Plugins compatibles Rollup',
        ],
      },
    ],
  },
  {
    id: 'pnpm-workspaces',
    title: 'Monorepo avec pnpm workspaces',
    description:
      'Structurer et gérer un monorepo JavaScript/TypeScript avec pnpm workspaces, changesets et scripts partagés.',
    category: 'Tooling',
    difficulty: 'intermediate',
    tags: ['tooling', 'monorepo', 'pnpm'],
    content: [
      { type: 'heading', level: 2, text: "Qu'est-ce qu'un monorepo ?" },
      {
        type: 'paragraph',
        text: 'Un monorepo est un dépôt git unique qui contient plusieurs packages ou applications. Il facilite le partage de code, la cohérence des versions et les workflows CI/CD unifiés.',
      },
      { type: 'heading', level: 2, text: 'Configuration pnpm-workspace.yaml' },
      {
        type: 'code',
        language: 'yaml',
        text: `packages:
  - 'packages/**'
  - '!packages/**/node_modules/**'`,
      },
      { type: 'heading', level: 2, text: 'Commandes essentielles' },
      {
        type: 'list',
        items: [
          'pnpm install — installe toutes les dépendances du workspace',
          'pnpm -r build — build tous les packages',
          'pnpm --filter @my/package dev — lance un package spécifique',
          'pnpm add -D typescript --filter @my/package — ajoute une dep à un package',
        ],
      },
      { type: 'heading', level: 2, text: 'Changesets pour la gestion des versions' },
      {
        type: 'paragraph',
        text: "Changesets est un outil qui gère les versions et changelogs dans un monorepo. Chaque PR ajoute un fichier de changeset décrivant l'impact (patch/minor/major) sur les packages affectés.",
      },
      {
        type: 'code',
        language: 'bash',
        text: `# Ajouter un changeset
pnpm changeset

# Bumper les versions
pnpm changeset version

# Publier
pnpm changeset publish`,
      },
    ],
  },
  {
    id: 'react-micro-frontends',
    title: 'Micro-frontends avec React et single-spa',
    description:
      'Architecturer une application en micro-frontends indépendants avec single-spa, des import maps et des parcels React.',
    category: 'Architecture',
    difficulty: 'advanced',
    tags: ['React', 'architecture', 'micro-frontend'],
    content: [
      { type: 'heading', level: 2, text: "Qu'est-ce qu'un micro-frontend ?" },
      {
        type: 'paragraph',
        text: 'Un micro-frontend est une approche architecturale qui décompose une application web en plusieurs parties indépendantes, chacune développée, déployée et maintenue séparément. Chaque équipe peut choisir sa stack, son cycle de release et son périmètre fonctionnel.',
      },
      { type: 'heading', level: 2, text: 'single-spa : le orchestrateur' },
      {
        type: 'paragraph',
        text: "single-spa est un framework qui orchestre le chargement et le déchargement des micro-frontends selon l'URL active. Il gère le cycle de vie (bootstrap, mount, unmount) de chaque application.",
      },
      { type: 'heading', level: 2, text: 'Import maps : résolution des modules' },
      {
        type: 'code',
        language: 'json',
        text: `{
  "imports": {
    "@my/parcel-home": "http://localhost:4100/src/parcel.tsx",
    "@my/parcel-about": "http://localhost:4101/src/parcel.tsx"
  }
}`,
      },
      { type: 'heading', level: 2, text: "Cycle de vie d'un parcel" },
      {
        type: 'code',
        language: 'typescript',
        text: `import { createRoot } from 'react-dom/client';
import App from './App';

let root: ReturnType<typeof createRoot> | null = null;

export const bootstrap = () => Promise.resolve();

export const mount = () => new Promise((resolve, reject) => {
  const container = document.getElementById('app-container');
  if (!container) return reject(new Error('Container not found'));
  root ??= createRoot(container);
  root.render(<App />);
  resolve(void 0);
});

export const unmount = () => new Promise((resolve) => {
  root?.unmount();
  root = null;
  resolve(void 0);
});`,
      },
    ],
  },
  {
    id: 'prompt-engineering',
    title: 'Prompt Engineering : techniques avancées',
    description:
      'Maîtriser le prompt engineering avec des techniques comme le few-shot, chain-of-thought et le role prompting.',
    category: 'IA & LLM',
    difficulty: 'intermediate',
    tags: ['IA', 'LLM', 'prompt'],
    content: [
      { type: 'heading', level: 2, text: 'Few-shot prompting' },
      {
        type: 'paragraph',
        text: 'Le few-shot prompting consiste à fournir des exemples dans le prompt pour guider le modèle. Plus les exemples sont représentatifs, plus le résultat est précis.',
      },
      {
        type: 'code',
        language: 'text',
        text: `Traduis du français vers l'anglais :

Français: "Bonjour, comment allez-vous ?"
Anglais: "Hello, how are you?"

Français: "Merci beaucoup pour votre aide."
Anglais: "Thank you very much for your help."

Français: "Je voudrais réserver une table pour deux personnes."
Anglais:`,
      },
      { type: 'heading', level: 2, text: 'Chain-of-thought (CoT)' },
      {
        type: 'paragraph',
        text: 'Le CoT demande au modèle de raisonner étape par étape avant de donner sa réponse finale. Cela améliore significativement les performances sur les tâches complexes.',
      },
      {
        type: 'code',
        language: 'text',
        text: `Résous ce problème étape par étape :

Si un train part à 9h00 et roule à 120 km/h, et qu'un autre train part à 10h00 
de la même gare dans la même direction à 150 km/h, à quelle heure 
le second train rattrapera-t-il le premier ?

Raisonnement :`,
      },
      { type: 'heading', level: 2, text: 'Role prompting' },
      {
        type: 'paragraph',
        text: 'Assigner un rôle au modèle améliore la qualité et la cohérence des réponses dans un domaine spécifique.',
      },
      {
        type: 'list',
        items: [
          '"Tu es un expert en cybersécurité avec 20 ans d\'expérience..."',
          '"Tu es un professeur de mathématiques qui explique à des lycéens..."',
          '"Tu es un code reviewer senior qui cherche des bugs critiques..."',
        ],
      },
    ],
  },
];

export const ALL_TAGS: readonly string[] = [...new Set(TUTORIALS.flatMap((t) => t.tags))].sort();
