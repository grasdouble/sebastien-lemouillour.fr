---
'@grasdouble/slm_shared': minor
'@grasdouble/slm_parcel_ai-playground': patch
'@grasdouble/slm_parcel_ai-chatbot': patch
---

feat: mutualize AI components, simplify to WebLLM-only, update models, and improve text formatting.

Moved three shared UI components (CapabilitiesInfo, LoadingIndicator, ModelSelector) from individual parcels to `@grasdouble/slm_shared` with dedicated 'slm-shared' i18n namespace. Unified ModelSelector implementation to the playground version for better accessibility (Card as button, proper keyboard handling). Both parcels now import these components from shared package, reducing code duplication and ensuring consistent UX.

Removed Transformers.js provider support entirely, keeping only WebLLM as the LLM provider. Simplified type system (LLMProvider is now literal 'webllm'), removed ~200 lines of Transformers.js-specific code from provider-factory, and updated all tests. Bundle size reduced by 3KB per parcel.

Updated model registry with latest WebLLM models: added SmolLM2 360M (0.4GB), Llama 3.2 1B (0.9GB), Llama 3.2 3B (2.3GB), Phi-4 Mini (3.4GB), Llama 3.1 8B (5.0GB), and DeepSeek R1 Qwen 7B (5.1GB). Removed older Phi-3 Mini, Gemma 2B, Llama 3 8B, and Mistral 7B. New registry offers better range from tiny demo models (< 1GB) to high-quality medium models (5-6GB).

Improved message formatting in both parcels: added `white-space: pre-wrap`, `overflow-wrap: break-word`, and `line-height: 1.6` to properly display multi-paragraph responses with preserved line breaks and improved readability.
