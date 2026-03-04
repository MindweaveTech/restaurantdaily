import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'line',
  timeout: 10000, // Minimal timeout - 10 seconds per test
  expect: {
    timeout: 3000, // 3 seconds for assertions
  },
  use: {
    baseURL: 'http://localhost:3002',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    headless: true, // Always run headless
    actionTimeout: 5000, // 5 seconds for actions
    navigationTimeout: 10000, // 10 seconds for navigation
  },
  outputDir: '.screenshots', // Screenshots go here
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
  webServer: {
    command: 'PORT=3002 npm run dev',
    url: 'http://localhost:3002',
    reuseExistingServer: true,
    timeout: 30000, // 30 seconds to start server
  },
});
