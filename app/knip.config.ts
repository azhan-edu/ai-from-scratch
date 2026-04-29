import type { KnipConfig } from "knip";

const config: KnipConfig = {
	entry: [
		"src/app/**/{page,layout,error,loading,route}.tsx",
		"src/app/**/{page,layout,error,loading,route}.ts",
	],
	project: ["src/**/*.{ts,tsx}"],
	ignore: ["src/test/**", "e2e/**"],
	ignoreDependencies: [
		// Required by Next.js but not imported directly
		"@tailwindcss/postcss",
		"postcss",
	],
};

export default config;
