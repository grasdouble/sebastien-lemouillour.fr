import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import * as googleAnalytics from '../googleAnalytics';
import { initializeGoogleAnalytics } from '../googleAnalytics';
import { usePageSeo } from '../usePageSeo';

const mockTrackPageView = vi.spyOn(googleAnalytics, 'trackGoogleAnalyticsPageView').mockImplementation(() => undefined);

function resetGlobals() {
  delete window.__slmGoogleAnalyticsMeasurementId;
  delete window.gtag;
  delete window.dataLayer;
  document.getElementById('slm-google-analytics')?.remove();
  document.querySelectorAll('meta').forEach((el) => el.remove());
}

describe('usePageSeo', () => {
  beforeEach(() => {
    resetGlobals();
    mockTrackPageView.mockClear();
    document.title = '';
  });
  afterEach(resetGlobals);

  describe('document.title', () => {
    it('sets document.title on mount', () => {
      renderHook(() => usePageSeo({ title: 'Home', description: 'Desc', url: 'https://example.com/' }));
      expect(document.title).toBe('Home');
    });

    it('updates document.title when title prop changes', () => {
      const { rerender } = renderHook(
        ({ title }: { title: string }) => usePageSeo({ title, description: 'Desc', url: 'https://example.com/' }),
        { initialProps: { title: 'Home' } }
      );
      rerender({ title: 'About' });
      expect(document.title).toBe('About');
    });
  });

  describe('meta tags', () => {
    it('creates meta[name="description"] on mount', () => {
      renderHook(() => usePageSeo({ title: 'Home', description: 'My description', url: 'https://example.com/' }));
      expect(document.querySelector('meta[name="description"]')?.getAttribute('content')).toBe('My description');
    });

    it('creates og:title meta tag on mount', () => {
      renderHook(() => usePageSeo({ title: 'Home', description: 'Desc', url: 'https://example.com/' }));
      expect(document.querySelector('meta[property="og:title"]')?.getAttribute('content')).toBe('Home');
    });

    it('creates og:description meta tag on mount', () => {
      renderHook(() => usePageSeo({ title: 'Home', description: 'My og desc', url: 'https://example.com/' }));
      expect(document.querySelector('meta[property="og:description"]')?.getAttribute('content')).toBe('My og desc');
    });

    it('creates og:url meta tag on mount', () => {
      renderHook(() => usePageSeo({ title: 'Home', description: 'Desc', url: 'https://example.com/page' }));
      expect(document.querySelector('meta[property="og:url"]')?.getAttribute('content')).toBe(
        'https://example.com/page'
      );
    });

    it('updates existing meta tags without creating duplicates', () => {
      const { rerender } = renderHook(
        ({ description }: { description: string }) =>
          usePageSeo({ title: 'Home', description, url: 'https://example.com/' }),
        { initialProps: { description: 'First' } }
      );
      rerender({ description: 'Second' });

      const metas = document.querySelectorAll('meta[name="description"]');
      expect(metas).toHaveLength(1);
      expect(metas[0].getAttribute('content')).toBe('Second');
    });

    it('updates all meta tags when props change', () => {
      const { rerender } = renderHook(
        (props: { title: string; description: string; url: string }) => usePageSeo(props),
        { initialProps: { title: 'Home', description: 'Desc', url: 'https://example.com/' } }
      );
      rerender({ title: 'About', description: 'About page', url: 'https://example.com/about' });

      expect(document.title).toBe('About');
      expect(document.querySelector('meta[name="description"]')?.getAttribute('content')).toBe('About page');
      expect(document.querySelector('meta[property="og:title"]')?.getAttribute('content')).toBe('About');
      expect(document.querySelector('meta[property="og:url"]')?.getAttribute('content')).toBe(
        'https://example.com/about'
      );
    });
  });

  describe('GA page view tracking', () => {
    beforeEach(() => {
      initializeGoogleAnalytics('G-TESTID1234');
    });

    it('tracks a page view on mount when trackPageView is true (default)', () => {
      renderHook(() => usePageSeo({ title: 'Home', description: 'Desc', url: 'https://example.com/' }));
      expect(mockTrackPageView).toHaveBeenCalledOnce();
      expect(mockTrackPageView).toHaveBeenCalledWith({ title: 'Home', url: 'https://example.com/' });
    });

    it('does not track a page view when trackPageView is false', () => {
      renderHook(() =>
        usePageSeo({ title: 'Home', description: 'Desc', url: 'https://example.com/', trackPageView: false })
      );
      expect(mockTrackPageView).not.toHaveBeenCalled();
    });

    it('tracks a new page view when url changes', () => {
      const { rerender } = renderHook(
        ({ url }: { url: string }) => usePageSeo({ title: 'Page', description: 'Desc', url }),
        { initialProps: { url: 'https://example.com/' } }
      );
      rerender({ url: 'https://example.com/about' });

      expect(mockTrackPageView).toHaveBeenCalledTimes(2);
      expect(mockTrackPageView).toHaveBeenLastCalledWith({ title: 'Page', url: 'https://example.com/about' });
    });

    it('does not re-track when only the title changes', () => {
      const { rerender } = renderHook(
        ({ title }: { title: string }) => usePageSeo({ title, description: 'Desc', url: 'https://example.com/' }),
        { initialProps: { title: 'Home' } }
      );
      rerender({ title: 'Home — Updated' });

      // Only the initial mount should have triggered tracking.
      expect(mockTrackPageView).toHaveBeenCalledOnce();
    });
  });
});
