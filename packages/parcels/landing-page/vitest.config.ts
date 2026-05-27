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
          statements: 95,
          branches: 68,
          functions: 95,
          lines: 95,
        },
      },
    },
  })
);
