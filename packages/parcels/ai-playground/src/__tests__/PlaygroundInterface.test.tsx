import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { PlaygroundInterface } from '../components/PlaygroundInterface';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('@grasdouble/slm_shared', async () => {
  const actual = await vi.importActual('@grasdouble/slm_shared');
  return {
    ...actual,
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
  };
});

afterEach(() => {
  cleanup();
});

describe('PlaygroundInterface', () => {
  it('renders capabilities info', () => {
    const { getByText } = render(<PlaygroundInterface />);
    expect(getByText('playground.capabilities.title')).toBeDefined();
  });

  it('renders model selector', () => {
    const { getByText } = render(<PlaygroundInterface />);
    expect(getByText('playground.models.title')).toBeDefined();
  });

  it('does not show controls before model is loaded', () => {
    const { queryByText } = render(<PlaygroundInterface />);
    expect(queryByText('playground.prompt.title')).toBeNull();
  });
});
