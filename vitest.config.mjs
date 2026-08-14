import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/setupTests.ts'],
    include: ['src/**/*.test.{js,jsx,ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary'],
      include: ['src/**/*.{js,jsx,ts,tsx}'],
      exclude: ['src/**/*.test.{js,jsx,ts,tsx}', 'src/main.tsx', 'src/setupTests.ts'],
      thresholds: {
        lines: 55,
        functions: 55,
        statements: 55,
        branches: 45,
      },
    },
  },
});
