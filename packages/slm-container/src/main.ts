import type { LifeCycles } from 'single-spa';
import { registerApplication, start } from 'single-spa';

import { initializeGoogleAnalytics } from '@grasdouble/slm_shared';

import 'import-map-overrides';
import './i18n';
import './reset.css';
import '@grasdouble/lufa_design-system-themes/ocean.css';
import '@grasdouble/lufa_design-system-themes/forest.css';
import '@grasdouble/lufa_design-system-themes/matrix.css';
import '@grasdouble/lufa_design-system-themes/cyberpunk.css';
import '@grasdouble/lufa_design-system-themes/sunset.css';
import '@grasdouble/lufa_design-system-themes/nordic.css';
import '@grasdouble/lufa_design-system-themes/volcano.css';
import '@grasdouble/lufa_design-system-themes/coffee.css';
import '@grasdouble/lufa_design-system-themes/volt.css';
import '@grasdouble/lufa_design-system-themes/steampunk.css';

import { hideLoader, loaderPreview, showLoader } from './loader';

initializeGoogleAnalytics(import.meta.env.VITE_GOOGLE_ANALYTICS_ID);

window.addEventListener('single-spa:before-app-change', showLoader);
window.addEventListener('single-spa:app-change', hideLoader);

const loadApp =
  (url: string): (() => Promise<LifeCycles>) =>
  () =>
    import(/* @vite-ignore */ url);

registerApplication({
  name: '@grasdouble/slm_loader-preview',
  app: () => Promise.resolve(loaderPreview),
  activeWhen: (location: Location) => location.pathname === '/loader',
});

registerApplication({
  name: '@grasdouble/slm_parcel_header-bar',
  app: loadApp('@grasdouble/slm_parcel_header-bar'),
  activeWhen: () => true,
});

registerApplication({
  name: '@grasdouble/slm_parcel_landing-page',
  app: loadApp('@grasdouble/slm_parcel_landing-page'),
  activeWhen: (location: Location) => location.pathname === '/',
});

registerApplication({
  name: '@grasdouble/slm_parcel_professional-experience',
  app: loadApp('@grasdouble/slm_parcel_professional-experience'),
  activeWhen: (location: Location) => location.pathname === '/experience',
});

registerApplication({
  name: '@grasdouble/slm_parcel_learn',
  app: loadApp('@grasdouble/slm_parcel_learn'),
  activeWhen: (location: Location) => location.pathname === '/learn',
});

start();
