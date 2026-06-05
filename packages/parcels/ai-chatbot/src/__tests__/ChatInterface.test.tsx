import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ChatInterface } from '../components/ChatInterface';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en', resolvedLanguage: 'en' },
  }),
}));

// Mock the llm module
vi.mock('../llm', () => ({
  MODEL_REGISTRY: [
    {
      id: 'llama-3.2-1b',
      name: 'Llama 3.2 1B',
      provider: 'webllm',
      size: 'small',
      parameterCount: '1B',
      estimatedSizeGB: 0.9,
      minMemoryGB: 2,
      requiresWebGPU: true,
    },
  ],
  useCapabilities: () => ({
    hasWebGPU: true,
    hasWebGL: true,
    deviceMemoryGB: 8,
    recommendedProvider: 'webllm',
    canRunLargeModels: true,
  }),
  useModelLoader: () => ({
    progress: { loaded: false, progress: 0, status: 'idle' },
    provider: null,
    loadModel: vi.fn(),
    unloadModel: vi.fn(),
  }),
  useLLM: () => ({
    generate: vi.fn().mockResolvedValue({ text: 'Mock response', tokensGenerated: 10, timeMs: 100 }),
    isGenerating: false,
    error: null,
  }),
}));

// Mock the llm components
vi.mock('../components/llm', () => ({
  CapabilitiesInfo: () => <div>capabilities.title</div>,
  LoadingIndicator: () => <div>loading.idle</div>,
  ModelSelector: () => <div>models.title</div>,
}));

describe('ChatInterface', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('renders model selector initially', () => {
    render(<ChatInterface />);

    expect(screen.getByText('models.title')).toBeDefined();
  });

  it('shows empty chat state when model not ready', () => {
    render(<ChatInterface />);

    expect(screen.getByText('chatbot.chat.selectModel')).toBeDefined();
  });

  it('renders conversation and chat regions', () => {
    render(<ChatInterface />);

    expect(screen.getByTestId('chat-conversations-region')).toBeDefined();
    expect(screen.getByTestId('chat-main-region')).toBeDefined();
  });

  it('allows typing a message', () => {
    render(<ChatInterface />);

    const textarea = screen.getByPlaceholderText('chatbot.chat.input.placeholder');
    fireEvent.change(textarea, { target: { value: 'Hello' } });

    expect((textarea as HTMLTextAreaElement).value).toBe('Hello');
  });
});
