import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
	index("routes/home.tsx"),
	route("/refs", "routes/refs.tsx"),
	route("/add-tea", "routes/add-tea.tsx"),
	route("/brew/:id", "routes/brewing/brewing-edit.tsx"),
	route("/api/search", "api/search.ts"),
	route("/api/filters", "api/filters.ts"),
	route("/api/teaware", "api/teaware.ts"),
	route("/api/brew", "routes/api/brew/create.ts"),
	route("/api/brew/:id/steep", "routes/api/brew/create-steep.ts"),
] satisfies RouteConfig;
