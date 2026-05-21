import './loader.css';

const DOTS_HTML = `<div class="lufa-loader-dots"><span></span><span></span><span></span></div>`;

const loaderEl = document.getElementById('lufa-loader');

export const showLoader = () => loaderEl?.classList.add('visible');
export const hideLoader = () => loaderEl?.classList.remove('visible');

export const loaderPreview = {
  bootstrap: () => Promise.resolve(),
  mount: () => {
    const el = document.getElementById('lufa-container');
    if (!el) return Promise.resolve();
    el.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:center;height:calc(100vh - 60px);">
        ${DOTS_HTML}
      </div>`;
    return Promise.resolve();
  },
  unmount: () => {
    const el = document.getElementById('lufa-container');
    if (el) el.innerHTML = '';
    return Promise.resolve();
  },
};
