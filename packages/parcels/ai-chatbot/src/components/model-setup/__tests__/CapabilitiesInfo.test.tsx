import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { CapabilitiesInfo } from '../CapabilitiesInfo';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@grasdouble/lufa_design-system', () => ({
  Badge: ({ children }: React.PropsWithChildren) => <span>{children}</span>,
  Box: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  Flex: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  Text: ({ children, as: As = 'span' }: React.PropsWithChildren<{ as?: React.ElementType }>) => <As>{children}</As>,
}));

const baseCapabilities = {
  hasWebGPU: true,
  hasWebGL: true,
  deviceMemoryGB: 8,
  recommendedProvider: 'webllm' as const,
  canRunLargeModels: true,
};

describe('CapabilitiesInfo', () => {
  afterEach(cleanup);

  it('renders the title', () => {
    render(<CapabilitiesInfo capabilities={baseCapabilities} />);
    expect(screen.getByText('capabilities.title')).toBeTruthy();
  });

  it('shows webgpu supported badge when hasWebGPU is true', () => {
    render(<CapabilitiesInfo capabilities={baseCapabilities} />);
    expect(screen.getByText('capabilities.supported')).toBeTruthy();
  });

  it('shows webgpu not supported badge when hasWebGPU is false', () => {
    render(<CapabilitiesInfo capabilities={{ ...baseCapabilities, hasWebGPU: false }} />);
    expect(screen.getByText('capabilities.notSupported')).toBeTruthy();
  });

  it('shows device memory amount', () => {
    render(<CapabilitiesInfo capabilities={baseCapabilities} />);
    expect(screen.getByText('8GB')).toBeTruthy();
  });

  it('shows correct memory for a different value', () => {
    render(<CapabilitiesInfo capabilities={{ ...baseCapabilities, deviceMemoryGB: 16 }} />);
    expect(screen.getByText('16GB')).toBeTruthy();
  });
});
