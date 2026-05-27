import { defineConfig, mergeConfig } from 'vitest/config';

import { baseConfig } from '@grasdouble/slm_config_vitest';

export default mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      coverage: {
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
