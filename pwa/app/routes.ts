import { layout, prefix, route, type RouteConfig } from "@react-router/dev/routes";

export default [
	route("/", "pages/homepage.tsx"),
	route("/login/:token?", "pages/auth/login-page.tsx"),

	route("/onboarding", "pages/auth/onboarding.tsx"),

	layout("auth/components/AuthenticatedGuard.tsx", [
		route("/welcome", "pages/dashboard.tsx"),
		route("/drink/new", "pages/drink/add-drink.tsx"),
		route("/tea/new", "pages/tea/tea-create.tsx"),
		...prefix("/me", [route("/drinks", "pages/drink/drinks.tsx"), route("/drink/:id", "pages/drink/drink.tsx")]),
	]),

	layout("auth/components/AdminGuard.tsx", [
		route("/refs", "pages/refs.tsx"),
		...prefix("/admin", [
			route("/type/new", "pages/type/type-create.tsx"),
			route("/members", "pages/admin/members.tsx"),
		]),
	]),
] satisfies RouteConfig;
