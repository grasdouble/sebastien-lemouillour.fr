/**
 * Tests for LLM provider factory with conversation history
 */

import { describe, expect, it, vi } from 'vitest';

import type { ChatMessage, ModelConfig } from '../types';
import { createProvider, isModelCached } from '../provider-factory';

const mockInitProgressCallback = vi.hoisted(() => ({
  fn: null as ((report: { progress?: number; text?: string }) => void) | null,
}));

// Mock WebLLM
vi.mock('@mlc-ai/web-llm', () => ({
  hasModelInCache: vi.fn().mockResolvedValue(true),
  CreateMLCEngine: vi.fn(
    (_modelId: string, options?: { initProgressCallback?: (report: { progress?: number; text?: string }) => void }) => {
      // Capture the callback so tests can call it
      if (options?.initProgressCallback) {
        mockInitProgressCallback.fn = options.initProgressCallback;
      }
      return Promise.resolve({
        chat: {
          completions: {
            create: vi.fn(({ messages, stream }: { messages: ChatMessage[]; stream?: boolean }) => {
              if (stream) {
                // Return async iterable for streaming
                return (async function* () {
                  const words = messages
                    .map((m) => m.content)
                    .join(' ')
                    .split(' ');
                  for (const word of words) {
                    await Promise.resolve(); // Add await for eslint
                    yield {
                      choices: [
                        {
                          delta: {
                            content: word + ' ',
                          },
                        },
                      ],
                    };
                  }
                })();
              }

              // Non-streaming response
              return Promise.resolve({
                choices: [
                  {
                    message: {
                      content: `Response to: ${messages.map((m) => m.content).join(' ')}`,
                    },
                  },
                ],
                usage: {
                  completion_tokens: 10,
                },
              });
            }),
          },
        },
      });
    }
  ),
}));

describe('provider-factory', () => {
  const testModel: ModelConfig = {
    id: 'test-model',
    name: 'Test Model',
    provider: 'webllm',
    size: 'small',
    parameterCount: '1B',
    estimatedSizeGB: 1,
    minMemoryGB: 2,
    requiresWebGPU: false,
    webllmModelId: 'test-model-id',
  };

  describe('generate', () => {
    it('should accept and pass conversation history to WebLLM', async () => {
      const provider = createProvider(testModel);
      await provider.load();

      const messages: ChatMessage[] = [
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: 'Hi there!' },
        { role: 'user', content: 'How are you?' },
      ];

      const result = await provider.generate(messages);

      expect(result.text).toContain('Hello');
      expect(result.text).toContain('How are you?');
      expect(result.tokensGenerated).toBe(10);
    });

    it('should handle single message conversations', async () => {
      const provider = createProvider(testModel);
      await provider.load();

      const messages: ChatMessage[] = [{ role: 'user', content: 'Test prompt' }];

      const result = await provider.generate(messages);

      expect(result.text).toBe('Response to: Test prompt');
    });

    it('should throw if engine not loaded', async () => {
      const provider = createProvider(testModel);

      const messages: ChatMessage[] = [{ role: 'user', content: 'Test' }];

      await expect(provider.generate(messages)).rejects.toThrow('WebLLM engine not loaded');
    });
  });

  describe('load with progress callback', () => {
    it('calls onProgress when initProgressCallback fires', async () => {
      const provider = createProvider(testModel);
      const onProgress = vi.fn();

      await provider.load(onProgress);

      // Simulate the engine firing a progress report
      mockInitProgressCallback.fn?.({ progress: 0.5 });
      expect(onProgress).toHaveBeenCalledWith(50);
    });

    it('ignores initProgressCallback when onProgress is undefined', async () => {
      const provider = createProvider(testModel);
      await provider.load(); // No onProgress
      // Simulate callback with progress — should not throw
      expect(() => mockInitProgressCallback.fn?.({ progress: 0.8 })).not.toThrow();
    });

    it('ignores initProgressCallback when progress is undefined', async () => {
      const provider = createProvider(testModel);
      const onProgress = vi.fn();
      await provider.load(onProgress);
      mockInitProgressCallback.fn?.({ text: 'loading...' }); // No progress field
      expect(onProgress).not.toHaveBeenCalled();
    });
  });

  describe('generateStream', () => {
    it('streams tokens from the engine and calls onStream callback', async () => {
      const provider = createProvider(testModel);
      await provider.load();

      const chunks: string[] = [];
      const onStream = vi.fn((chunk: { token: string; cumulativeText: string; done: boolean }) => {
        chunks.push(chunk.token);
      });

      const messages: ChatMessage[] = [{ role: 'user', content: 'hello world' }];
      await provider.generateStream(messages, {}, onStream);

      expect(onStream).toHaveBeenCalled();
      // Last call should have done: true
      const lastCall = onStream.mock.calls.at(-1)?.[0];
      expect(lastCall?.done).toBe(true);
    });

    it('throws when engine not loaded', async () => {
      const provider = createProvider(testModel);
      await expect(provider.generateStream([], {}, vi.fn())).rejects.toThrow('WebLLM engine not loaded');
    });
  });

  describe('isModelCached', () => {
    it('returns true when model is in cache', async () => {
      const result = await isModelCached('test-model-id');
      expect(result).toBe(true);
    });
  });

  describe('createProvider errors', () => {
    it('throws when model has no webllmModelId', () => {
      const modelWithoutId = { ...testModel, webllmModelId: '' };
      expect(() => createProvider(modelWithoutId)).toThrow();
    });
  });

  describe('unload', () => {
    it('unloads the engine without error', async () => {
      const provider = createProvider(testModel);
      await provider.load();
      await expect(provider.unload()).resolves.toBeUndefined();
    });
  });
});
