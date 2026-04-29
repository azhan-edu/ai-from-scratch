import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
	plugins: [react()],
	test: {
		environment: "jsdom",
		globals: true,
		setupFiles: ["./src/test/setup.ts"],
		// Exclude Playwright e2e specs — they use a different test runner and
		// will error when Vitest tries to execute them (CLAUDE.md §11).
		exclude: ["e2e/**", "node_modules/**"],
	},
});
