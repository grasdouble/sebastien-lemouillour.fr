import type { LifeCycles } from 'single-spa';
import { registerApplication, start } from 'single-spa';

import 'import-map-overrides';
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

const loadApp =
  (url: string): (() => Promise<LifeCycles>) =>
  () =>
    import(/* @vite-ignore */ url);

// PARCELS
registerApplication({
  name: '@grasdouble/slm_parcel_landing-page',
  app: loadApp('@grasdouble/slm_parcel_landing-page'),
  activeWhen: (location: Location) => location.pathname === '/',
});

start();
