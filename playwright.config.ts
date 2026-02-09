import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for DummyJSON API testing
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',
  
  /* Maximum time one test can run for */
  timeout: 30 * 1000,
  
  /* Test retry configuration */
  retries: process.env.CI ? 2 : 1,
  
  /* Number of parallel workers */
  workers: process.env.CI ? 2 : undefined,
  
  /* Reporter configuration */
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
    ['json', { outputFile: 'test-results.json' }],
  ],
  
  /* Shared settings for all tests */
  use: {
    /* Base URL for API requests */
    baseURL: process.env.BASE_URL || 'https://dummyjson.com',
    
    /* Extra HTTP headers */
    extraHTTPHeaders: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    
    /* Collect trace on first retry */
    trace: 'on-first-retry',
    
    /* Screenshot on failure */
    screenshot: 'only-on-failure',
    
    /* Video on failure */
    video: 'retain-on-failure',
  },

  /* Configure projects for different test scenarios */
  projects: [
    {
      name: 'API Tests',
      testMatch: '**/*.spec.ts',
    },
  ],
});
