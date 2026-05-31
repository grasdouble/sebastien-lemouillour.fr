import { useEffect, useState } from 'react';

function getThemeKey(): string {
  const theme = document.documentElement.getAttribute('data-theme') ?? 'lufa';
  const rawMode = document.documentElement.getAttribute('data-mode') ?? 'light';

  let effectiveMode: string;
  if (rawMode === 'auto') {
    const prefersDark =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches;
    effectiveMode = prefersDark ? 'dark' : 'light';
  } else {
    effectiveMode = rawMode;
  }

  return `${theme}:${effectiveMode}`;
}

/**
 * Returns a string key that changes whenever the active DS theme or color mode
 * changes. Components can include this in their effect dependency arrays to
 * react to theme switches.
 *
 * - Theme switches: synchronized via the `lufa-theme-ready` CustomEvent that
 *   the container dispatches after the new theme CSS has finished loading.
 * - Mode switches: picked up immediately via MutationObserver (light/dark
 *   variants live in the same CSS bundle as the theme).
 * - Auto mode: also reacts to OS-level `prefers-color-scheme` changes.
 */
export function useDSThemeKey(): string {
  const [key, setKey] = useState(getThemeKey);

  useEffect(() => {
    const update = () => setKey(getThemeKey());

    // Theme change: react only after new CSS has been applied.
    document.addEventListener('lufa-theme-ready', update);

    // Mode change: CSS for both light and dark are bundled together, so it is
    // safe to react immediately to the attribute change.
    const modeObserver = new MutationObserver(update);
    modeObserver.observe(document.documentElement, { attributeFilter: ['data-mode'] });

    // Auto mode: also re-render when the OS dark mode preference changes.
    const mq =
      typeof window !== 'undefined' && typeof window.matchMedia === 'function'
        ? window.matchMedia('(prefers-color-scheme: dark)')
        : null;
    const onMqChange = () => {
      if ((document.documentElement.getAttribute('data-mode') ?? 'light') === 'auto') {
        update();
      }
    };
    mq?.addEventListener('change', onMqChange);

    return () => {
      document.removeEventListener('lufa-theme-ready', update);
      modeObserver.disconnect();
      mq?.removeEventListener('change', onMqChange);
    };
  }, []);

  return key;
}
