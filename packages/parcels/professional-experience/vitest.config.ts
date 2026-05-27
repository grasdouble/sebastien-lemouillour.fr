import { defineConfig, mergeConfig } from 'vitest/config';

import { baseConfig } from '@grasdouble/slm_config_vitest';

export default mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      coverage: {
        thresholds: {
          statements: 99,
          branches: 99,
          functions: 99,
          lines: 99,
        },
      },
    },
  })
);
