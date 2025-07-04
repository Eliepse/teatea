import { layout, route, type RouteConfig } from "@react-router/dev/routes";

export default [
	route("/refs", "routes/refs.tsx"),
	layout("auth/components/ProtectedLayout.tsx", [
		route("/welcome", "routes/dashboard.tsx"),
		route("/brew/:id", "routes/brewing/brewing-edit.tsx"),
		route("/tea/new", "routes/add-tea.tsx"),
		route("/tea/types/new", "routes/tea/create-type.tsx"),
		route("/drink/new", "routes/brewing/add-drink.tsx"),
	]),
	route("/login", "routes/auth/login-page.tsx"),
] satisfies RouteConfig;
