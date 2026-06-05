---
'@grasdouble/slm_shared': major
'@grasdouble/slm_parcel_ai-chatbot': minor
---

refactor: move LLM code from shared to ai-chatbot parcel.

**BREAKING CHANGE:** The shared package no longer exports LLM-related code. All LLM functionality (providers, hooks, components, types) has been moved to the ai-chatbot parcel.

**What was moved from shared to ai-chatbot:**
- `llm/` folder (providers, hooks, model registry, types)
- LLM components: `CapabilitiesInfo`, `LoadingIndicator`, `ModelSelector`
- LLM i18n resources (capabilities, loading, models)
- LLM dependencies: `@mlc-ai/web-llm`, `@xenova/transformers`

**What remains in shared:**
- `LangSwitcher` component (used by header-bar)
- `usePageSeo` hook (used by learn, landing-page, professional-experience)
- `googleAnalytics` utilities

**Migration:** If you were importing LLM code from `@grasdouble/slm_shared`, it's now unavailable. The ai-chatbot parcel is the only consumer of LLM functionality, so no external migration is needed.

**Rationale:** With only ai-chatbot using LLM code, centralizing it in that parcel reduces complexity, improves bundle size (no unused LLM deps in other parcels), and makes the shared package truly focused on cross-parcel utilities.
