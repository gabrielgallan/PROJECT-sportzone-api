import { defineConfig, defineProject } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  test: {
    globals: true,
    projects: [
      // 🧩 Project 1: Unit tests
      defineProject({
        plugins: [tsconfigPaths()],
        test: {
          name: 'unit',
          include: ['src/domain/use-cases/**/*.spec.ts'],
          environment: 'node',
        },
      }),

      // 🧩 Project 2: E2E tests with Prisma
      defineProject({
        plugins: [tsconfigPaths()],
        test: {
          name: 'e2e',
          include: ['src/infra/**/*.spec.ts'],
          setupFiles: ['src/test/e2e/setup.ts'],
          hookTimeout: 60000,
        },
      }),
    ],
  },
})
