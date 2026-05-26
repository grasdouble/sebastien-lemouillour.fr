const GOOGLE_ANALYTICS_SCRIPT_ID = 'slm-google-analytics';
const GOOGLE_ANALYTICS_MEASUREMENT_ID_PATTERN = /^G-[A-Za-z0-9]+$/;

declare global {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- required for declaration merging, `type` is not valid here
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    __slmGoogleAnalyticsMeasurementId?: string;
  }
}

export type GoogleAnalyticsPageView = {
  title?: string;
  url?: string;
};

export type GoogleAnalyticsEventParams = Record<string, unknown>;

function getPageUrl(url?: string) {
  try {
    return url ? new URL(url, window.location.href) : new URL(window.location.href);
  } catch (error) {
    console.warn('Invalid URL provided to trackGoogleAnalyticsPageView:', url, error);
    return new URL(window.location.href);
  }
}

function getMeasurementId() {
  return typeof window === 'undefined' ? undefined : window.__slmGoogleAnalyticsMeasurementId;
}

function ensureGoogleAnalyticsRuntime() {
  window.dataLayer ??= [];

  window.gtag ??= (...args: unknown[]) => {
    window.dataLayer?.push(args);
  };
}

function ensureGoogleAnalyticsScript(measurementId: string) {
  if (document.getElementById(GOOGLE_ANALYTICS_SCRIPT_ID)) return;

  const script = document.createElement('script');
  script.id = GOOGLE_ANALYTICS_SCRIPT_ID;
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
  document.head.appendChild(script);
}

export function initializeGoogleAnalytics(measurementId?: string) {
  if (!measurementId || typeof window === 'undefined' || typeof document === 'undefined') {
    return false;
  }

  if (!GOOGLE_ANALYTICS_MEASUREMENT_ID_PATTERN.test(measurementId)) {
    console.warn('Invalid Google Analytics measurement ID:', measurementId);
    return false;
  }

  ensureGoogleAnalyticsRuntime();
  ensureGoogleAnalyticsScript(measurementId);

  window.__slmGoogleAnalyticsMeasurementId = measurementId;
  window.gtag?.('js', new Date());
  window.gtag?.('config', measurementId, { send_page_view: false });

  return true;
}

export function trackGoogleAnalyticsPageView({ title, url }: GoogleAnalyticsPageView = {}) {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const measurementId = getMeasurementId();
  if (!measurementId || !window.gtag) return;

  const pageUrl = getPageUrl(url);

  window.gtag('event', 'page_view', {
    send_to: measurementId,
    page_title: title ?? document.title,
    page_location: pageUrl.toString(),
    page_path: `${pageUrl.pathname}${pageUrl.search}`,
  });
}

export function trackGoogleAnalyticsEvent(eventName: string, params?: GoogleAnalyticsEventParams) {
  if (typeof window === 'undefined') return;

  const measurementId = getMeasurementId();
  if (!measurementId || !window.gtag) return;

  window.gtag('event', eventName, {
    send_to: measurementId,
    ...params,
  });
}
