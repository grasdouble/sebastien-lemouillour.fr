import { defineConfig, mergeConfig } from 'vitest/config';

import { baseConfig } from '@grasdouble/lufa_config_vitest';

export default mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      include: ['src/**/*.test.ts'],
      environmentOptions: {
        happyDOM: { settings: { disableCSSFileLoading: true, handleDisabledFileLoadingAsSuccess: true } },
      },
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
