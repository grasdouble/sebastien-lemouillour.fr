import type { LifeCycles } from 'single-spa';
import { registerApplication, start } from 'single-spa';

import { initializeGoogleAnalytics } from '@grasdouble/slm_shared';

import 'import-map-overrides';
import './i18n';
import './reset.css';

import { hideLoader, loaderPreview, showLoader } from './loader';
import { PARCELS } from './parcels';

const THEME_STORAGE_KEY = 'lufa-theme-name';
const DEFAULT_THEME = 'ocean';

/**
 * Dynamically loads a theme CSS file on demand.
 * The switch-case allows Vite to statically analyze each import and code-split them.
 * The 'lufa' base theme is already included in the DS main style.css — no separate file needed.
 */
async function loadThemeCss(theme: string): Promise<void> {
  switch (theme) {
    case 'ocean':
      await import('@grasdouble/lufa_design-system-themes/ocean.css');
      break;
    case 'forest':
      await import('@grasdouble/lufa_design-system-themes/forest.css');
      break;
    case 'matrix':
      await import('@grasdouble/lufa_design-system-themes/matrix.css');
      break;
    case 'cyberpunk':
      await import('@grasdouble/lufa_design-system-themes/cyberpunk.css');
      break;
    case 'sunset':
      await import('@grasdouble/lufa_design-system-themes/sunset.css');
      break;
    case 'nordic':
      await import('@grasdouble/lufa_design-system-themes/nordic.css');
      break;
    case 'volcano':
      await import('@grasdouble/lufa_design-system-themes/volcano.css');
      break;
    case 'coffee':
      await import('@grasdouble/lufa_design-system-themes/coffee.css');
      break;
    case 'volt':
      await import('@grasdouble/lufa_design-system-themes/volt.css');
      break;
    case 'steampunk':
      await import('@grasdouble/lufa_design-system-themes/steampunk.css');
      break;
  }
}

function getInitialTheme(): string {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY) ?? DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
}

// Load the active theme immediately to avoid flash of unstyled content.
void loadThemeCss(getInitialTheme());

// Load new theme CSS whenever data-theme changes (user switches themes).
new MutationObserver(() => {
  const theme = document.documentElement.getAttribute('data-theme');
  if (theme) void loadThemeCss(theme);
}).observe(document.documentElement, { attributeFilter: ['data-theme'] });

initializeGoogleAnalytics(import.meta.env.VITE_GOOGLE_ANALYTICS_ID);

window.addEventListener('single-spa:before-app-change', showLoader);
window.addEventListener('single-spa:app-change', hideLoader);

const loadApp =
  (url: string): (() => Promise<LifeCycles>) =>
  () =>
    import(/* @vite-ignore */ url);

function buildActiveWhen(parcel: (typeof PARCELS)[number]): (location: Location) => boolean {
  if ('alwaysActive' in parcel) return () => true;
  if (parcel.pathPrefix)
    return (location) => location.pathname === parcel.path || location.pathname.startsWith(`${parcel.path}/`);
  return (location) => location.pathname === parcel.path;
}

registerApplication({
  name: '@grasdouble/slm_loader-preview',
  app: () => Promise.resolve(loaderPreview),
  activeWhen: (location: Location) => location.pathname === '/loader',
});

for (const parcel of PARCELS) {
  registerApplication({
    name: `@grasdouble/slm_parcel_${parcel.name}`,
    app: loadApp(`@grasdouble/slm_parcel_${parcel.name}`),
    activeWhen: buildActiveWhen(parcel),
  });
}

start();
