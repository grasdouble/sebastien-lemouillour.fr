import type { RegisterApplicationConfig } from 'single-spa';
import { addErrorHandler, registerApplication, start } from 'single-spa';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { showStartupError } from '../bootstrap';

vi.mock('single-spa', () => ({ registerApplication: vi.fn(), start: vi.fn(), addErrorHandler: vi.fn() }));
vi.mock('@grasdouble/slm_shared', () => ({ initializeGoogleAnalytics: vi.fn() }));
vi.mock('../bootstrap', () => ({ showStartupError: vi.fn() }));
vi.mock('../i18n', () => ({}));
vi.mock('import-map-overrides', () => ({}));

describe('container registration', () => {
  const getItem = vi.fn();
  let onThemeChange: () => void;
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.stubGlobal('localStorage', { getItem: getItem.mockReset().mockReturnValue(null) });
    vi.stubGlobal(
      'MutationObserver',
      class {
        constructor(callback: () => void) {
          onThemeChange = callback;
        }
        observe = vi.fn();
      }
    );
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('registers every route and handles parcel failures', async () => {
    await import('../main');
    expect(start).toHaveBeenCalledOnce();
    const registrations = vi
      .mocked(registerApplication)
      .mock.calls.map(([config]) => config as RegisterApplicationConfig);
    expect(registrations).toHaveLength(6);
    const location = (pathname: string) => ({ pathname }) as Location;
    for (const registration of registrations) {
      const active = registration.activeWhen as (location: Location) => boolean;
      expect(typeof active(location('/'))).toBe('boolean');
      active(location('/not-found'));
    }
    const learn = registrations.find((registration) => registration.name.endsWith('_learn'))!;
    const active = learn.activeWhen as (location: Location) => boolean;
    expect(active(location('/learn'))).toBe(true);
    expect(active(location('/learn/catalog/guide'))).toBe(true);
    expect(active(location('/learning'))).toBe(false);
    const preview = registrations[0];
    expect((preview.activeWhen as (location: Location) => boolean)(location('/loader'))).toBe(true);
    expect(await (preview.app as () => Promise<unknown>)()).toBeTruthy();
    const parcel = registrations[1];
    // The module specifier is deliberately unresolved by the Node test environment.
    await (parcel.app as () => Promise<unknown>)().catch(() => undefined);
    const handler = vi.mocked(addErrorHandler).mock.calls[0][0];
    handler(Object.assign(new Error('CDN unavailable'), { appOrParcelName: 'landing-page' }));
    expect(showStartupError).toHaveBeenCalledOnce();
  });

  it('loads every supported theme and announces when styles are ready', async () => {
    await import('../main');
    const ready = vi.fn();
    document.addEventListener('lufa-theme-ready', ready);
    for (const theme of [
      'ocean',
      'forest',
      'matrix',
      'cyberpunk',
      'sunset',
      'nordic',
      'volcano',
      'coffee',
      'volt',
      'steampunk',
      'lufa',
    ]) {
      document.documentElement.setAttribute('data-theme', theme);
      onThemeChange();
      await vi.waitFor(() => expect(ready).toHaveBeenLastCalledWith(expect.objectContaining({ detail: { theme } })));
    }
    document.documentElement.removeAttribute('data-theme');
    onThemeChange();
    document.removeEventListener('lufa-theme-ready', ready);
  });

  it('uses the stored theme in production', async () => {
    vi.stubEnv('DEV', false);
    getItem.mockReturnValue('lufa');
    await import('../main');
    expect(start).toHaveBeenCalledOnce();
  });

  it('starts with the default theme when storage is unavailable', async () => {
    getItem.mockImplementation(() => {
      throw new Error('Denied');
    });
    await import('../main');
    expect(start).toHaveBeenCalledOnce();
  });
});
