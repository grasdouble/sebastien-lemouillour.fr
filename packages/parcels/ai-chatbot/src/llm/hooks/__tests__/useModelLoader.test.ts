import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { ModelConfig } from '../../types';
import { createProvider } from '../../provider-factory';
import { useModelLoader } from '../useModelLoader';

const mockProvider = vi.hoisted(() => ({
  load: vi.fn(),
  unload: vi.fn().mockResolvedValue(undefined),
  generate: vi.fn(),
  generateStream: vi.fn(),
}));

vi.mock('../../provider-factory', () => ({
  isModelCached: vi.fn().mockResolvedValue(false),
  createProvider: vi.fn().mockReturnValue(mockProvider),
}));

const baseModel: ModelConfig = {
  id: 'smollm2-360m',
  name: 'SmolLM2 360M',
  provider: 'webllm',
  size: 'small',
  parameterCount: '360M',
  estimatedSizeGB: 0.4,
  minMemoryGB: 2,
  requiresWebGPU: true,
  webllmModelId: 'SmolLM2-360M-Instruct-q4f16_1-MLC',
};

describe('useModelLoader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockProvider.load.mockResolvedValue(undefined);
    vi.mocked(createProvider).mockReturnValue(mockProvider);
  });
  afterEach(async () => {
    cleanup();
    await act(async () => {
      await Promise.resolve();
    });
  });

  it('releases the model when the hook unmounts', async () => {
    const { result, unmount } = renderHook(() => useModelLoader());
    await act(async () => {
      await result.current.loadModel(baseModel);
    });
    unmount();
    await act(async () => {
      await Promise.resolve();
    });
    expect(mockProvider.unload).toHaveBeenCalledOnce();
  });

  it('releases an in-flight model after unmount without publishing it', async () => {
    const loading = Promise.withResolvers<void>();
    mockProvider.load.mockReturnValue(loading.promise);
    const { result, unmount } = renderHook(() => useModelLoader());
    let task: Promise<unknown>;
    await act(async () => {
      task = result.current.loadModel(baseModel);
      await Promise.resolve();
    });
    unmount();
    await act(async () => {
      loading.resolve();
      await task;
    });
    expect(mockProvider.unload).toHaveBeenCalledOnce();
  });

  it('keeps the newest requested model and releases the superseded load', async () => {
    const loading = Promise.withResolvers<void>();
    const first = {
      ...mockProvider,
      load: vi.fn().mockReturnValue(loading.promise),
      unload: vi.fn().mockResolvedValue(undefined),
    };
    const second = {
      ...mockProvider,
      load: vi.fn().mockResolvedValue(undefined),
      unload: vi.fn().mockResolvedValue(undefined),
    };
    vi.mocked(createProvider).mockReturnValueOnce(first).mockReturnValueOnce(second);
    const { result } = renderHook(() => useModelLoader());
    let firstTask: Promise<unknown>;
    let secondTask: Promise<unknown>;
    await act(async () => {
      firstTask = result.current.loadModel(baseModel);
      await Promise.resolve();
    });
    await act(async () => {
      secondTask = result.current.loadModel({ ...baseModel, id: 'second' });
      await Promise.resolve();
    });
    await act(async () => {
      loading.resolve();
      await firstTask;
      await secondTask;
    });
    expect(first.unload).toHaveBeenCalledOnce();
    expect(result.current.provider).toBe(second);
    expect(result.current.progress.status).toBe('ready');
  });

  it('starts with idle status', () => {
    const { result } = renderHook(() => useModelLoader());
    expect(result.current.progress.status).toBe('idle');
    expect(result.current.provider).toBeNull();
  });

  it('sets status to ready after successful load', async () => {
    mockProvider.load.mockImplementation((onProgress: (p: number) => void) => {
      onProgress(50);
      onProgress(100);
      return Promise.resolve();
    });

    const { result } = renderHook(() => useModelLoader());

    await act(async () => {
      await result.current.loadModel(baseModel);
    });

    expect(result.current.progress.status).toBe('ready');
    expect(result.current.progress.loaded).toBe(true);
    expect(result.current.provider).toBe(mockProvider);
  });

  it('sets status to error when load fails', async () => {
    mockProvider.load.mockRejectedValue(new Error('load failed'));

    const { result } = renderHook(() => useModelLoader());

    await act(async () => {
      await result.current.loadModel(baseModel);
    });

    expect(result.current.progress.status).toBe('error');
    expect(result.current.progress.loaded).toBe(false);
    expect(result.current.progress.error?.message).toBe('load failed');
  });

  it('unloads the current provider and resets to idle', async () => {
    mockProvider.load.mockImplementation((onProgress: (p: number) => void) => {
      onProgress(100);
      return Promise.resolve();
    });

    const { result } = renderHook(() => useModelLoader());

    await act(async () => {
      await result.current.loadModel(baseModel);
    });
    expect(result.current.provider).toBe(mockProvider);

    await act(async () => {
      await result.current.unloadModel();
    });

    expect(result.current.provider).toBeNull();
    expect(result.current.progress.status).toBe('idle');
    expect(mockProvider.unload).toHaveBeenCalled();
  });

  it('unloads previous provider when loading a new model', async () => {
    mockProvider.load.mockImplementation((onProgress: (p: number) => void) => {
      onProgress(100);
      return Promise.resolve();
    });

    const { result } = renderHook(() => useModelLoader());

    await act(async () => {
      await result.current.loadModel(baseModel);
    });
    expect(result.current.provider).toBe(mockProvider);

    await act(async () => {
      await result.current.loadModel({ ...baseModel, id: 'another-model' });
    });

    expect(mockProvider.unload).toHaveBeenCalled();
  });

  it('retryLoadModel does nothing if no model has been loaded', async () => {
    const { result } = renderHook(() => useModelLoader());
    await act(async () => {
      await result.current.retryLoadModel();
    });
    // No error — returns resolved promise when no model attempted
    expect(result.current.progress.status).toBe('idle');
  });

  it('retryLoadModel reloads the last attempted model', async () => {
    mockProvider.load
      .mockRejectedValueOnce(new Error('first fail'))
      .mockImplementationOnce((onProgress: (p: number) => void) => {
        onProgress(100);
        return Promise.resolve();
      });

    const { result } = renderHook(() => useModelLoader());

    await act(async () => {
      await result.current.loadModel(baseModel);
    });
    expect(result.current.progress.status).toBe('error');

    await act(async () => {
      await result.current.retryLoadModel();
    });
    expect(result.current.progress.status).toBe('ready');
  });
});
