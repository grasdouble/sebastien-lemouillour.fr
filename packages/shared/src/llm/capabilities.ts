/**
 * Browser capabilities detection for LLM execution
 */

import type { BrowserCapabilities, LLMProvider } from './types';

/**
 * Detects browser capabilities for running LLMs
 */
export function detectCapabilities(): BrowserCapabilities {
  const hasWebGPU = 'gpu' in navigator;
  const hasWebGL = detectWebGL();
  const deviceMemoryGB = getDeviceMemory();

  let maxTextureSize: number | undefined;
  if (hasWebGL) {
    maxTextureSize = getMaxTextureSize();
  }

  const canRunLargeModels = hasWebGPU && deviceMemoryGB >= 8;
  const recommendedProvider: LLMProvider = 'webllm';

  return {
    hasWebGPU,
    hasWebGL,
    deviceMemoryGB,
    maxTextureSize,
    recommendedProvider,
    canRunLargeModels,
  };
}

/**
 * Checks if WebGL is available
 */
function detectWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') ?? canvas.getContext('webgl2');
    return !!gl;
  } catch {
    return false;
  }
}

/**
 * Gets device memory in GB (estimates if API not available)
 */
function getDeviceMemory(): number {
  // @ts-expect-error deviceMemory is not in standard types
  const memory = navigator.deviceMemory as number | undefined;
  return memory ?? 4;
}

/**
 * Gets maximum texture size for WebGL
 */
function getMaxTextureSize(): number | undefined {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') ?? canvas.getContext('webgl2');
    if (!gl) return undefined;

    return gl.getParameter(gl.MAX_TEXTURE_SIZE) as number;
  } catch {
    return undefined;
  }
}

/**
 * Checks if a model can be run based on capabilities
 */
export function canRunModel(capabilities: BrowserCapabilities, minMemoryGB: number, requiresWebGPU: boolean): boolean {
  if (requiresWebGPU && !capabilities.hasWebGPU) {
    return false;
  }

  if (capabilities.deviceMemoryGB < minMemoryGB) {
    return false;
  }

  return true;
}
