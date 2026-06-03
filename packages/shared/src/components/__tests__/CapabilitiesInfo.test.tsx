import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { CapabilitiesInfo } from '../CapabilitiesInfo';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

afterEach(() => {
  cleanup();
});

describe('CapabilitiesInfo', () => {
  it('renders WebGPU support status', () => {
    const { getByText } = render(
      <CapabilitiesInfo
        capabilities={{
          hasWebGPU: true,
          hasWebGL: true,
          deviceMemoryGB: 8,
          recommendedProvider: 'webllm',
          canRunLargeModels: true,
        }}
      />
    );

    expect(getByText('capabilities.supported')).toBeDefined();
  });

  it('renders device memory', () => {
    const { getByText } = render(
      <CapabilitiesInfo
        capabilities={{
          hasWebGPU: false,
          hasWebGL: true,
          deviceMemoryGB: 16,
          recommendedProvider: 'webllm',
          canRunLargeModels: false,
        }}
      />
    );

    expect(getByText('16GB')).toBeDefined();
  });

  it('shows not supported when WebGPU is unavailable', () => {
    const { getByText } = render(
      <CapabilitiesInfo
        capabilities={{
          hasWebGPU: false,
          hasWebGL: false,
          deviceMemoryGB: 4,
          recommendedProvider: 'webllm',
          canRunLargeModels: false,
        }}
      />
    );

    expect(getByText('capabilities.notSupported')).toBeDefined();
  });
});
