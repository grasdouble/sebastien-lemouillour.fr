import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ModelSelector } from '../components/ModelSelector';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en', resolvedLanguage: 'en' },
  }),
}));

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
    {
      id: 'tinyllama',
      name: 'TinyLlama',
      provider: 'transformers-js',
      size: 'small',
      parameterCount: '1.1B',
      estimatedSizeGB: 0.6,
      minMemoryGB: 2,
      requiresWebGPU: false,
    },
  ],
}));

describe('ModelSelector', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('renders model selector with title', () => {
    const mockOnSelect = vi.fn();
    render(<ModelSelector onSelect={mockOnSelect} selectedModel={null} />);

    expect(screen.getByText('chatbot.model.title')).toBeDefined();
  });

  it('displays all available models', () => {
    const mockOnSelect = vi.fn();
    render(<ModelSelector onSelect={mockOnSelect} selectedModel={null} />);

    const phi3Elements = screen.getAllByText('Phi-3 Mini');
    const tinyLlamaElements = screen.getAllByText('TinyLlama');

    expect(phi3Elements.length).toBeGreaterThan(0);
    expect(tinyLlamaElements.length).toBeGreaterThan(0);
  });

  it('shows model information', () => {
    const mockOnSelect = vi.fn();
    render(<ModelSelector onSelect={mockOnSelect} selectedModel={null} />);

    const phi3SizeElements = screen.getAllByText('3.8B');
    const tinyLlamaSizeElements = screen.getAllByText('1.1B');

    expect(phi3SizeElements.length).toBeGreaterThan(0);
    expect(tinyLlamaSizeElements.length).toBeGreaterThan(0);
  });
});
