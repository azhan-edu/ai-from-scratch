import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright configuration for the Virtual Pet Companion app.
 * Spins up the Next.js dev server before running tests so the suite is
 * self-contained and needs no manually running process.
 */
export default defineConfig({
	testDir: "./e2e",
	// Give each test up to 30 s before it is considered timed-out
	timeout: 30_000,
	fullyParallel: true,
	// exactOptionalPropertyTypes: workers must be a concrete value, not
	// undefined — omit the property when we want Playwright's default.
	...(process.env.CI ? { workers: 1 } : {}),
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 1 : 0,
	reporter: "list",

	use: {
		// The dev server started by webServer listens here
		baseURL: "http://localhost:3000",
		// Collect traces only on retry so normal runs stay fast
		trace: "on-first-retry",
	},

	projects: [
		{
			name: "chromium",
			use: { ...devices["Desktop Chrome"] },
		},
		{
			name: "firefox",
			use: { ...devices["Desktop Firefox"] },
		},
	],

	// Start the Next.js dev server before any tests run
	webServer: {
		command: "pnpm dev",
		url: "http://localhost:3000",
		// Reuse an already-running server during local development
		reuseExistingServer: !process.env.CI,
		timeout: 120_000,
	},
});
