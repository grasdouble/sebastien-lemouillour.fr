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
          statements: 100,
          branches: 100,
          functions: 100,
          lines: 100,
        },
      },
    },
  })
);
