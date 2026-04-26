import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import runtimeEnv from "@runtime-env/vite-plugin";

export default defineConfig({
	plugins: [tailwindcss(), reactRouter(), tsconfigPaths(), runtimeEnv()],
	ssr: {
		noExternal: ["@posthog/react", "posthog-js"],
	},
	logLevel: "info",
	server: {
		host: "0.0.0.0",
	},
});
