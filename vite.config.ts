import { defineConfig } from 'vitest/config';

export default defineConfig({
  base: '/word-ladder/',
  test: {
    include: ['src/**/*.test.ts'],
  },
});
