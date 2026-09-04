import { defineConfig, configDefaults } from 'vitest/config'
import path from 'path'

// Node 22+ ships an experimental global `localStorage` (unusable without
// `--localstorage-file`) that prevents the jsdom environment from installing
// its own. Turn it off so every Node version sees jsdom's Storage.
const nodeMajor = Number(process.versions.node.split('.')[0])
const execArgv = nodeMajor >= 22 ? ['--no-experimental-webstorage'] : []

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    exclude: [...configDefaults.exclude, 'e2e/**'],
    poolOptions: {
      forks: { execArgv },
      threads: { execArgv },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
