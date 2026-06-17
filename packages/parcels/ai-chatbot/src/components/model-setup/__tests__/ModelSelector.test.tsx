import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { ModelConfig } from '../../../llm/types';
import { ModelSelector } from '../ModelSelector';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@grasdouble/lufa_design-system', () => ({
  Label: ({ children, htmlFor }: React.PropsWithChildren<{ htmlFor?: string }>) => (
    <label htmlFor={htmlFor}>{children}</label>
  ),
  Stack: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  Text: ({ children, as: As = 'span' }: React.PropsWithChildren<{ as?: React.ElementType }>) => <As>{children}</As>,
}));

vi.mock('../../../llm/model-registry', () => ({
  MODEL_REGISTRY: [
    {
      id: 'smollm2-360m',
      name: 'SmolLM2 360M',
      provider: 'webllm',
      size: 'small',
      parameterCount: '360M',
      estimatedSizeGB: 0.4,
      minMemoryGB: 2,
      requiresWebGPU: true,
      webllmModelId: 'SmolLM2-360M-Instruct-q4f16_1-MLC',
      descriptionKey: 'chatbot.models.smollm2',
    },
    {
      id: 'llama-3.2-1b',
      name: 'Llama 3.2 1B',
      provider: 'webllm',
      size: 'small',
      parameterCount: '1B',
      estimatedSizeGB: 0.9,
      minMemoryGB: 2,
      requiresWebGPU: true,
      webllmModelId: 'Llama-3.2-1B-Instruct-q4f16_1-MLC',
    },
  ] as ModelConfig[],
}));

const mockModel: ModelConfig = {
  id: 'smollm2-360m',
  name: 'SmolLM2 360M',
  provider: 'webllm',
  size: 'small',
  parameterCount: '360M',
  estimatedSizeGB: 0.4,
  minMemoryGB: 2,
  requiresWebGPU: true,
  webllmModelId: 'SmolLM2-360M-Instruct-q4f16_1-MLC',
  descriptionKey: 'chatbot.models.smollm2',
};

describe('ModelSelector', () => {
  afterEach(cleanup);

  it('renders the title and select element', () => {
    render(<ModelSelector onSelect={vi.fn()} selectedModel={null} />);
    expect(screen.getByText('chatbot.model.title')).toBeTruthy();
    expect(screen.getByRole('combobox')).toBeTruthy();
  });

  it('renders all models as options', () => {
    render(<ModelSelector onSelect={vi.fn()} selectedModel={null} />);
    expect(screen.getByText(/SmolLM2 360M/)).toBeTruthy();
    expect(screen.getByText(/Llama 3.2 1B/)).toBeTruthy();
  });

  it('shows the translation key as description when descriptionKey is set', () => {
    render(<ModelSelector onSelect={vi.fn()} selectedModel={null} />);
    expect(screen.getByText(/chatbot.models.smollm2/)).toBeTruthy();
  });

  it('calls onSelect with the selected model when changed', () => {
    const onSelect = vi.fn();
    render(<ModelSelector onSelect={onSelect} selectedModel={null} />);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'smollm2-360m' } });
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 'smollm2-360m' }));
  });

  it('does not call onSelect when disabled', () => {
    const onSelect = vi.fn();
    render(<ModelSelector onSelect={onSelect} selectedModel={null} disabled />);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'smollm2-360m' } });
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('reflects the selected model value', () => {
    render(<ModelSelector onSelect={vi.fn()} selectedModel={mockModel} />);
    expect(screen.getByRole<HTMLSelectElement>('combobox').value).toBe('smollm2-360m');
  });

  it('shows empty value when no model is selected', () => {
    render(<ModelSelector onSelect={vi.fn()} selectedModel={null} />);
    expect(screen.getByRole<HTMLSelectElement>('combobox').value).toBe('');
  });
});
