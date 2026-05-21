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

const loader = document.getElementById('lufa-loader');
const showLoader = () => loader?.classList.add('visible');
const hideLoader = () => loader?.classList.remove('visible');

window.addEventListener('single-spa:before-app-change', showLoader);
window.addEventListener('single-spa:app-change', hideLoader);

const loadApp =
  (url: string): (() => Promise<LifeCycles>) =>
  () =>
    import(/* @vite-ignore */ url);

const loaderPreview = {
  bootstrap: () => Promise.resolve(),
  mount: () => {
    const el = document.getElementById('lufa-container');
    if (!el) return Promise.resolve();
    el.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:center;height:calc(100vh - 60px);">
        <div class="lufa-loader-dots visible">
          <span></span><span></span><span></span>
        </div>
      </div>`;
    return Promise.resolve();
  },
  unmount: () => {
    const el = document.getElementById('lufa-container');
    if (el) el.innerHTML = '';
    return Promise.resolve();
  },
};

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

start();
