/**
 * Factory for creating LLM providers (WebLLM only)
 */

import type { ChatMessage, GenerationConfig, GenerationResult, ModelConfig, OnStreamCallback } from './types';

/**
 * WebLLM type definitions
 */
type WebLLMProgressReport = {
  progress?: number;
  text?: string;
};

type WebLLMMessage = {
  role: string;
  content: string;
};

type WebLLMChoice = {
  message?: {
    content?: string;
  };
  delta?: {
    content?: string;
  };
};

type WebLLMUsage = {
  completion_tokens?: number;
};

type WebLLMResponse = {
  choices: WebLLMChoice[];
  usage?: WebLLMUsage;
};

type WebLLMEngine = {
  chat: {
    completions: {
      create: (options: {
        messages: WebLLMMessage[];
        temperature?: number;
        top_p?: number;
        max_tokens?: number;
        stream?: boolean;
      }) => Promise<WebLLMResponse> | AsyncIterable<WebLLMResponse>;
    };
  };
};

export type LLMProviderInstance = {
  load(onProgress?: (progress: number) => void): Promise<void>;
  generate(messages: ChatMessage[], config?: GenerationConfig): Promise<GenerationResult>;
  generateStream(messages: ChatMessage[], config: GenerationConfig, onStream: OnStreamCallback): Promise<void>;
  unload(): Promise<void>;
};

// Memoized WebLLM module to avoid re-importing
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
let webLLMModule: Awaited<typeof import('@mlc-ai/web-llm')> | null = null;

/**
 * Get or load WebLLM module (memoized)
 */
async function getWebLLMModule() {
  webLLMModule ??= await import('@mlc-ai/web-llm');
  return webLLMModule;
}

/**
 * Check if a model is cached in IndexedDB
 */
export async function isModelCached(modelId: string): Promise<boolean> {
  try {
    const { hasModelInCache } = await getWebLLMModule();
    return await hasModelInCache(modelId);
  } catch {
    return false;
  }
}

/**
 * Creates an LLM provider instance (WebLLM only)
 */
export function createProvider(model: ModelConfig): LLMProviderInstance {
  if (model.provider !== 'webllm') {
    throw new Error(`Only WebLLM provider is supported`);
  }
  return createWebLLMProvider(model);
}

/**
 * Creates a WebLLM provider instance
 */
function createWebLLMProvider(model: ModelConfig): LLMProviderInstance {
  if (!model.webllmModelId) {
    throw new Error(`Model ${model.id} does not have a WebLLM model ID`);
  }

  const modelId = model.webllmModelId;
  let engine: WebLLMEngine | null = null;

  return {
    async load(onProgress?: (progress: number) => void): Promise<void> {
      // Dynamic import to avoid bundling WebLLM in all parcels (memoized)
      const { CreateMLCEngine } = await getWebLLMModule();

      engine = (await CreateMLCEngine(modelId, {
        initProgressCallback: (report: WebLLMProgressReport) => {
          if (onProgress && report.progress !== undefined) {
            onProgress(report.progress * 100);
          }
        },
      })) as WebLLMEngine;
    },

    async generate(messages: ChatMessage[], config?: GenerationConfig): Promise<GenerationResult> {
      if (!engine) {
        throw new Error('WebLLM engine not loaded');
      }

      const startTime = performance.now();

      const response = (await engine.chat.completions.create({
        messages: messages.map((msg) => ({ role: msg.role, content: msg.content })),
        temperature: config?.temperature ?? 0.7,
        top_p: config?.topP ?? 0.9,
        max_tokens: config?.maxTokens ?? 2048,
      })) as WebLLMResponse;

      const endTime = performance.now();
      const timeMs = endTime - startTime;

      const text = response.choices[0]?.message?.content ?? '';
      const tokensGenerated = response.usage?.completion_tokens ?? 0;
      const tokensPerSecond = tokensGenerated > 0 ? (tokensGenerated / timeMs) * 1000 : undefined;

      return {
        text,
        tokensGenerated,
        tokensPerSecond,
        timeMs,
      };
    },

    async generateStream(messages: ChatMessage[], config: GenerationConfig, onStream: OnStreamCallback): Promise<void> {
      if (!engine) {
        throw new Error('WebLLM engine not loaded');
      }

      const stream = engine.chat.completions.create({
        messages: messages.map((msg) => ({ role: msg.role, content: msg.content })),
        temperature: config.temperature ?? 0.7,
        top_p: config.topP ?? 0.9,
        max_tokens: config.maxTokens ?? 2048,
        stream: true,
      }) as AsyncIterable<WebLLMResponse>;

      let cumulativeText = '';

      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content ?? '';
        if (delta) {
          cumulativeText += delta;
          onStream({
            token: delta,
            cumulativeText,
            done: false,
          });
        }
      }

      onStream({ token: '', cumulativeText, done: true });
    },

    unload(): Promise<void> {
      // WebLLM doesn't expose unload in the current API
      // The engine will be garbage collected
      engine = null;
      return Promise.resolve();
    },
  };
}
