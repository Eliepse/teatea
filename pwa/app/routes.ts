import { layout, prefix, route, type RouteConfig } from "@react-router/dev/routes";

export default [
	route("/", "routes/homepage.tsx"),
	route("/refs", "routes/refs.tsx"),
	layout("auth/components/ProtectedLayout.tsx", [
		route("/welcome", "routes/dashboard.tsx"),
		...prefix("/me", [
			// route("/teas", "routes/user/teaCollection.tsx"),
			route("/drinks", "routes/drink/drinks.tsx"),
			route("/drink/:id", "routes/drink/drink.tsx"),
		]),
		route("/brew/:id", "routes/brewing/brewing-edit.tsx"),
		route("/tea/new", "routes/add-tea.tsx"),
		route("/tea/types/new", "routes/tea/create-type.tsx"),
		route("/drink/new", "routes/brewing/add-drink.tsx"),
	]),
	route("/login", "routes/auth/login-page.tsx"),
] satisfies RouteConfig;
