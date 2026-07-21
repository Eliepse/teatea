import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [tailwindcss(), reactRouter()],
	ssr: {
		noExternal: ["@posthog/react", "posthog-js"],
	},
	logLevel: "info",
	server: {
		host: "0.0.0.0",
	},
	resolve: {
		tsconfigPaths: true,
	}
});
