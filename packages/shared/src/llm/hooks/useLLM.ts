/**
 * Hook for LLM text generation and inference
 */

import { useCallback, useState } from 'react';

import type { LLMProviderInstance } from '../provider-factory';
import type { GenerationConfig, GenerationResult, OnStreamCallback } from '../types';

export type GenerationState = 'idle' | 'generating' | 'streaming' | 'done' | 'error';

export type UseLLMResult = {
  state: GenerationState;
  result: GenerationResult | null;
  error: Error | null;
  generate: (prompt: string, config?: GenerationConfig) => Promise<void>;
  generateStream: (prompt: string, config: GenerationConfig, onStream: OnStreamCallback) => Promise<void>;
  reset: () => void;
};

/**
 * React hook for LLM text generation with streaming support
 * @param provider - The LLM provider instance to use for generation
 * @returns Generation state and functions
 */
export function useLLM(provider: LLMProviderInstance | null): UseLLMResult {
  const [state, setState] = useState<GenerationState>('idle');
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const generate = useCallback(
    async (prompt: string, config?: GenerationConfig) => {
      if (!provider) {
        setError(new Error('No provider loaded'));
        setState('error');
        return;
      }

      setState('generating');
      setError(null);

      try {
        const generationResult = await provider.generate(prompt, config);
        setResult(generationResult);
        setState('done');
      } catch (err) {
        setError(err as Error);
        setState('error');
      }
    },
    [provider]
  );

  const generateStream = useCallback(
    async (prompt: string, config: GenerationConfig, onStream: OnStreamCallback) => {
      if (!provider) {
        setError(new Error('No provider loaded'));
        setState('error');
        return;
      }

      setState('streaming');
      setError(null);

      try {
        await provider.generateStream(prompt, config, onStream);
        setState('done');
      } catch (err) {
        setError(err as Error);
        setState('error');
      }
    },
    [provider]
  );

  const reset = useCallback(() => {
    setState('idle');
    setResult(null);
    setError(null);
  }, []);

  return {
    state,
    result,
    error,
    generate,
    generateStream,
    reset,
  };
}
