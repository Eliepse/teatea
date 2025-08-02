import { layout, prefix, route, type RouteConfig } from "@react-router/dev/routes";

export default [
	route("/", "pages/homepage.tsx"),
	route("/refs", "pages/refs.tsx"),
	route("/login", "pages/auth/login-page.tsx"),

	layout("auth/components/ProtectedLayout.tsx", [
		route("/welcome", "pages/dashboard.tsx"),
		route("/drink/new", "pages/brewing/add-drink.tsx"),
		route("/tea/new", "pages/tea/tea-create.tsx"),
		...prefix("/me", [route("/drinks", "pages/drink/drinks.tsx"), route("/drink/:id", "pages/drink/drink.tsx")]),
	]),
] satisfies RouteConfig;
