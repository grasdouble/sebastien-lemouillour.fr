import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { CapabilitiesCheck } from '../CapabilitiesCheck';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en', resolvedLanguage: 'en' },
  }),
}));

describe('CapabilitiesCheck', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('displays warning when WebGPU is not available', () => {
    const capabilities = {
      hasWebGPU: false,
      hasWebGL: true,
      deviceMemoryGB: 4,
      recommendedProvider: 'webllm' as const,
      canRunLargeModels: false,
    };

    render(<CapabilitiesCheck capabilities={capabilities} />);

    expect(screen.getByText('chatbot.capabilities.noWebGPU.title')).toBeDefined();
  });

  it('displays warning when memory is insufficient', () => {
    const capabilities = {
      hasWebGPU: true,
      hasWebGL: true,
      deviceMemoryGB: 2,
      recommendedProvider: 'webllm' as const,
      canRunLargeModels: false,
    };

    render(<CapabilitiesCheck capabilities={capabilities} minRequiredMemoryGB={4} />);

    expect(screen.getByText('chatbot.capabilities.lowMemory.title')).toBeDefined();
  });

  it('does not render when all capabilities are met', () => {
    const capabilities = {
      hasWebGPU: true,
      hasWebGL: true,
      deviceMemoryGB: 8,
      recommendedProvider: 'webllm' as const,
      canRunLargeModels: true,
    };

    const { container } = render(<CapabilitiesCheck capabilities={capabilities} minRequiredMemoryGB={4} />);

    expect(container.firstChild).toBeNull();
  });
});
