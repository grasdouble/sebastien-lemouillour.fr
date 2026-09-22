type ImportMap = { imports: Record<string, string> };

async function loadImportMap(path: string): Promise<ImportMap> {
  const response = await fetch(path, { cache: 'no-cache', signal: AbortSignal.timeout(15_000) });
  if (!response.ok) throw new Error(`Import map unavailable (${response.status})`);
  const map: unknown = await response.json();
  if (
    !map ||
    typeof map !== 'object' ||
    !('imports' in map) ||
    !map.imports ||
    typeof map.imports !== 'object' ||
    Array.isArray(map.imports) ||
    !Object.values(map.imports).every((url) => typeof url === 'string')
  )
    throw new Error('Invalid import map');
  return map as ImportMap;
}

// This fallback must work before React, translations or CDN styles have loaded.
export function showStartupError(reload = () => window.location.reload()): void {
  document.getElementById('lufa-loader')?.classList.remove('visible');
  const error = document.getElementById('startup-error');
  if (!error) return;
  error.hidden = false;
  const english = navigator.language.startsWith('en');
  const message = error.querySelector('[role="alert"]');
  if (message)
    message.textContent = english
      ? 'The page could not be loaded. Please try again.'
      : 'La page n’a pas pu être chargée. Réessaie dans quelques instants.';
  const button = error.querySelector('button');
  if (button) {
    button.textContent = english ? 'Try again' : 'Réessayer';
    button.onclick = reload;
  }
}

export async function bootstrap(mode: string, start: () => Promise<unknown>): Promise<void> {
  try {
    const localMode = mode === 'development' || mode === 'preview';
    if (mode === 'development') {
      try {
        localStorage.setItem('devtools', 'true');
      } catch {
        /* Storage is optional. */
      }
    }
    const base = await loadImportMap(
      localMode ? '/importMap.json' : 'https://cdn.sebastien-lemouillour.fr/importMap.json'
    );
    const overrides = localMode
      ? await loadImportMap(`/importMap.overrides.${mode === 'development' ? 'dev' : 'preview'}.json`)
      : { imports: {} };
    const script = document.createElement('script');
    script.type = 'importmap';
    script.textContent = JSON.stringify({ imports: { ...base.imports, ...overrides.imports } });
    document.head.prepend(script);
    await start();
  } catch {
    showStartupError();
  }
}
