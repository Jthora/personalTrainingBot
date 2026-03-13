import { defineConfig, devices } from '@playwright/test';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  testDir: './flows',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 1 : undefined,
  timeout: 45_000,

  globalSetup: resolve(__dirname, 'global-setup.ts'),
  globalTeardown: resolve(__dirname, 'global-teardown.ts'),

  reporter: process.env.CI
    ? [['junit', { outputFile: '../artifacts/e2e-junit.xml' }]]
    : [['html', { outputFolder: '../artifacts/e2e-report', open: 'never' }]],

  use: {
    baseURL: 'http://localhost:4199',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile',
      use: {
        ...devices['iPhone 14'],
        // Use Chromium for mobile viewport testing (WebKit not installed)
        browserName: 'chromium',
      },
    },
  ],
});
