// setup.ts — runs before every test file (configured via setupFiles in vite.config.ts).
// Extends Vitest's expect with jest-dom matchers (toBeInTheDocument, toHaveValue, etc.)
// so all test files get them without importing manually.
//
// Note: if setupFiles path resolution fails (e.g. on Windows), each test file can
// apply the same extension directly:
//   import * as matchers from '@testing-library/jest-dom/matchers'
//   expect.extend(matchers)

import { expect } from 'vitest'
import * as matchers from '@testing-library/jest-dom/matchers'

expect.extend(matchers)
