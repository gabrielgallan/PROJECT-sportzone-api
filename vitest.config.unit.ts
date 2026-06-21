import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		name: 'UNIT',
		include: ['./src/domain/**/*.spec.ts', './src/infra/database/prisma/mappers/**/*.spec.ts'],
		globals: true,
	},
	plugins: [tsconfigPaths()],
});
