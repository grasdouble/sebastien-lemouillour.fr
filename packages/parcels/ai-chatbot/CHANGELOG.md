# @grasdouble/slm_parcel_ai-chatbot

## 1.1.1

### Patch Changes

- c895b73: fix: add /ai/chat URL to sitemap
- 49b213a: chore: colocalize test files in `__tests__` at the same level as source.

  Test files are now organized according to the convention: tests are placed in a `__tests__` folder at the same directory level as the file being tested, not in a central location. This improves discoverability and follows standard JavaScript/TypeScript practices.

- Updated dependencies [49b213a]
  - @grasdouble/slm_shared@1.1.3

## 1.1.0

### Minor Changes

- c044a4b: feat: add thinking indicator while model generates response

## 1.0.4

### Patch Changes

- d5fa4b0: fix: remove dynamic import of @mlc-ai/web-llm to prevent 404 errors on CDN and avoid deprecated Vite options.

## 1.0.3

### Patch Changes

- ec0af19: refactor: convert ai-chatbot model descriptions to i18n keys for better localization support.

## 1.0.2

### Patch Changes

- d765370: fix: bundle highlight.js with rehype-highlight and add importmap subpath routing to prevent module resolution errors in production.

## 1.0.1

### Patch Changes

- dbe62cd: fix: configure rehype-highlight with only supported languages to prevent module resolution errors in production.

## 1.0.0

### Major Changes

- 5c7f700: feat: add AI chatbot parcel with browser-based LLM, conversation history, and navigation integration.

### Patch Changes

- Updated dependencies [e895eb0]
  - @grasdouble/slm_shared@1.1.2
