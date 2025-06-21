import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
	index("routes/home.tsx"),
	route("/refs", "routes/refs.tsx"),
	route("/brew/:id", "routes/brewing/brewing-edit.tsx"),
	route("/tea/new", "routes/add-tea.tsx"),
	route("/tea/types/new", "routes/tea/create-type.tsx"),
	// route("/api/search", "api/search.ts"),
	// route("/api/filters", "api/filters.ts"),
	// route("/api/teaware", "api/teaware.ts"),
	// route("/api/brew", "routes/api/brew/create.ts"),
	// route("/api/brew/:id/steep", "routes/api/brew/create-steep.ts"),
] satisfies RouteConfig;
