import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock import.meta.env for tests
global.import = {
  meta: {
    env: {
      VITE_BIBLE_API_URL: 'http://localhost:3001',
      DEV: true
    }
  }
};

// Add custom matchers (optional)
expect.extend({
  toBeValidReference(received) {
    const pass = typeof received === 'string' && /^\w+\s+\d+:\d+/.test(received);
    return {
      pass,
      message: () => `expected ${received} to be a valid Bible reference`
    };
  }
});
