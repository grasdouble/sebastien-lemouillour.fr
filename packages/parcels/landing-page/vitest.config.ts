import { defineConfig, mergeConfig } from 'vitest/config';

import { baseConfig } from '@grasdouble/lufa_config_vitest';

export default mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      coverage: {
        exclude: [
          'src/components/sections/HeroSection/animations/floatingTokens.ts',
          'src/components/sections/HeroSection/animations/matrixRain.ts',
          'src/components/sections/HeroSection/animations/particleNetwork.ts',
          'src/components/sections/HeroSection/HeroCanvas.tsx',
          'src/components/sections/SectionDivider/SectionDivider.tsx',
        ],
        thresholds: {
          statements: 96,
          branches: 99,
          functions: 94,
          lines: 99,
        },
      },
    },
  })
);
