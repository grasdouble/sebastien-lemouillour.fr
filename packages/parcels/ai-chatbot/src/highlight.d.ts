// Type augmentation for highlight.js
// The production build routes highlight.js to slm-vendors/highlight.mjs which exports LANGUAGES
declare module 'highlight.js' {
  export const LANGUAGES: Record<string, unknown>;
}
