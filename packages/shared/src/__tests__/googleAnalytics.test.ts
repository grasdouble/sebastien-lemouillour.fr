import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { initializeGoogleAnalytics, trackGoogleAnalyticsEvent, trackGoogleAnalyticsPageView } from '../googleAnalytics';

const VALID_ID = 'G-TESTID1234';

function resetGlobals() {
  delete window.dataLayer;
  delete window.gtag;
  delete window.__slmGoogleAnalyticsMeasurementId;
  document.getElementById('slm-google-analytics')?.remove();
}

describe('initializeGoogleAnalytics', () => {
  beforeEach(resetGlobals);
  afterEach(resetGlobals);

  it('returns false when no measurement ID is provided', () => {
    expect(initializeGoogleAnalytics()).toBe(false);
    expect(initializeGoogleAnalytics('')).toBe(false);
  });

  it('returns false for an invalid measurement ID format', () => {
    expect(initializeGoogleAnalytics('UA-12345')).toBe(false);
    expect(initializeGoogleAnalytics('invalid')).toBe(false);
    expect(initializeGoogleAnalytics('G-')).toBe(false);
  });

  it('returns true for a valid measurement ID', () => {
    expect(initializeGoogleAnalytics(VALID_ID)).toBe(true);
  });

  it('initializes window.dataLayer as an array', () => {
    initializeGoogleAnalytics(VALID_ID);
    expect(Array.isArray(window.dataLayer)).toBe(true);
  });

  it('does not override an existing window.dataLayer', () => {
    const existing: unknown[] = [{ event: 'existing' }];
    window.dataLayer = existing;
    initializeGoogleAnalytics(VALID_ID);
    expect(window.dataLayer).toBe(existing);
    expect(window.dataLayer[0]).toEqual({ event: 'existing' });
  });

  it('sets window.__slmGoogleAnalyticsMeasurementId', () => {
    initializeGoogleAnalytics(VALID_ID);
    expect(window.__slmGoogleAnalyticsMeasurementId).toBe(VALID_ID);
  });

  it('injects the gtag script into <head>', () => {
    initializeGoogleAnalytics(VALID_ID);
    const script = document.getElementById('slm-google-analytics') as HTMLScriptElement | null;
    expect(script).not.toBeNull();
    expect(script?.src).toContain('googletagmanager.com/gtag/js');
    expect(script?.src).toContain(encodeURIComponent(VALID_ID));
    expect(script?.async).toBe(true);
  });

  it('does not inject a second script on repeated calls', () => {
    initializeGoogleAnalytics(VALID_ID);
    initializeGoogleAnalytics(VALID_ID);
    const scripts = document.querySelectorAll('#slm-google-analytics');
    expect(scripts).toHaveLength(1);
  });

  it('does not override an existing window.gtag', () => {
    const existingGtag = vi.fn();
    window.gtag = existingGtag;
    initializeGoogleAnalytics(VALID_ID);
    expect(window.gtag).toBe(existingGtag);
  });

  it('pushes an Arguments object (not an Array) for the "js" command', () => {
    initializeGoogleAnalytics(VALID_ID);
    const jsEntry = window.dataLayer?.[0];
    // GA4's gtag.js identifies commands via Object.prototype.toString.call(entry) === "[object Arguments]".
    // A real Array would be silently ignored — this test guards against that regression.
    expect(Object.prototype.toString.call(jsEntry)).toBe('[object Arguments]');
    expect((jsEntry as IArguments)[0]).toBe('js');
    expect((jsEntry as IArguments)[1]).toBeInstanceOf(Date);
  });

  it('pushes an Arguments object (not an Array) for the "config" command', () => {
    initializeGoogleAnalytics(VALID_ID);
    const configEntry = window.dataLayer?.[1];
    expect(Object.prototype.toString.call(configEntry)).toBe('[object Arguments]');
    expect((configEntry as IArguments)[0]).toBe('config');
    expect((configEntry as IArguments)[1]).toBe(VALID_ID);
    expect((configEntry as IArguments)[2]).toEqual({ send_page_view: false });
  });
});

describe('trackGoogleAnalyticsPageView', () => {
  beforeEach(resetGlobals);
  afterEach(resetGlobals);

  it('is a no-op when GA is not initialized', () => {
    expect(() => trackGoogleAnalyticsPageView()).not.toThrow();
  });

  it('is a no-op when window.gtag is missing even if measurement ID is set', () => {
    window.__slmGoogleAnalyticsMeasurementId = VALID_ID;
    expect(() => trackGoogleAnalyticsPageView()).not.toThrow();
  });

  it('calls window.gtag with a page_view event', () => {
    initializeGoogleAnalytics(VALID_ID);
    const gtag = vi.fn();
    window.gtag = gtag;

    trackGoogleAnalyticsPageView({ title: 'Home', url: 'https://example.com/home' });

    expect(gtag).toHaveBeenCalledOnce();
    expect(gtag).toHaveBeenCalledWith('event', 'page_view', {
      send_to: VALID_ID,
      page_title: 'Home',
      page_location: 'https://example.com/home',
      page_path: '/home',
    });
  });

  it('uses document.title when no title is provided', () => {
    document.title = 'Default Title';
    initializeGoogleAnalytics(VALID_ID);
    const gtag = vi.fn();
    window.gtag = gtag;

    trackGoogleAnalyticsPageView({ url: 'https://example.com/' });

    expect(gtag).toHaveBeenCalledWith('event', 'page_view', expect.objectContaining({ page_title: 'Default Title' }));
  });

  it('uses window.location when no url is provided', () => {
    initializeGoogleAnalytics(VALID_ID);
    const gtag = vi.fn();
    window.gtag = gtag;

    trackGoogleAnalyticsPageView({ title: 'Page' });

    expect(gtag).toHaveBeenCalledWith(
      'event',
      'page_view',
      expect.objectContaining({ page_location: window.location.href })
    );
  });

  it('falls back to window.location when an invalid url is provided', () => {
    initializeGoogleAnalytics(VALID_ID);
    const gtag = vi.fn();
    window.gtag = gtag;
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    // Force the URL constructor to throw for the specific url arg so we can test the catch branch.
    const OriginalURL = globalThis.URL;
    const INVALID = '__vitest_invalid_url__';
    vi.stubGlobal('URL', function (...args: ConstructorParameters<typeof URL>) {
      if (args[0] === INVALID) throw new TypeError('Invalid URL');
      return new OriginalURL(...args);
    });

    trackGoogleAnalyticsPageView({ title: 'Page', url: INVALID });

    expect(warnSpy).toHaveBeenCalledWith(
      'Invalid URL provided to trackGoogleAnalyticsPageView:',
      INVALID,
      expect.any(TypeError)
    );
    expect(gtag).toHaveBeenCalledWith(
      'event',
      'page_view',
      expect.objectContaining({ page_location: window.location.href })
    );

    vi.unstubAllGlobals();
    warnSpy.mockRestore();
  });
});

describe('trackGoogleAnalyticsEvent', () => {
  beforeEach(resetGlobals);
  afterEach(resetGlobals);

  it('is a no-op when GA is not initialized', () => {
    expect(() => trackGoogleAnalyticsEvent('my_event')).not.toThrow();
  });

  it('calls window.gtag with the event name and merged params', () => {
    initializeGoogleAnalytics(VALID_ID);
    const gtag = vi.fn();
    window.gtag = gtag;

    trackGoogleAnalyticsEvent('project_click', { project: 'my-project' });

    expect(gtag).toHaveBeenCalledOnce();
    expect(gtag).toHaveBeenCalledWith('event', 'project_click', {
      project: 'my-project',
      send_to: VALID_ID,
    });
  });

  it('calls window.gtag without extra params when none are provided', () => {
    initializeGoogleAnalytics(VALID_ID);
    const gtag = vi.fn();
    window.gtag = gtag;

    trackGoogleAnalyticsEvent('simple_event');

    expect(gtag).toHaveBeenCalledWith('event', 'simple_event', {
      send_to: VALID_ID,
    });
  });
});
