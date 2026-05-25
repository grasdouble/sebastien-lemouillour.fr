import reactMicroFrontendsEn from './content/architecture/react-micro-frontends.en.md?raw';
import reactMicroFrontendsFr from './content/architecture/react-micro-frontends.fr.md?raw';
import introIaGenerativeEn from './content/ia-llm/intro-ia-generative.en.md?raw';
import introIaGenerativeFr from './content/ia-llm/intro-ia-generative.fr.md?raw';
import promptEngineeringEn from './content/ia-llm/prompt-engineering.en.md?raw';
import promptEngineeringFr from './content/ia-llm/prompt-engineering.fr.md?raw';
import pnpmWorkspacesEn from './content/tooling/pnpm-workspaces.en.md?raw';
import pnpmWorkspacesFr from './content/tooling/pnpm-workspaces.fr.md?raw';
import viteToolingEn from './content/tooling/vite-tooling.en.md?raw';
import viteToolingFr from './content/tooling/vite-tooling.fr.md?raw';

export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export type Tutorial = {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: Difficulty;
  tags: string[];
  content: string;
};

export type RawLearnItem = {
  id: string;
  categoryKey: string;
  difficulty: Difficulty;
  tags: string[];
  content: { fr: string; en: string };
};

export const CATEGORY_KEYS: readonly string[] = ['ia-llm', 'tooling', 'architecture'];

export const RAW_LEARN_ITEMS: readonly RawLearnItem[] = [
  {
    id: 'intro-ia-generative',
    categoryKey: 'ia-llm',
    difficulty: 'beginner',
    tags: ['IA', 'LLM'],
    content: { fr: introIaGenerativeFr, en: introIaGenerativeEn },
  },
  {
    id: 'vite-tooling',
    categoryKey: 'tooling',
    difficulty: 'beginner',
    tags: ['tooling', 'Vite', 'build'],
    content: { fr: viteToolingFr, en: viteToolingEn },
  },
  {
    id: 'pnpm-workspaces',
    categoryKey: 'tooling',
    difficulty: 'intermediate',
    tags: ['tooling', 'monorepo', 'pnpm'],
    content: { fr: pnpmWorkspacesFr, en: pnpmWorkspacesEn },
  },
  {
    id: 'react-micro-frontends',
    categoryKey: 'architecture',
    difficulty: 'advanced',
    tags: ['React', 'architecture', 'micro-frontend'],
    content: { fr: reactMicroFrontendsFr, en: reactMicroFrontendsEn },
  },
  {
    id: 'prompt-engineering',
    categoryKey: 'ia-llm',
    difficulty: 'intermediate',
    tags: ['IA', 'LLM', 'prompt'],
    content: { fr: promptEngineeringFr, en: promptEngineeringEn },
  },
];

export const ALL_TAGS: readonly string[] = [...new Set(RAW_LEARN_ITEMS.flatMap((t) => t.tags))].sort();
