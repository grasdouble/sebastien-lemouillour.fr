/**
 * Hook to detect and provide browser capabilities for LLM execution
 */

import { useState } from 'react';

import type { BrowserCapabilities } from '../types';
import { detectCapabilities } from '../capabilities';

/**
 * React hook that detects browser capabilities for running LLMs
 * @returns Browser capabilities including WebGPU support, memory, and recommended provider
 */
export function useCapabilities(): BrowserCapabilities {
  const [capabilities] = useState<BrowserCapabilities>(() => detectCapabilities());

  return capabilities;
}
