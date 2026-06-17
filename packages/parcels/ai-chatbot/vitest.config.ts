import { defineConfig, mergeConfig } from 'vitest/config';

import { baseConfig } from '@grasdouble/lufa_config_vitest';

export default mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      setupFiles: ['./src/components/__tests__/setup.ts'],
      coverage: {
        thresholds: {
          statements: 85,
          branches: 79,
          functions: 86,
          lines: 87,
        },
      },
    },
  })
);
