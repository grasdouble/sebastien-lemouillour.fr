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
  const [lastAttemptedModel, setLastAttemptedModel] = useState<ModelConfig | null>(null);

  const loadModel = useCallback(
    async (model: ModelConfig) => {
      // Unload previous provider if exists
      if (provider) {
        await provider.unload();
        setProvider(null);
      }

      let cancelled = false;

      setLastAttemptedModel(model);
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
          if (!cancelled) {
            setProgress((prev) => ({
              ...prev,
              progress: progressValue,
              status: progressValue === 100 ? 'loading' : 'downloading',
              timeElapsedMs: Date.now() - startTime,
            }));
          }
        });

        if (!cancelled) {
          setProvider(newProvider);
          setProgress({
            loaded: true,
            progress: 100,
            status: 'ready',
            timeElapsedMs: Date.now() - startTime,
          });
        } else {
          // Cleanup if cancelled
          await newProvider.unload();
        }
      } catch (error) {
        if (!cancelled) {
          setProgress({
            loaded: false,
            progress: 0,
            status: 'error',
            error: error as Error,
            timeElapsedMs: Date.now() - startTime,
          });
        }
      }

      return () => {
        cancelled = true;
      };
    },
    [provider]
  );

  const retryLoadModel = useCallback(() => {
    if (lastAttemptedModel) {
      return loadModel(lastAttemptedModel);
    }
    return Promise.resolve();
  }, [lastAttemptedModel, loadModel]);

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
    retryLoadModel,
    unloadModel,
  };
}
