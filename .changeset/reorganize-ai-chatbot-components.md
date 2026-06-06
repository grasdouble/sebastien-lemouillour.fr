---
'@grasdouble/slm_parcel_ai-chatbot': minor
---

refactor: reorganize components by UI responsibility instead of technical categories.

Components are now organized by their UI responsibilities:
- `sidebar/` manages conversation history (renamed from ConversationHistory to ConversationSidebar)
- `model-setup/` handles model selection and configuration (renamed CapabilitiesWarning to CapabilitiesCheck)
- `chat-area/` contains the chat interface (messages, input, content)
- `ChatInterface.tsx` at component root as the main orchestrator

This structure makes it easier to understand what each component does and where to find UI-related code.
