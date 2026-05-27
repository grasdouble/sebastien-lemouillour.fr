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
import { PARCELS } from './parcels';

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
