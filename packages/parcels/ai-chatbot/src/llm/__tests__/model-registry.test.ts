import { describe, expect, it } from 'vitest';

import {
  getCompatibleModels,
  getModelById,
  getModelsByProvider,
  getModelsBySize,
  MODEL_REGISTRY,
} from '../model-registry';

describe('MODEL_REGISTRY', () => {
  it('contains at least one model', () => {
    expect(MODEL_REGISTRY.length).toBeGreaterThan(0);
  });

  it('every model has required fields', () => {
    for (const model of MODEL_REGISTRY) {
      expect(model.id).toBeTruthy();
      expect(model.name).toBeTruthy();
      expect(model.provider).toBe('webllm');
      expect(typeof model.estimatedSizeGB).toBe('number');
      expect(typeof model.minMemoryGB).toBe('number');
      expect(typeof model.requiresWebGPU).toBe('boolean');
    }
  });
});

describe('getModelById', () => {
  it('returns a model when found', () => {
    const model = getModelById('smollm2-360m');
    expect(model).toBeDefined();
    expect(model?.id).toBe('smollm2-360m');
  });

  it('returns undefined when not found', () => {
    expect(getModelById('nonexistent-model')).toBeUndefined();
  });
});

describe('getModelsBySize', () => {
  it('returns only small models', () => {
    const models = getModelsBySize('small');
    expect(models.length).toBeGreaterThan(0);
    expect(models.every((m) => m.size === 'small')).toBe(true);
  });

  it('returns only medium models', () => {
    const models = getModelsBySize('medium');
    expect(models.length).toBeGreaterThan(0);
    expect(models.every((m) => m.size === 'medium')).toBe(true);
  });

  it('returns empty array for large (none configured)', () => {
    const models = getModelsBySize('large');
    expect(models.every((m) => m.size === 'large')).toBe(true);
  });
});

describe('getModelsByProvider', () => {
  it('returns all webllm models', () => {
    const models = getModelsByProvider('webllm');
    expect(models.length).toBe(MODEL_REGISTRY.length);
    expect(models.every((m) => m.provider === 'webllm')).toBe(true);
  });
});

describe('getCompatibleModels', () => {
  it('returns all models when webgpu available and memory is high', () => {
    const models = getCompatibleModels(true, 64);
    expect(models.length).toBe(MODEL_REGISTRY.length);
  });

  it('filters out models requiring webgpu when webgpu not available', () => {
    const models = getCompatibleModels(false, 64);
    expect(models.every((m) => !m.requiresWebGPU)).toBe(true);
  });

  it('filters out models that require more memory than available', () => {
    const models = getCompatibleModels(true, 2);
    expect(models.every((m) => m.minMemoryGB <= 2)).toBe(true);
  });

  it('returns empty array when memory is too low', () => {
    const models = getCompatibleModels(true, 0);
    expect(models).toHaveLength(0);
  });
});
