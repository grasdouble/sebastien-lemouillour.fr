import hljs from 'highlight.js';

// CSS theme URL for consumers (relative to vendor CDN base URL)
export const HIGHLIGHT_CSS_ATOM_ONE_DARK = '/styles/atom-one-dark.css';

// Export all registered language definitions as LANGUAGES object for rehype-highlight
// hljs automatically registers all languages when imported directly (not from /lib/core)
export const LANGUAGES = Object.fromEntries(
  hljs
    .listLanguages()
    .map((langName) => [langName, hljs.getLanguage(langName)] as const)
    .filter(([, def]): def is [string, typeof def & {}] => def != null)
);

// Export hljs instance as a named export so it can be imported directly
export { hljs };

export default hljs;
