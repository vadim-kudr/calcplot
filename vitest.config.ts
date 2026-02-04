import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['tests/**/*.test.ts', 'tests/**/*.spec.ts', 'tests/**/*.vitest.ts'],
    exclude: ['node_modules', 'dist'],
    testTimeout: 2000,
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        'tests/',
        '**/*.spec.ts',
        '**/*.test.ts',
        '**/*.vitest.ts',
        '**/*.d.ts'
      ]
    }
  },
  esbuild: {
    target: 'es2020'
  }
});
