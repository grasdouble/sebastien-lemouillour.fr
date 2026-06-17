import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { LLMProviderInstance } from '../../provider-factory';
import { useLLM } from '../useLLM';

const makeProvider = (overrides: Partial<LLMProviderInstance> = {}): LLMProviderInstance => {
  const generate = vi.fn().mockResolvedValue({ text: 'response', tokensGenerated: 10, timeMs: 100 });
  const generateStream = vi.fn().mockResolvedValue(undefined);
  const load = vi.fn().mockResolvedValue(undefined);
  const unload = vi.fn().mockResolvedValue(undefined);
  return { generate, generateStream, load, unload, ...overrides };
};

describe('useLLM', () => {
  it('starts in idle state', () => {
    const { result } = renderHook(() => useLLM(null));
    expect(result.current.state).toBe('idle');
    expect(result.current.result).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('generates text and reaches done state', async () => {
    const generateMock = vi.fn().mockResolvedValue({ text: 'response', tokensGenerated: 10, timeMs: 100 });
    const provider = makeProvider({ generate: generateMock });
    const { result } = renderHook(() => useLLM(provider));

    await act(async () => {
      await result.current.generate([{ role: 'user', content: 'hello' }]);
    });

    expect(generateMock).toHaveBeenCalled();
    expect(result.current.state).toBe('done');
    expect(result.current.result?.text).toBe('response');
  });

  it('sets error state when provider is null', async () => {
    const { result } = renderHook(() => useLLM(null));

    await act(async () => {
      await result.current.generate([{ role: 'user', content: 'hello' }]);
    });

    expect(result.current.state).toBe('error');
    expect(result.current.error?.message).toBe('No provider loaded');
  });

  it('sets error state when generate throws', async () => {
    const provider = makeProvider({
      generate: vi.fn().mockRejectedValue(new Error('inference failed')),
    });
    const { result } = renderHook(() => useLLM(provider));

    await act(async () => {
      await result.current.generate([{ role: 'user', content: 'hello' }]);
    });

    expect(result.current.state).toBe('error');
    expect(result.current.error?.message).toBe('inference failed');
  });

  it('streams tokens and reaches done state', async () => {
    const generateStreamMock = vi.fn().mockResolvedValue(undefined);
    const provider = makeProvider({ generateStream: generateStreamMock });
    const { result } = renderHook(() => useLLM(provider));
    const onStream = vi.fn();

    await act(async () => {
      await result.current.generateStream([{ role: 'user', content: 'hi' }], {}, onStream);
    });

    expect(generateStreamMock).toHaveBeenCalled();
    expect(result.current.state).toBe('done');
  });

  it('sets error state when generateStream throws', async () => {
    const provider = makeProvider({
      generateStream: vi.fn().mockRejectedValue(new Error('stream failed')),
    });
    const { result } = renderHook(() => useLLM(provider));

    await act(async () => {
      await result.current.generateStream([{ role: 'user', content: 'hi' }], {}, vi.fn());
    });

    expect(result.current.state).toBe('error');
    expect(result.current.error?.message).toBe('stream failed');
  });

  it('sets error state when generateStream provider is null', async () => {
    const { result } = renderHook(() => useLLM(null));

    await act(async () => {
      await result.current.generateStream([{ role: 'user', content: 'hi' }], {}, vi.fn());
    });

    expect(result.current.state).toBe('error');
    expect(result.current.error?.message).toBe('No provider loaded');
  });

  it('resets state to idle', async () => {
    const provider = makeProvider();
    const { result } = renderHook(() => useLLM(provider));

    await act(async () => {
      await result.current.generate([{ role: 'user', content: 'hello' }]);
    });
    expect(result.current.state).toBe('done');

    act(() => {
      result.current.reset();
    });
    expect(result.current.state).toBe('idle');
    expect(result.current.result).toBeNull();
    expect(result.current.error).toBeNull();
  });
});
