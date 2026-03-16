import { defineConfig, devices } from '@playwright/test';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Playwright configuration for the Beta Test Suite.
 *
 * - Mobile-only (iPhone 14 Chromium, 390×844)
 * - Sequential execution (workers: 1, fullyParallel: false)
 * - Longer timeout for multi-step scenarios (60s)
 * - Screenshots managed by betaStep(), not Playwright's built-in capture
 */
export default defineConfig({
  testDir: './scenarios',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  timeout: 60_000,

  reporter: process.env.CI
    ? [
        ['list'],
        ['junit', { outputFile: '../../artifacts/beta-junit.xml' }],
        ['html', { outputFolder: '../../artifacts/beta-report', open: 'never' }],
      ]
    : [
        ['list'],
        ['html', { outputFolder: '../../artifacts/beta-report', open: 'never' }],
      ],

  use: {
    baseURL: 'http://localhost:4199',
    trace: 'on-first-retry',
    screenshot: 'off', // managed by betaStep()
    video: 'retain-on-failure',
  },

  expect: {
    timeout: 10_000,
  },

  globalSetup: resolve(__dirname, 'global-setup.ts'),
  globalTeardown: resolve(__dirname, 'global-teardown.ts'),

  webServer: {
    command: 'npx vite preview --port 4199 --host',
    port: 4199,
    cwd: resolve(__dirname, '../..'),
    reuseExistingServer: !process.env.CI,
    timeout: 15_000,
  },

  projects: [
    {
      name: 'beta-mobile',
      use: {
        ...devices['iPhone 14'],
        browserName: 'chromium',
      },
    },
  ],
});
