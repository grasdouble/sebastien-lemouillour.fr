import { getOpacityScale, getThemeColor } from './utils';

const TOKENS = [
  // HTML / JSX tags
  '<div>',
  '</div>',
  '<span>',
  '</span>',
  '<section>',
  '<article>',
  '<header>',
  '<footer>',
  '<nav>',
  '<main>',
  '<ul>',
  '<li>',
  '<p>',
  '<button>',
  '<input>',
  '<form>',
  '<label>',
  '<img />',
  '<br />',
  '<React.Fragment>',
  '</>',
  '<Suspense>',
  '<>',

  // JS / TS keywords
  'const',
  'let',
  'var',
  'async',
  'await',
  'import',
  'export',
  'return',
  'throw',
  'new',
  'typeof',
  'instanceof',
  'void',
  'try',
  'catch',
  'finally',
  'switch',
  'case',
  'break',
  'for',
  'while',
  'do',
  'if',
  'else',
  'default',
  'class',
  'extends',
  'super',
  'this',
  'static',
  'abstract',
  'null',
  'undefined',
  'true',
  'false',
  'NaN',
  'Infinity',

  // Operators / punctuation
  '=>',
  '{}',
  '[]',
  '()',
  '??',
  '?.',
  '||',
  '&&',
  '!==',
  '===',
  '...',
  '++',
  '--',
  '+=',
  '-=',
  '|>',
  '::',
  '**',

  // TypeScript
  'type',
  'interface',
  'string',
  'number',
  'boolean',
  'never',
  'unknown',
  'any',
  'enum',
  'namespace',
  'declare',
  'as const',
  'readonly',
  'keyof',
  'typeof',
  'infer',
  'satisfies',
  'Record<>',
  'Partial<>',
  'Required<>',
  'Pick<>',
  'Omit<>',
  'Promise<>',
  'Array<>',
  'Map<>',
  'Set<>',

  // React hooks & patterns
  'useState',
  'useEffect',
  'useRef',
  'useMemo',
  'useCallback',
  'useContext',
  'useReducer',
  'useId',
  'useDeferredValue',
  'useTransition',
  'createContext',
  'forwardRef',
  'memo',

  // CSS / design
  'flex',
  'grid',
  'block',
  'inline',
  'relative',
  'absolute',
  '@media',
  '@keyframes',
  '@layer',
  '@container',
  'rem',
  'em',
  'px',
  'vw',
  'vh',
  'fr',
  '%',
  'ch',
  'var(--)',
  ':root',
  ':hover',
  ':focus',
  '::before',
  '::after',
  'transition',
  'transform',
  'animation',
  'opacity',
  'display:',
  'position:',
  'z-index:',
  'gap:',
  'padding:',

  // File extensions / module paths
  '.tsx',
  '.ts',
  '.css',
  '.json',
  '.svg',
  '.module.css',
  'index.ts',
  'types.ts',
  'utils.ts',
  'hooks.ts',

  // CI / CD
  'ci.yml',
  'release.yml',
  'deploy.yml',
  '.github/',
  'workflow:',
  'on: push',
  'on: pull_request',
  'runs-on:',
  'ubuntu-latest',
  'uses:',
  'steps:',
  'jobs:',
  'needs:',
  'env:',
  'secrets.',
  'actions/checkout',
  'actions/setup-node',
  'cache:',
  'if: success()',
  'continue-on-error:',
  'matrix:',

  // Tooling / package managers
  'pnpm',
  'npm',
  'yarn',
  'npx',
  'node',
  'pnpm install',
  'pnpm build',
  'pnpm lint',
  'pnpm typecheck',
  'package.json',
  'pnpm-lock.yaml',
  '.npmrc',
  'workspaces:',
  'devDependencies',
  'peerDependencies',

  // Config files
  '.eslintrc',
  'eslint.config',
  'prettier.config',
  'vite.config',
  'tsconfig.json',
  '.env',
  '.env.local',
  'turbo.json',
  '.gitignore',
  '.gitattributes',
  'CHANGELOG.md',

  // Git
  'git commit',
  'git push',
  'git merge',
  'git rebase',
  'git stash',
  'git diff',
  'git log',
  'git blame',
  'feat:',
  'fix:',
  'chore:',
  'refactor:',
  'docs:',
  'ci:',
  'HEAD',
  'origin',
  'main',
  'BREAKING CHANGE',

  // Testing
  'describe()',
  'it()',
  'test()',
  'expect()',
  'vi.fn()',
  'beforeEach()',
  'afterEach()',
  'vitest',
  'coverage',
];

type Particle = {
  x: number;
  y: number;
  text: string;
  speed: number;
  drift: number;
  opacity: number;
  size: number;
};

export function setupFloatingTokens(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): () => void {
  let animId: number;
  let resizeTimer: ReturnType<typeof setTimeout>;
  let particles: Particle[] = [];
  let w = 0;
  let h = 0;
  let color = getThemeColor();
  let opacityScale = getOpacityScale();

  const updateTheme = () => {
    color = getThemeColor();
    opacityScale = getOpacityScale();
  };

  const themeObserver = new MutationObserver(updateTheme);
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme', 'data-mode'],
  });

  // Accept explicit dimensions to avoid forced layout reflow when called from ResizeObserver
  const resize = (width: number, height: number) => {
    w = canvas.width = width;
    h = canvas.height = height;
    particles.forEach((p) => {
      if (p.x > w) p.x = Math.random() * w;
    });
  };

  const create = (startY?: number): Particle => ({
    x: Math.random() * w,
    y: startY ?? -20,
    text: TOKENS[Math.floor(Math.random() * TOKENS.length)],
    speed: 0.25 + Math.random() * 0.35,
    drift: (Math.random() - 0.5) * 0.2,
    opacity: 0.1 + Math.random() * 0.15,
    size: 10 + Math.floor(Math.random() * 5),
  });

  const init = () => {
    resize(canvas.offsetWidth, canvas.offsetHeight);
    particles = Array.from({ length: 25 }, () => create(Math.random() * h));
  };

  const draw = () => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = color;

    particles.forEach((p) => {
      ctx.globalAlpha = Math.min(1, p.opacity * opacityScale);
      ctx.font = `${p.size}px monospace`;
      ctx.fillText(p.text, p.x, p.y);
      p.y += p.speed;
      p.x += p.drift;
      if (p.y > h + 30) Object.assign(p, create());
    });

    ctx.globalAlpha = 1;
    animId = requestAnimationFrame(draw);
  };

  // Defer the initial layout read to rAF to avoid forced reflow after React's commit phase
  const initRafId = requestAnimationFrame(() => {
    init();
    draw();
  });

  // Use entries[0].contentRect (already computed by the browser) to avoid a second forced layout
  const ro = new ResizeObserver((entries: ResizeObserverEntry[]) => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const { width, height } = entries[0].contentRect;
      resize(width, height);
    }, 50);
  });
  ro.observe(canvas);

  return () => {
    cancelAnimationFrame(initRafId);
    cancelAnimationFrame(animId);
    clearTimeout(resizeTimer);
    ro.disconnect();
    themeObserver.disconnect();
    ctx.clearRect(0, 0, w, h);
  };
}
