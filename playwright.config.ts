import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env') });

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report' }],
    ['junit', { outputFile: 'test-results/playwright-results.xml' }],
  ],
  projects: [
    {
      name: 'api',
      testDir: './tests/api',
      use: {
        baseURL: process.env.CMS_BASE_URL ?? 'https://payload-cms-poc-seven.vercel.app',
        trace: 'on-first-retry',
      },
    },
    {
      name: 'web-chromium',
      testDir: './tests/web',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: process.env.WEB_BASE_URL ?? 'https://payload-website-consumer.vercel.app',
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
      },
    },
    {
      name: 'web-firefox',
      testDir: './tests/web',
      use: {
        ...devices['Desktop Firefox'],
        baseURL: process.env.WEB_BASE_URL ?? 'https://payload-website-consumer.vercel.app',
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
      },
    },
    {
      name: 'web-webkit',
      testDir: './tests/web',
      use: {
        ...devices['Desktop Safari'],
        baseURL: process.env.WEB_BASE_URL ?? 'https://payload-website-consumer.vercel.app',
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
      },
    },
  ],
});
