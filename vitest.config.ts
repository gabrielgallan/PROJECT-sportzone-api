import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		include: ["**/*.spec.ts", "**/*.test.ts"],
		exclude: ["node_modules", "dist", "src/infra/http/controllers/*"],
		globals: true,
		root: "./",
	},
	plugins: [tsconfigPaths()],
	resolve: {
		alias: {
			// Ensure Vitest correctly resolves TypeScript path aliases
			src: "./src",
		},
	},
});
