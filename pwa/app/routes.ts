import { layout, prefix, route, type RouteConfig } from "@react-router/dev/routes";

export default [
	route("/", "pages/homepage.tsx"),
	route("/login/:token?", "pages/auth/login-page.tsx"),

	route("/onboarding", "pages/auth/onboarding.tsx"),

	layout("auth/components/AuthenticatedGuard.tsx", [
		route("/welcome", "pages/dashboard.tsx"),

		route("/tea/new", "pages/tea/tea-create.tsx"),
		route("/tea/search", "pages/tea/search.tsx"),
		route("/tea/:id", "pages/tea/tea.tsx"),

		route("/session/new", "pages/teaSession/add-session.tsx"),
		route("/sessions/:id", "pages/teaSession/teaSession.tsx"),
		route("/sessions", "pages/teaSession/teaSessions.tsx"),

		...prefix("/me", [
			route("/teas", "pages/tea/tea-list.tsx"),
		]),
	]),

	layout("auth/components/AdminGuard.tsx", [
		route("/refs", "pages/refs.tsx"),
		...prefix("/admin", [
			route("/", "pages/admin/home.tsx"),
			route("/type/new", "pages/type/type-create.tsx"),
			route("/members", "pages/admin/members.tsx"),
		]),
	]),
] satisfies RouteConfig;
