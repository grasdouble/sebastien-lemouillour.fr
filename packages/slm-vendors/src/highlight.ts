import hljs from 'highlight.js/lib/core';
// Register only the languages we need (reduces bundle from 9.1M to ~200K)
import bash from 'highlight.js/lib/languages/bash';
import css from 'highlight.js/lib/languages/css';
import javascript from 'highlight.js/lib/languages/javascript';
import json from 'highlight.js/lib/languages/json';
import markdown from 'highlight.js/lib/languages/markdown';
import python from 'highlight.js/lib/languages/python';
import typescript from 'highlight.js/lib/languages/typescript';
import xml from 'highlight.js/lib/languages/xml'; // html

hljs.registerLanguage('bash', bash);
hljs.registerLanguage('css', css);
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('json', json);
hljs.registerLanguage('markdown', markdown);
hljs.registerLanguage('python', python);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('xml', xml);
hljs.registerLanguage('html', xml); // alias

// CSS theme URL for consumers (relative to vendor CDN base URL)
export const HIGHLIGHT_CSS_ATOM_ONE_DARK = '/styles/atom-one-dark.css';

// Export language definitions for rehype-highlight configuration
// These are bundled here so they're available in production without needing
// to resolve subpaths of the peer dependency highlight.js
export const LANGUAGES = {
  bash,
  css,
  javascript,
  json,
  markdown,
  python,
  typescript,
  xml,
  html: xml, // alias
};

export default hljs;
