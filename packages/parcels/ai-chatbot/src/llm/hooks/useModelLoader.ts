import { useCallback, useEffect, useRef, useState } from 'react';

import type { LLMProviderInstance } from '../provider-factory';
import type { ModelConfig, ModelLoadProgress } from '../types';
import { createProvider, isModelCached } from '../provider-factory';

const IDLE: ModelLoadProgress = { loaded: false, progress: 0, status: 'idle' };

export function useModelLoader() {
  const [progress, setProgress] = useState<ModelLoadProgress>(IDLE);
  const [provider, setProvider] = useState<LLMProviderInstance | null>(null);
  const active = useRef<LLMProviderInstance | null>(null);
  const lastModel = useRef<ModelConfig | null>(null);
  const request = useRef(0);
  const mounted = useRef(true);
  // Serialize disposal and loading so two models cannot compete for GPU memory.
  const queue = useRef<Promise<void>>(Promise.resolve());

  const release = useCallback(async () => {
    const previous = active.current;
    active.current = null;
    await previous?.unload();
  }, []);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      request.current += 1;
      queue.current = queue.current.then(release).catch((error: unknown) => {
        console.error('Failed to release the language model:', error);
      });
    };
  }, [release]);

  const loadModel = useCallback(
    (model: ModelConfig): Promise<void> => {
      const id = ++request.current;
      lastModel.current = model;
      const isCurrent = () => mounted.current && request.current === id;
      setProvider(null);
      setProgress({ ...IDLE, status: 'downloading' });

      const load = async () => {
        let candidate: LLMProviderInstance | null = null;
        try {
          await release();
          if (!isCurrent()) return;
          const loadingFromCache = await isModelCached(model.webllmModelId);
          if (!isCurrent()) return;
          const start = Date.now();
          candidate = createProvider(model);
          await candidate.load((value) => {
            if (isCurrent())
              setProgress({
                loaded: false,
                progress: value,
                status: value === 100 ? 'loading' : 'downloading',
                loadingFromCache,
                timeElapsedMs: Date.now() - start,
              });
          });
          if (!isCurrent()) {
            const obsolete = candidate;
            candidate = null;
            await obsolete.unload();
            return;
          }
          active.current = candidate;
          setProvider(candidate);
          setProgress({
            loaded: true,
            progress: 100,
            status: 'ready',
            loadingFromCache,
            timeElapsedMs: Date.now() - start,
          });
        } catch (error) {
          if (candidate) {
            try {
              await candidate.unload();
            } catch (cleanupError) {
              console.error('Failed to release the language model:', cleanupError);
            }
          }
          if (isCurrent())
            setProgress({ ...IDLE, status: 'error', error: error instanceof Error ? error : new Error(String(error)) });
        }
      };
      queue.current = queue.current.then(load);
      return queue.current;
    },
    [release]
  );

  const retryLoadModel = useCallback(
    () => (lastModel.current ? loadModel(lastModel.current) : Promise.resolve()),
    [loadModel]
  );
  const unloadModel = useCallback(() => {
    request.current += 1;
    setProvider(null);
    setProgress(IDLE);
    queue.current = queue.current.then(release);
    return queue.current;
  }, [release]);

  return { progress, provider, loadModel, retryLoadModel, unloadModel };
}
