import process from 'node:process';
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './packages/slm-container/__tests__',
  testMatch: '**/*.browser.spec.mjs',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  use: { baseURL: 'http://127.0.0.1:4173', browserName: 'chromium', locale: 'fr-FR', trace: 'retain-on-failure' },
  webServer: {
    command: 'pnpm --filter @grasdouble/slm-container exec vite preview --host 127.0.0.1 --port 4173 --strictPort',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: !process.env.CI,
  },
});
