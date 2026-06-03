/**
 * Factory for creating LLM providers (WebLLM or Transformers.js)
 */

import type { GenerationConfig, GenerationResult, LLMProvider, ModelConfig, OnStreamCallback } from './types';

/**
 * Type definitions for external libraries
 * These are minimal interfaces matching the APIs we use
 */

// WebLLM types
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

// Transformers.js types
type TransformersProgressReport = {
  progress?: number;
  status?: string;
};

type TransformersPipelineResult = {
  generated_text?: string;
}[];

type TransformersPipeline = (
  text: string,
  options?: {
    max_new_tokens?: number;
    temperature?: number;
    top_p?: number;
    top_k?: number;
    do_sample?: boolean;
  }
) => Promise<TransformersPipelineResult>;

type TransformersTokenizer = {
  encode: (text: string) => { length: number };
};

export type LLMProviderInstance = {
  load(onProgress?: (progress: number) => void): Promise<void>;
  generate(prompt: string, config?: GenerationConfig): Promise<GenerationResult>;
  generateStream(prompt: string, config: GenerationConfig, onStream: OnStreamCallback): Promise<void>;
  unload(): Promise<void>;
};

/**
 * Creates an LLM provider instance based on the model configuration
 */
export function createProvider(model: ModelConfig, preferredProvider?: LLMProvider): LLMProviderInstance {
  const provider = preferredProvider ?? model.provider;

  if (provider === 'webllm') {
    return createWebLLMProvider(model);
  } else {
    return createTransformersJSProvider(model);
  }
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
      // Dynamic import to avoid bundling WebLLM in all parcels
      const { CreateMLCEngine } = await import('@mlc-ai/web-llm');

      engine = (await CreateMLCEngine(modelId, {
        initProgressCallback: (report: WebLLMProgressReport) => {
          if (onProgress && report.progress !== undefined) {
            onProgress(report.progress * 100);
          }
        },
      })) as WebLLMEngine;
    },

    async generate(prompt: string, config?: GenerationConfig): Promise<GenerationResult> {
      if (!engine) {
        throw new Error('WebLLM engine not loaded');
      }

      const startTime = performance.now();

      const response = (await engine.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        temperature: config?.temperature ?? 0.7,
        top_p: config?.topP ?? 0.9,
        max_tokens: config?.maxTokens ?? 256,
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

    async generateStream(prompt: string, config: GenerationConfig, onStream: OnStreamCallback): Promise<void> {
      if (!engine) {
        throw new Error('WebLLM engine not loaded');
      }

      const stream = engine.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        temperature: config.temperature ?? 0.7,
        top_p: config.topP ?? 0.9,
        max_tokens: config.maxTokens ?? 256,
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

/**
 * Creates a Transformers.js provider instance
 */
function createTransformersJSProvider(model: ModelConfig): LLMProviderInstance {
  if (!model.transformersJsModelId) {
    throw new Error(`Model ${model.id} does not have a Transformers.js model ID`);
  }

  const modelId = model.transformersJsModelId;
  let pipeline: TransformersPipeline | null = null;
  let tokenizer: TransformersTokenizer | null = null;

  return {
    async load(onProgress?: (progress: number) => void): Promise<void> {
      // Dynamic import to avoid bundling Transformers.js in all parcels
      const { pipeline: createPipeline, AutoTokenizer } = await import('@xenova/transformers');

      // Progress callback for model download
      const progressCallback = (progress: TransformersProgressReport) => {
        if (onProgress && progress.progress !== undefined) {
          onProgress(progress.progress);
        }
      };

      // Load tokenizer and model
      tokenizer = (await AutoTokenizer.from_pretrained(modelId, {
        progress_callback: progressCallback,
      })) as TransformersTokenizer;

      pipeline = (await createPipeline('text-generation', modelId, {
        progress_callback: progressCallback,
      })) as TransformersPipeline;
    },

    async generate(prompt: string, config?: GenerationConfig): Promise<GenerationResult> {
      if (!pipeline || !tokenizer) {
        throw new Error('Transformers.js model not loaded');
      }

      const startTime = performance.now();

      const result = await pipeline(prompt, {
        max_new_tokens: config?.maxTokens ?? 256,
        temperature: config?.temperature ?? 0.7,
        top_p: config?.topP ?? 0.9,
        top_k: config?.topK ?? 50,
        do_sample: true,
      });

      const endTime = performance.now();
      const timeMs = endTime - startTime;

      const text = result[0]?.generated_text ?? '';
      const tokens = tokenizer.encode(text);
      const tokensGenerated = tokens.length;
      const tokensPerSecond = tokensGenerated > 0 ? (tokensGenerated / timeMs) * 1000 : undefined;

      return {
        text,
        tokensGenerated,
        tokensPerSecond,
        timeMs,
      };
    },

    async generateStream(prompt: string, config: GenerationConfig, onStream: OnStreamCallback): Promise<void> {
      if (!pipeline) {
        throw new Error('Transformers.js model not loaded');
      }

      // Transformers.js doesn't support streaming in the same way
      // We'll simulate it by generating the full text and yielding it
      const result = await pipeline(prompt, {
        max_new_tokens: config.maxTokens ?? 256,
        temperature: config.temperature ?? 0.7,
        top_p: config.topP ?? 0.9,
        top_k: config.topK ?? 50,
        do_sample: true,
      });

      const text = result[0]?.generated_text ?? '';

      // Simulate streaming by yielding the full text
      onStream({ token: text, cumulativeText: text, done: true });
    },

    unload(): Promise<void> {
      // Transformers.js models are garbage collected
      pipeline = null;
      tokenizer = null;
      return Promise.resolve();
    },
  };
}
