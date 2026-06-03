/**
 * Registry of supported LLM models
 */

import type { ModelConfig } from './types';

export const MODEL_REGISTRY: ModelConfig[] = [
  // Small models (~1-3B parameters)
  {
    id: 'phi-3-mini',
    name: 'Phi-3 Mini',
    provider: 'webllm',
    size: 'small',
    parameterCount: '3.8B',
    estimatedSizeGB: 2.3,
    minMemoryGB: 4,
    requiresWebGPU: true,
    webllmModelId: 'Phi-3-mini-4k-instruct-q4f16_1-MLC',
  },
  {
    id: 'tinyllama',
    name: 'TinyLlama',
    provider: 'transformers-js',
    size: 'small',
    parameterCount: '1.1B',
    estimatedSizeGB: 0.6,
    minMemoryGB: 2,
    requiresWebGPU: false,
    transformersJsModelId: 'TinyLlama/TinyLlama-1.1B-Chat-v1.0',
  },
  {
    id: 'gemma-2b',
    name: 'Gemma 2B',
    provider: 'webllm',
    size: 'small',
    parameterCount: '2B',
    estimatedSizeGB: 1.4,
    minMemoryGB: 4,
    requiresWebGPU: true,
    webllmModelId: 'gemma-2b-it-q4f16_1-MLC',
  },

  // Medium models (~7B parameters)
  {
    id: 'llama-3-8b',
    name: 'Llama 3 8B',
    provider: 'webllm',
    size: 'medium',
    parameterCount: '8B',
    estimatedSizeGB: 4.8,
    minMemoryGB: 8,
    requiresWebGPU: true,
    webllmModelId: 'Llama-3-8B-Instruct-q4f16_1-MLC',
  },
  {
    id: 'mistral-7b',
    name: 'Mistral 7B',
    provider: 'webllm',
    size: 'medium',
    parameterCount: '7B',
    estimatedSizeGB: 4.1,
    minMemoryGB: 8,
    requiresWebGPU: true,
    webllmModelId: 'Mistral-7B-Instruct-v0.3-q4f16_1-MLC',
  },
];

/**
 * Get model by ID
 */
export function getModelById(id: string): ModelConfig | undefined {
  return MODEL_REGISTRY.find((model) => model.id === id);
}

/**
 * Get models by size category
 */
export function getModelsBySize(size: 'small' | 'medium' | 'large'): ModelConfig[] {
  return MODEL_REGISTRY.filter((model) => model.size === size);
}

/**
 * Get models by provider
 */
export function getModelsByProvider(provider: 'webllm' | 'transformers-js'): ModelConfig[] {
  return MODEL_REGISTRY.filter((model) => model.provider === provider);
}

/**
 * Get compatible models based on browser capabilities
 */
export function getCompatibleModels(hasWebGPU: boolean, deviceMemoryGB: number): ModelConfig[] {
  return MODEL_REGISTRY.filter((model) => {
    if (model.requiresWebGPU && !hasWebGPU) {
      return false;
    }
    if (model.minMemoryGB > deviceMemoryGB) {
      return false;
    }
    return true;
  });
}
