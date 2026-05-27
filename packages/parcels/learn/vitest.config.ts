import { defineConfig, mergeConfig } from 'vitest/config';

import { baseConfig } from '@grasdouble/slm_config_vitest';

export default mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      coverage: {
        thresholds: {
          statements: 33,
          branches: 23,
          functions: 19,
          lines: 32,
        },
      },
    },
  })
);
