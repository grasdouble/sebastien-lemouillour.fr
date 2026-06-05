---
'@grasdouble/slm_shared': major
'@grasdouble/slm_parcel_ai-chatbot': minor
'@grasdouble/slm-container': minor
---

feat: add conversation history support to enable context-aware AI responses.

**BREAKING CHANGE:** Modified `LLMProviderInstance.generate()` and `LLMProviderInstance.generateStream()` to accept `ChatMessage[]` instead of `string`. This enables the AI to remember and respond based on the full conversation history.

All consumers must now pass an array of messages with `role` and `content` properties:

```typescript
// Before:
provider.generate("Hello");

// After:
provider.generate([{ role: 'user', content: 'Hello' }]);
```

The chatbot now maintains conversation context by passing the complete message history to the LLM, enabling multi-turn conversations where the AI remembers previous exchanges.

---

feat(ai-chatbot): add conversation history management with localStorage persistence.

Users can now create, load, and delete conversations. All conversations are automatically saved to localStorage and persist across browser sessions.

**New features:**
- **Sidebar UI**: New conversation history sidebar with list of all saved conversations
- **Auto-save**: Conversations are automatically saved after each message
- **Auto-generated titles**: Titles are automatically generated from the first user message (truncated to 50 chars)
- **Metadata display**: Each conversation shows message count and last updated time
- **Conversation management**: Create new conversations, load previous ones, or delete unwanted ones
- **Confirmation dialogs**: Delete operations require user confirmation to prevent accidental data loss

**Technical details:**
- Added `Conversation` type with id, title, messages, modelId, createdAt, updatedAt
- Added `useConversationHistory` hook for managing conversation state and localStorage persistence
- Added `ConversationHistory` component for sidebar UI
- Added 18 new unit tests for conversation history functionality (100% coverage)
- Global localStorage mock in test setup for consistent test environment
- Proper date/time serialization for localStorage storage

---

feat(container): remove ai-playground parcel (replaced by ai-chatbot).

The ai-playground parcel has been removed as it is now redundant. The ai-chatbot parcel includes all necessary features (conversation history, model selection, context-aware responses) and provides a better user experience.

**Changes:**
- Removed ai-playground from parcels configuration
- Removed ai-playground from all import maps (dev, preview, production)
- ai-chatbot is now the single AI interface at `/ai/chat`

**Migration:** Users should navigate to `/ai/chat` instead of `/ai/playground`.

---

feat: add model descriptions to help users choose the right model.

Added optional `description` field to `ModelConfig` type and populated all models in the registry with concise descriptions of their strengths:
- SmolLM2 360M: "Ultra-rapide, idéal pour tester"
- Llama 3.2 1B: "Rapide, bon pour conversations simples"
- Qwen 2.5 3B: "Excellent multilingue, support français natif"
- Llama 3.2 3B: "Équilibré, polyvalent pour usage quotidien"
- Hermes 3 Llama 3.2 3B: "Optimisé pour instructions complexes"
- Phi-4 Mini: "Excellent pour raisonnement et code"
- Qwen 2.5 7B: "Puissant multilingue, excellent en français"
- Llama 3.1 8B: "Haute qualité, créativité et nuances"
- Hermes 2 Pro Llama 3 8B: "Meilleur pour instructions que Llama standard"
- DeepSeek R1 Qwen 7B: "Expert en raisonnement complexe et maths"
- Hermes 2 Pro Mistral 7B: "Performant pour code et raisonnement"

Descriptions are displayed in the model selector dropdown to guide user choice based on their use case.

---

feat: expand model registry with 5 new high-quality models.

Added:
- **Qwen 2.5 3B** (2.5GB): Excellent multilingual model with native French support, great for international use cases
- **Hermes 3 Llama 3.2 3B** (2.4GB): Optimized for following complex instructions, better instruction adherence than base Llama
- **Qwen 2.5 7B** (4.5GB): Powerful multilingual model, excels at French language tasks and reasoning
- **Hermes 2 Pro Llama 3 8B** (5.0GB): Enhanced instruction-following variant of Llama 3, better for task-oriented conversations
- **Hermes 2 Pro Mistral 7B** (4.8GB): High-performance model specialized in code and reasoning tasks

The registry now offers **11 models** spanning from 0.4GB (testing) to 5.1GB (production), with better coverage for multilingual (Qwen) and instruction-tuned (Hermes) use cases.

---

feat: mutualize AI components, simplify to WebLLM-only, update models, improve formatting, and switch to dropdown selector.

Moved three shared UI components (CapabilitiesInfo, LoadingIndicator, ModelSelector) from individual parcels to `@grasdouble/slm_shared` with dedicated 'slm-shared' i18n namespace. Unified ModelSelector implementation to the playground version for better accessibility (Card as button, proper keyboard handling). Both parcels now import these components from shared package, reducing code duplication and ensuring consistent UX.

Removed Transformers.js provider support entirely, keeping only WebLLM as the LLM provider. Simplified type system (LLMProvider is now literal 'webllm'), removed ~200 lines of Transformers.js-specific code from provider-factory, and updated all tests. Bundle size reduced by 3KB per parcel.

Updated model registry with latest WebLLM models: added SmolLM2 360M (0.4GB), Llama 3.2 1B (0.9GB), Llama 3.2 3B (2.3GB), Phi-4 Mini (3.4GB), Llama 3.1 8B (5.0GB), and DeepSeek R1 Qwen 7B (5.1GB). Removed older Phi-3 Mini, Gemma 2B, Llama 3 8B, and Mistral 7B. New registry offers better range from tiny demo models (< 1GB) to high-quality medium models (5-6GB).

Improved message formatting in both parcels: added `white-space: pre-wrap`, `overflow-wrap: break-word`, and `line-height: 1.6` to properly display multi-paragraph responses with preserved line breaks and improved readability.

Replaced ModelSelector grid layout with native dropdown select for better scalability. The new compact design shows model name, size, and RAM requirement in each option (e.g., "Llama 3.2 1B — 0.9GB • 2GB RAM"), taking significantly less space and supporting more models without UI clutter.
