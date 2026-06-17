import { renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useCapabilities } from '../useCapabilities';

vi.mock('../../capabilities', () => ({
  detectCapabilities: () => ({
    hasWebGPU: true,
    hasWebGL: true,
    deviceMemoryGB: 8,
    recommendedProvider: 'webllm',
    canRunLargeModels: true,
  }),
}));

describe('useCapabilities', () => {
  afterEach(() => vi.clearAllMocks());

  it('returns detected browser capabilities', () => {
    const { result } = renderHook(() => useCapabilities());
    expect(result.current.hasWebGPU).toBe(true);
    expect(result.current.hasWebGL).toBe(true);
    expect(result.current.deviceMemoryGB).toBe(8);
    expect(result.current.recommendedProvider).toBe('webllm');
    expect(result.current.canRunLargeModels).toBe(true);
  });
});
