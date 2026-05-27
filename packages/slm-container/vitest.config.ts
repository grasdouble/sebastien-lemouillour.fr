import { defineConfig, mergeConfig } from 'vitest/config';

import { baseConfig } from '@grasdouble/lufa_config_vitest';

export default mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      coverage: {
        exclude: ['src/main.ts', 'src/i18n.ts', 'src/loader.ts'],
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
