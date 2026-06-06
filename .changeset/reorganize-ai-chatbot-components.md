---
'@grasdouble/slm_parcel_ai-chatbot': minor
---

refactor: reorganize components by UI responsibility and fix translation keys.

Components are now organized by their UI responsibilities:
- `sidebar/` manages conversation history (renamed from ConversationHistory to ConversationSidebar)
- `model-setup/` handles model selection and configuration (renamed CapabilitiesWarning to CapabilitiesCheck)
- `chat-area/` contains the chat interface (messages, input, content)
- `ChatInterface.tsx` at component root as the main orchestrator

Translation fixes:
- Fixed i18n namespace in ModelSelector and LoadingIndicator: `ai-chatbot-llm` → `ai-chatbot`
- Fixed translation keys: `models.*` → `chatbot.model.*`, `loading.model` → `chatbot.model.loading`
- Added `chatbot.model.preparing` key for pre-download state
- Added `chatbot.model.loadingFromCache` key to distinguish cache vs download
- Cleaned up unused imports and variables in LoadingIndicator

UI improvements:
- Added visual border around chat discussion area
- Made loading indicator replace chat area during model download
- Display model name in assistant messages
- Show "Preparing download..." message when download hasn't started yet (progress = 0) to avoid empty bordered area
- **Cache detection**: automatically detect if model is loading from browser cache using WebLLM's `hasModelInCache()` API
- Show "Chargement depuis le cache..." (FR) / "Loading from cache..." (EN) when model loads from IndexedDB cache instead of downloading

This structure makes it easier to understand what each component does and where to find UI-related code.
