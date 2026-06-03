---
'@grasdouble/slm_parcel_ai-chatbot': patch
'@grasdouble/slm_parcel_ai-playground': patch
---

fix: use proper i18n namespaces for micro-frontend context.

Fixed i18n configuration to work correctly in single-spa micro-frontend architecture:

**Changes:**
- Check if i18n is already initialized before creating new instance
- Use namespace-specific resource bundles (`ai-chatbot`, `ai-playground`) instead of default `translation`
- Listen to `lufa:lang-change` events from container for language switching
- Sync document language attribute on language change
- Use `useTranslation('ai-chatbot')` and `useTranslation('ai-playground')` instead of `useTranslation('chatbot')` or `useTranslation('playground')`

This ensures translations work correctly when parcels are loaded as micro-frontends in the container, avoiding conflicts with other parcels and enabling language switching from the header-bar.
