import { defineConfig } from "tsup";

export default defineConfig({
	entry: ["src/infra/server.ts"],
	outDir: "dist",

	format: ["esm"],
	clean: true,
});
