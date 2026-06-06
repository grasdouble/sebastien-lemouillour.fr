/**
 * Registry of supported LLM models
 */

import type { ModelConfig } from './types';

export const MODEL_REGISTRY: ModelConfig[] = [
  // Tiny models (< 1B parameters) - Fast demos and testing
  {
    id: 'smollm2-360m',
    name: 'SmolLM2 360M',
    provider: 'webllm',
    size: 'small',
    parameterCount: '360M',
    estimatedSizeGB: 0.4,
    minMemoryGB: 2,
    requiresWebGPU: true,
    webllmModelId: 'SmolLM2-360M-Instruct-q4f16_1-MLC',
    description: 'Ultra-rapide, idéal pour tester',
  },
  {
    id: 'llama-3.2-1b',
    name: 'Llama 3.2 1B',
    provider: 'webllm',
    size: 'small',
    parameterCount: '1B',
    estimatedSizeGB: 0.9,
    minMemoryGB: 2,
    requiresWebGPU: true,
    webllmModelId: 'Llama-3.2-1B-Instruct-q4f16_1-MLC',
    description: 'Rapide, bon pour conversations simples',
  },

  // Small models (~2-4B parameters) - Balanced performance
  {
    id: 'qwen2.5-3b',
    name: 'Qwen 2.5 3B',
    provider: 'webllm',
    size: 'small',
    parameterCount: '3B',
    estimatedSizeGB: 2.5,
    minMemoryGB: 3,
    requiresWebGPU: true,
    webllmModelId: 'Qwen2.5-3B-Instruct-q4f16_1-MLC',
    description: 'Excellent multilingue, support français natif',
  },
  {
    id: 'llama-3.2-3b',
    name: 'Llama 3.2 3B',
    provider: 'webllm',
    size: 'small',
    parameterCount: '3B',
    estimatedSizeGB: 2.3,
    minMemoryGB: 3,
    requiresWebGPU: true,
    webllmModelId: 'Llama-3.2-3B-Instruct-q4f16_1-MLC',
    description: 'Équilibré, polyvalent pour usage quotidien',
  },
  {
    id: 'hermes-3-llama-3.2-3b',
    name: 'Hermes 3 Llama 3.2 3B',
    provider: 'webllm',
    size: 'small',
    parameterCount: '3B',
    estimatedSizeGB: 2.4,
    minMemoryGB: 3,
    requiresWebGPU: true,
    webllmModelId: 'Hermes-3-Llama-3.2-3B-q4f16_1-MLC',
    description: 'Optimisé pour instructions complexes',
  },
  {
    id: 'phi-4-mini',
    name: 'Phi-4 Mini',
    provider: 'webllm',
    size: 'small',
    parameterCount: '3.8B',
    estimatedSizeGB: 3.4,
    minMemoryGB: 4,
    requiresWebGPU: true,
    webllmModelId: 'Phi-4-mini-instruct-q4f16_1-MLC',
    description: 'Excellent pour raisonnement et code',
  },

  // Medium models (~7-8B parameters) - High quality responses
  {
    id: 'qwen2.5-7b',
    name: 'Qwen 2.5 7B',
    provider: 'webllm',
    size: 'medium',
    parameterCount: '7B',
    estimatedSizeGB: 4.5,
    minMemoryGB: 6,
    requiresWebGPU: true,
    webllmModelId: 'Qwen2.5-7B-Instruct-q4f16_1-MLC',
    description: 'Puissant multilingue, excellent en français',
  },
  {
    id: 'llama-3.1-8b',
    name: 'Llama 3.1 8B',
    provider: 'webllm',
    size: 'medium',
    parameterCount: '8B',
    estimatedSizeGB: 5.0,
    minMemoryGB: 6,
    requiresWebGPU: true,
    webllmModelId: 'Llama-3.1-8B-Instruct-q4f16_1-MLC',
    description: 'Haute qualité, créativité et nuances',
  },
  {
    id: 'hermes-2-pro-llama-3-8b',
    name: 'Hermes 2 Pro Llama 3 8B',
    provider: 'webllm',
    size: 'medium',
    parameterCount: '8B',
    estimatedSizeGB: 5.0,
    minMemoryGB: 6,
    requiresWebGPU: true,
    webllmModelId: 'Hermes-2-Pro-Llama-3-8B-q4f16_1-MLC',
    description: 'Meilleur pour instructions que Llama standard',
  },
  {
    id: 'deepseek-r1-qwen-7b',
    name: 'DeepSeek R1 Qwen 7B',
    provider: 'webllm',
    size: 'medium',
    parameterCount: '7B',
    estimatedSizeGB: 5.1,
    minMemoryGB: 6,
    requiresWebGPU: true,
    webllmModelId: 'DeepSeek-R1-Distill-Qwen-7B-q4f16_1-MLC',
    description: 'Expert en raisonnement complexe et maths',
  },
  {
    id: 'hermes-2-pro-mistral-7b',
    name: 'Hermes 2 Pro Mistral 7B',
    provider: 'webllm',
    size: 'medium',
    parameterCount: '7B',
    estimatedSizeGB: 4.8,
    minMemoryGB: 6,
    requiresWebGPU: true,
    webllmModelId: 'Hermes-2-Pro-Mistral-7B-q4f16_1-MLC',
    description: 'Performant pour code et raisonnement',
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
export function getModelsByProvider(provider: 'webllm'): ModelConfig[] {
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
