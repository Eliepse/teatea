import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import * as pluginReactHook from "eslint-plugin-react-hooks";
import { defineConfig } from "eslint/config";

export default defineConfig([
	{ files: ["**/*.{js,ts,jsx,tsx}"], plugins: { js }, extends: ["js/recommended"] },
	{ files: ["**/*.{js,ts,jsx,tsx}"], languageOptions: { globals: globals.browser } },
	tseslint.configs.recommended,
	pluginReact.configs.flat.recommended,
	pluginReactHook.configs["recommended-latest"],
	{ ignores: ["**/*.json", ".react-router/**/*", "build/", ".pnpm-store/", "data/"] },
	{
		rules: {
			"react/react-in-jsx-scope": "off",
			"@typescript-eslint/no-unused-vars": [
				"error",
				{
					args: "all",
					argsIgnorePattern: "^_",
					caughtErrors: "all",
					caughtErrorsIgnorePattern: "^_",
					destructuredArrayIgnorePattern: "^_",
					varsIgnorePattern: "^_",
					ignoreRestSiblings: true,
				},
			],
		},
	},
]);
