/**
 * Resolves a DS CSS custom property to a hex color by temporarily applying
 * it to a hidden element and reading the computed value.
 */
function resolveColor(cssVar: string): string {
  const el = document.createElement('div');
  el.style.position = 'absolute';
  el.style.visibility = 'hidden';
  el.style.pointerEvents = 'none';
  document.body.appendChild(el);
  el.style.color = `var(${cssVar})`;
  const rgb = getComputedStyle(el).color;
  document.body.removeChild(el);
  return rgbToHex(rgb);
}

function rgbToHex(rgb: string): string {
  const match = rgb.match(/\d+/g);
  if (!match || match.length < 3) return '#000000';
  return (
    '#' +
    match
      .slice(0, 3)
      .map((n) => parseInt(n, 10).toString(16).padStart(2, '0'))
      .join('')
  );
}

function getEffectiveDarkMode(): boolean {
  const mode = document.documentElement.getAttribute('data-mode') ?? 'light';
  if (mode === 'dark') return true;
  if (mode === 'auto') {
    return (
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
    );
  }
  return false;
}

export function getMermaidThemeVariables(): Record<string, string | boolean> {
  return {
    darkMode: getEffectiveDarkMode(),
    background: resolveColor('--lufa-semantic-ui-background-page'),
    // Use the brand primary color for nodes so they stand out from the page
    // background regardless of theme/mode (the surface tokens are too close to
    // the page background in dark mode and become invisible).
    primaryColor: resolveColor('--lufa-core-color-brand-primary-default'),
    primaryTextColor: resolveColor('--lufa-core-color-brand-primary-on-background'),
    lineColor: resolveColor('--lufa-semantic-ui-text-primary'),
    edgeLabelBackground: resolveColor('--lufa-core-color-brand-primary-default'),
  };
}
