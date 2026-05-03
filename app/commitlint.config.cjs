/** @type {import('@commitlint/types').UserConfig} */
module.exports = {
	extends: ["@commitlint/config-conventional"],
	rules: {
		// Scopes from CLAUDE.md: feat(pet): ... / fix(decay): ...
		"scope-enum": [
			1,
			"always",
			[
				"pet",
				"decay",
				"ai",
				"auth",
				"db",
				"ui",
				"state",
				"api",
				"e2e",
				"deps",
				"ci",
				"config",
				"minigame",
				"evolution",
				"shop",
			],
		],
		"subject-case": [2, "always", "lower-case"],
	},
};
