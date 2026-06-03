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

// Mock the shared hooks
vi.mock('@grasdouble/slm_shared', () => ({
  MODEL_REGISTRY: [
    {
      id: 'phi-3-mini',
      name: 'Phi-3 Mini',
      provider: 'webllm',
      size: 'small',
      parameterCount: '3.8B',
      estimatedSizeGB: 2.3,
      minMemoryGB: 4,
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
    progress: 0,
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

describe('ChatInterface', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('renders model selector initially', () => {
    render(<ChatInterface />);

    expect(screen.getByText('chatbot.model.title')).toBeDefined();
  });

  it('shows empty chat state', () => {
    render(<ChatInterface />);

    expect(screen.getByText('chatbot.chat.empty')).toBeDefined();
  });

  it('allows typing a message', () => {
    render(<ChatInterface />);

    const textarea = screen.getByPlaceholderText('chatbot.chat.input.placeholder');
    fireEvent.change(textarea, { target: { value: 'Hello' } });

    expect((textarea as HTMLTextAreaElement).value).toBe('Hello');
  });
});
