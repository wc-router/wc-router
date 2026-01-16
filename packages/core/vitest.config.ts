import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'happy-dom',
    include: ['__tests__/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'examples/**',
        'node_modules/**',
        '__tests__/**',
        '**/*.config.*',
        '**/dist/**',
      ],
    },
  },
});
