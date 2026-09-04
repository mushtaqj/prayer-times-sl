import { defineConfig, devices } from '@playwright/test'

const PORT = 4173

export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    ...devices['Desktop Chrome'],
    // The default headless shell reports notification permission as "denied";
    // the full Chromium build honours context.grantPermissions(['notifications']).
    channel: 'chromium',
  },
  projects: [
    // Functional checks; this is what CI runs (npm run test:e2e).
    { name: 'e2e', testMatch: /notifications\.spec\.ts/ },
    // Screenshot capture for docs; run on demand (npm run screenshots).
    { name: 'screenshots', testMatch: /screenshots\.spec\.ts/ },
  ],
  webServer: {
    command: `npm run build:e2e && npx vite preview --outDir dist-e2e --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 240_000,
  },
})
