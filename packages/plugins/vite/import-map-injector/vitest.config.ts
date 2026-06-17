import { defineConfig, mergeConfig } from 'vitest/config';

import { baseConfig } from '@grasdouble/lufa_config_vitest';

export default mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      environment: 'node',
      coverage: {
        include: ['index.mjs'],
        exclude: ['**/*.test.*'],
        thresholds: {
          statements: 99,
          branches: 87,
          functions: 100,
          lines: 99,
        },
      },
    },
  })
);
