import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: false,
    // Single fork to avoid Prisma connection pool exhaustion
    singleFork: true,
    setupFiles: ['./src/__tests__/setup.ts'],
  },
  resolve: {
    // Allow Vitest to resolve .js imports to their .ts source files
    // (TypeScript nodenext style uses .js extensions for TypeScript files)
    extensions: ['.ts', '.js'],
  },
});
