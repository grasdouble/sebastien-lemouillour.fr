import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { PerformanceMetrics } from '../components/PerformanceMetrics';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

afterEach(() => {
  cleanup();
});

describe('PerformanceMetrics', () => {
  it('renders all metrics with values', () => {
    const { getByText } = render(
      <PerformanceMetrics tokensPerSecond={25.5} latencyMs={150} totalTokens={100} timeElapsedMs={4000} />
    );

    expect(getByText('25.50')).toBeDefined();
    expect(getByText('150ms')).toBeDefined();
    expect(getByText('100')).toBeDefined();
    expect(getByText('4.0s')).toBeDefined();
  });

  it('shows dash when metrics are undefined', () => {
    const { getAllByText } = render(<PerformanceMetrics />);
    const dashes = getAllByText('-');
    expect(dashes.length).toBe(4);
  });

  it('formats time elapsed correctly', () => {
    const { getByText } = render(<PerformanceMetrics timeElapsedMs={12345} />);
    expect(getByText('12.3s')).toBeDefined();
  });
});
