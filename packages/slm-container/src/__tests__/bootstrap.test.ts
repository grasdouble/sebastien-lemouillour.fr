import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { bootstrap, showStartupError } from '../bootstrap';

describe('application bootstrap', () => {
  const setItem = vi.fn();
  const imports = { react: 'https://cdn.example.com/react.mjs' };
  beforeEach(() => {
    vi.spyOn(navigator, 'language', 'get').mockReturnValue('fr-FR');
    document.head.innerHTML = '';
    document.body.innerHTML =
      '<div id="startup-error" hidden><p role="alert"></p><button>Réessayer</button></div><div id="lufa-loader" class="visible"></div>';
    vi.stubGlobal('localStorage', { getItem: vi.fn().mockReturnValue(null), setItem });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({ imports }) }));
  });
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('loads the import map before starting the application in production', async () => {
    const start = vi.fn(() => {
      expect(document.querySelector('script[type="importmap"]')?.textContent).toBe(JSON.stringify({ imports }));
      return Promise.resolve();
    });
    await bootstrap('production', start);
    expect(start).toHaveBeenCalledOnce();
    expect(localStorage.getItem('devtools')).toBeNull();
  });

  it('starts even when browser storage is denied in development', async () => {
    vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
      throw new DOMException('Denied', 'SecurityError');
    });
    const start = vi.fn().mockResolvedValue(undefined);
    await bootstrap('development', start);
    expect(start).toHaveBeenCalledOnce();
  });

  it('merges local overrides for preview', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ imports }) } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ imports: { react: '/react.mjs' } }),
      } as Response);
    await bootstrap('preview', vi.fn().mockResolvedValue(undefined));
    expect(document.querySelector('script[type="importmap"]')?.textContent).toContain('/react.mjs');
    expect(fetch).toHaveBeenCalledWith('/importMap.overrides.preview.json', expect.any(Object));
  });

  it.each([
    { ok: false, status: 503, json: () => Promise.resolve({ imports }) },
    { ok: true, json: () => Promise.resolve({ imports: { react: 42 } }) },
    { ok: true, json: () => Promise.reject(new SyntaxError('Invalid JSON')) },
  ])('shows a recoverable error for an unavailable or invalid map', async (response) => {
    vi.mocked(fetch).mockResolvedValue(response as Response);
    const start = vi.fn();
    await bootstrap('production', start);
    expect(start).not.toHaveBeenCalled();
    expect(document.getElementById('startup-error')?.hidden).toBe(false);
    expect(document.querySelector('[role="alert"]')?.textContent).toBeTruthy();
  });

  it('shows an error if importing the application fails', async () => {
    await bootstrap('production', vi.fn().mockRejectedValue(new Error('Unavailable parcel')));
    expect(document.getElementById('startup-error')?.hidden).toBe(false);
  });

  it('lets the user reload after a startup failure', () => {
    const reload = vi.fn();
    showStartupError(reload);
    document.querySelector('button')?.click();
    expect(reload).toHaveBeenCalledOnce();
    expect(document.getElementById('lufa-loader')?.classList.contains('visible')).toBe(false);
  });

  it('uses the browser reload action by default', () => {
    const reload = vi.spyOn(window.location, 'reload').mockImplementation(vi.fn());
    showStartupError();
    document.querySelector('button')?.click();
    expect(reload).toHaveBeenCalledOnce();
  });

  it('enables devtools only in development', async () => {
    await bootstrap('development', vi.fn().mockResolvedValue(undefined));
    expect(setItem).toHaveBeenCalledWith('devtools', 'true');
  });

  it('localizes the fallback in English', () => {
    vi.spyOn(navigator, 'language', 'get').mockReturnValue('en-US');
    showStartupError();
    expect(document.querySelector('button')?.textContent).toBe('Try again');
    expect(document.querySelector('[role="alert"]')?.textContent).toContain('could not be loaded');
  });

  it('tolerates a missing fallback or missing child elements', () => {
    document.body.innerHTML = '';
    expect(() => showStartupError()).not.toThrow();
    document.body.innerHTML = '<div id="startup-error"></div>';
    expect(() => showStartupError()).not.toThrow();
  });

  it.each([null, 1, {}, { imports: null }, { imports: 42 }, { imports: [] }])(
    'rejects malformed maps: %j',
    async (map) => {
      vi.mocked(fetch).mockResolvedValue({ ok: true, json: () => Promise.resolve(map) } as Response);
      const start = vi.fn();
      await bootstrap('production', start);
      expect(start).not.toHaveBeenCalled();
    }
  );
});
