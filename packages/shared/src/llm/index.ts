/**
 * LLM utilities and hooks for browser-based language models
 */

export type {
  BrowserCapabilities,
  GenerationConfig,
  GenerationResult,
  LLMProvider,
  ModelConfig,
  ModelLoadProgress,
  OnStreamCallback,
  StreamChunk,
} from './types';

export { canRunModel, detectCapabilities } from './capabilities';
export { useCapabilities, useLLM, useModelLoader } from './hooks';
export type { GenerationState, UseLLMResult } from './hooks';
export {
  getCompatibleModels,
  getModelById,
  getModelsByProvider,
  getModelsBySize,
  MODEL_REGISTRY,
} from './model-registry';
export { createProvider } from './provider-factory';
export type { LLMProviderInstance } from './provider-factory';
