/**
 * LLM types and interfaces for browser-based language models
 */

export type LLMProvider = 'webllm';

export type BrowserCapabilities = {
  hasWebGPU: boolean;
  hasWebGL: boolean;
  deviceMemoryGB: number;
  maxTextureSize?: number;
  recommendedProvider: LLMProvider;
  canRunLargeModels: boolean;
};

export type ModelSize = {
  small: string[];
  medium: string[];
  large: string[];
};

export type ModelConfig = {
  id: string;
  name: string;
  provider: LLMProvider;
  size: 'small' | 'medium' | 'large';
  parameterCount: string;
  estimatedSizeGB: number;
  minMemoryGB: number;
  requiresWebGPU: boolean;
  webllmModelId: string;
  description?: string;
};

export type ModelLoadProgress = {
  loaded: boolean;
  progress: number;
  status: 'idle' | 'downloading' | 'loading' | 'ready' | 'error';
  loadingFromCache?: boolean;
  error?: Error;
  timeElapsedMs?: number;
};

export type GenerationConfig = {
  temperature?: number;
  topP?: number;
  topK?: number;
  maxTokens?: number;
  repetitionPenalty?: number;
  stream?: boolean;
};

export type GenerationResult = {
  text: string;
  tokensGenerated: number;
  tokensPerSecond?: number;
  timeMs: number;
};

export type StreamChunk = {
  token: string;
  cumulativeText: string;
  done: boolean;
};

export type OnStreamCallback = (chunk: StreamChunk) => void;

export type ChatMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};
