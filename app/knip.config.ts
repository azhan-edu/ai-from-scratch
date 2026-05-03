import type { KnipConfig } from "knip";

const config: KnipConfig = {
	entry: ["src/app/**/{page,layout,error,loading,route}.tsx"],
	project: ["src/**/*.{ts,tsx}"],
	ignoreDependencies: [
		// Required by Next.js but not imported directly
		"postcss",
		// Peer dependency of @tailwindcss/postcss — not imported directly
		"tailwindcss",
		// CLI tools invoked by CI pipeline, not imported in source
		"@lhci/cli",
		"wait-on",
	],
};

export default config;
