// vitest.config.ts — test-only configuration.
// Kept separate from vite.config.ts so Vite plugin types don't conflict with
// vitest/config's defineConfig. Vitest automatically merges this with vite.config.ts
// at runtime, so plugins (React, Tailwind) are still active during tests.
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // Use jsdom so browser APIs (localStorage, FileReader, Blob) are available in tests
    environment: 'jsdom',
    // Expose describe/it/expect globally so test files don't need to import them
    globals: true,
    // Runs before every test file — loads jest-dom matchers (toBeInTheDocument etc.)
    setupFiles: ['./src/test/setup.ts'],
  },
})
