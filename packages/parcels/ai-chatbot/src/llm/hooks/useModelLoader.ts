/**
 * Hook to manage model loading with progress tracking
 */

import { useCallback, useState } from 'react';

import type { LLMProviderInstance } from '../provider-factory';
import type { ModelConfig, ModelLoadProgress } from '../types';
import { createProvider } from '../provider-factory';

/**
 * React hook for loading LLM models with progress tracking
 * @returns Model loader state and functions
 */
export function useModelLoader() {
  const [progress, setProgress] = useState<ModelLoadProgress>({
    loaded: false,
    progress: 0,
    status: 'idle',
  });
  const [provider, setProvider] = useState<LLMProviderInstance | null>(null);

  const loadModel = useCallback(async (model: ModelConfig) => {
    setProgress({
      loaded: false,
      progress: 0,
      status: 'downloading',
      timeElapsedMs: 0,
    });

    const startTime = Date.now();

    try {
      const newProvider = createProvider(model);

      await newProvider.load((progressValue) => {
        setProgress((prev) => ({
          ...prev,
          progress: progressValue,
          status: progressValue === 100 ? 'loading' : 'downloading',
          timeElapsedMs: Date.now() - startTime,
        }));
      });

      setProvider(newProvider);
      setProgress({
        loaded: true,
        progress: 100,
        status: 'ready',
        timeElapsedMs: Date.now() - startTime,
      });
    } catch (error) {
      setProgress({
        loaded: false,
        progress: 0,
        status: 'error',
        error: error as Error,
        timeElapsedMs: Date.now() - startTime,
      });
    }
  }, []);

  const unloadModel = useCallback(async () => {
    if (provider) {
      await provider.unload();
      setProvider(null);
      setProgress({
        loaded: false,
        progress: 0,
        status: 'idle',
      });
    }
  }, [provider]);

  return {
    progress,
    provider,
    loadModel,
    unloadModel,
  };
}
