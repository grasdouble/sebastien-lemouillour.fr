import { useEffect } from 'react';

import { trackGoogleAnalyticsPageView } from './googleAnalytics';

export type PageSeoConfig = {
  title: string;
  description: string;
  url: string;
  trackPageView?: boolean;
};

function setMeta(selector: string, attr: string, content: string) {
  let el = document.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement('meta');
    const [attrName, attrValue] = selector
      .replace(/^meta\[/, '')
      .replace(/\]/g, '')
      .split('=');
    el.setAttribute(attrName, attrValue.replace(/"/g, ''));
    document.head.appendChild(el);
  }
  el.setAttribute(attr, content);
}

export function usePageSeo({ title, description, url, trackPageView = true }: PageSeoConfig) {
  useEffect(() => {
    document.title = title;
    setMeta('meta[name="description"]', 'content', description);
    setMeta('meta[property="og:title"]', 'content', title);
    setMeta('meta[property="og:description"]', 'content', description);
    setMeta('meta[property="og:url"]', 'content', url);
  }, [title, description, url]);

  useEffect(() => {
    if (!trackPageView) return;
    trackGoogleAnalyticsPageView({ title, url });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- title is intentionally excluded: it's metadata, not a navigation signal. Only url changes indicate a new page view.
  }, [trackPageView, url]);
}
