import { cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { MODEL_REGISTRY } from '@grasdouble/slm_shared';

import { ModelSelector } from '../components/ModelSelector';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

afterEach(() => {
  cleanup();
});

describe('ModelSelector', () => {
  it('renders all models from registry', () => {
    const { getAllByRole } = render(<ModelSelector onSelect={vi.fn()} selectedModel={null} />);

    const buttons = getAllByRole('button');
    expect(buttons).toHaveLength(MODEL_REGISTRY.length);
  });

  it('calls onSelect when model is clicked', () => {
    const onSelect = vi.fn();
    const { getAllByRole } = render(<ModelSelector onSelect={onSelect} selectedModel={null} />);

    const firstButton = getAllByRole('button')[0];
    fireEvent.click(firstButton);

    expect(onSelect).toHaveBeenCalledWith(MODEL_REGISTRY[0]);
  });

  it('marks selected model with aria-pressed', () => {
    const selectedModel = MODEL_REGISTRY[0];
    const { getAllByRole } = render(<ModelSelector onSelect={vi.fn()} selectedModel={selectedModel} />);

    const firstButton = getAllByRole('button')[0] as HTMLButtonElement;
    expect(firstButton.getAttribute('aria-pressed')).toBe('true');
  });
});
