import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { canRunModel, detectCapabilities } from '../capabilities';

const makeCanvasMock = (gl: object | null) => ({
  getContext: vi.fn().mockReturnValue(gl),
});

describe('detectCapabilities', () => {
  beforeEach(() => {
    vi.stubGlobal('navigator', {
      gpu: {},
      deviceMemory: 8,
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('detects webgpu when navigator.gpu is present', () => {
    const result = detectCapabilities();
    expect(result.hasWebGPU).toBe(true);
  });

  it('detects no webgpu when navigator.gpu is absent', () => {
    vi.stubGlobal('navigator', { deviceMemory: 8 });
    const result = detectCapabilities();
    expect(result.hasWebGPU).toBe(false);
  });

  it('reads deviceMemory from navigator', () => {
    const result = detectCapabilities();
    expect(result.deviceMemoryGB).toBe(8);
  });

  it('falls back to 4GB when deviceMemory is not available', () => {
    vi.stubGlobal('navigator', { gpu: {} });
    const result = detectCapabilities();
    expect(result.deviceMemoryGB).toBe(4);
  });

  it('detects webgl when canvas context is available', () => {
    const gl = { MAX_TEXTURE_SIZE: 0x0d33, getParameter: vi.fn().mockReturnValue(16384) };
    vi.spyOn(document, 'createElement').mockReturnValue(makeCanvasMock(gl) as unknown as HTMLCanvasElement);
    const result = detectCapabilities();
    expect(result.hasWebGL).toBe(true);
    expect(result.maxTextureSize).toBe(16384);
  });

  it('returns hasWebGL false when canvas throws', () => {
    vi.spyOn(document, 'createElement').mockImplementation(() => {
      throw new Error('no canvas');
    });
    const result = detectCapabilities();
    expect(result.hasWebGL).toBe(false);
    expect(result.maxTextureSize).toBeUndefined();
  });

  it('canRunLargeModels is true when webgpu and memory >= 8GB', () => {
    const result = detectCapabilities();
    expect(result.canRunLargeModels).toBe(true);
  });

  it('canRunLargeModels is false when memory < 8GB', () => {
    vi.stubGlobal('navigator', { gpu: {}, deviceMemory: 4 });
    const result = detectCapabilities();
    expect(result.canRunLargeModels).toBe(false);
  });
});

describe('canRunModel', () => {
  const base = {
    hasWebGPU: true,
    hasWebGL: true,
    deviceMemoryGB: 8,
    recommendedProvider: 'webllm' as const,
    canRunLargeModels: true,
  };

  it('returns true when all conditions are met', () => {
    expect(canRunModel(base, 4, true)).toBe(true);
  });

  it('returns false when webgpu is required but not available', () => {
    expect(canRunModel({ ...base, hasWebGPU: false }, 4, true)).toBe(false);
  });

  it('returns true when webgpu not required even if unavailable', () => {
    expect(canRunModel({ ...base, hasWebGPU: false }, 4, false)).toBe(true);
  });

  it('returns false when not enough device memory', () => {
    expect(canRunModel({ ...base, deviceMemoryGB: 2 }, 4, false)).toBe(false);
  });
});
