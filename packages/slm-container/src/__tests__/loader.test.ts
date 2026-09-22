import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('loader', () => {
  beforeEach(() => {
    vi.resetModules();
  });
  it('shows and hides the loader and mounts the preview', async () => {
    document.body.innerHTML = '<div id="lufa-loader"></div><div id="lufa-container"></div>';
    const { showLoader, hideLoader, loaderPreview } = await import('../loader');
    showLoader();
    expect(document.getElementById('lufa-loader')?.classList.contains('visible')).toBe(true);
    hideLoader();
    expect(document.getElementById('lufa-loader')?.classList.contains('visible')).toBe(false);
    await loaderPreview.bootstrap();
    await loaderPreview.mount();
    expect(document.querySelectorAll('.lufa-loader-dots span')).toHaveLength(3);
    await loaderPreview.unmount();
    expect(document.getElementById('lufa-container')?.innerHTML).toBe('');
  });
  it('tolerates missing elements', async () => {
    document.body.innerHTML = '';
    const { showLoader, hideLoader, loaderPreview } = await import('../loader');
    expect(showLoader).not.toThrow();
    expect(hideLoader).not.toThrow();
    await loaderPreview.mount();
    await loaderPreview.unmount();
  });
});
