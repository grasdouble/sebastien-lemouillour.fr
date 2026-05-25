import { useEffect } from 'react';

export type PageSeoConfig = {
  title: string;
  description: string;
  url: string;
};

function setMeta(selector: string, attr: string, content: string) {
  let el = document.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement('meta');
    const [attrName, attrValue] = selector.replace('meta[', '').replace(']', '').split('=');
    el.setAttribute(attrName, attrValue.replace(/"/g, ''));
    document.head.appendChild(el);
  }
  el.setAttribute(attr, content);
}

export function usePageSeo({ title, description, url }: PageSeoConfig) {
  useEffect(() => {
    document.title = title;
    setMeta('meta[name="description"]', 'content', description);
    setMeta('meta[property="og:title"]', 'content', title);
    setMeta('meta[property="og:description"]', 'content', description);
    setMeta('meta[property="og:url"]', 'content', url);
  }, [title, description, url]);
}
