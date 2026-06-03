---
'@grasdouble/slm-container': minor
---

feat: integrate ai-chatbot and ai-playground parcels.

Added routing and import maps for the two new browser-based LLM parcels:
- `/ai/chat` → ai-chatbot parcel (conversational chat interface)
- `/ai/playground` → ai-playground parcel (parameter experimentation playground)

**Changes:**
- Updated `parcels.ts` to register the two new parcels
- Added import map entries in `importMap.dev.json`, `importMap.preview.json`, and `importMap.json`
- Both parcels are registered with single-spa and will mount/unmount automatically based on route

**Development:**
- ai-chatbot runs on `localhost:4105` in dev mode
- ai-playground runs on `localhost:4106` in dev mode

**Production:**
- Both parcels will be served from CDN once published to npm registry
- Import maps reference version `@0.1.0` (initial release)
