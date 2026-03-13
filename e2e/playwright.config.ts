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

  reporter: process.env.CI
    ? [['junit', { outputFile: '../artifacts/e2e-junit.xml' }]]
    : [
        ['list'],
        ['html', { outputFolder: '../artifacts/e2e-report', open: 'never' }],
      ],

  use: {
    baseURL: 'http://localhost:4199',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  expect: {
    timeout: 10_000,
  },

  webServer: {
    command: 'npx vite preview --port 4199 --host',
    port: 4199,
    cwd: resolve(__dirname, '..'),
    reuseExistingServer: !process.env.CI,
    timeout: 15_000,
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
