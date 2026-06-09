import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		name: "UNIT",
		include: ["./src/domain/identity/**/*.spec.ts"],
		globals: true,
	},
	plugins: [tsconfigPaths()],
});
