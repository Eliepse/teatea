import { layout, prefix, route, type RouteConfig } from "@react-router/dev/routes";

export default [
	route("/", "pages/homepage.tsx"),
	route("/login/verify/:token", "pages/auth/verify.tsx"),

	route("/onboarding", "pages/auth/onboarding.tsx"),
	route("/members/:username", "account/pages/profile.tsx"),

	layout("auth/components/AuthenticatedGuard.tsx", [
		route("/welcome", "pages/dashboard/dashboard.tsx"),

		route("/tea/search", "catalog/pages/search.tsx"),
		route("/tea/:id", "catalog/pages/tea.tsx"),
		route("/tea_types/:origin/:slug", "pages/tea/tea-type.tsx"),

		route("/sessions/:id", "pages/teaSession/teaSession.tsx"),
		route("/sessions", "pages/teaSession/teaSessions.tsx"),
		route("/feed", "social/pages/feed.tsx"),

		route("/lists/:id", "pages/member/teaList.tsx"),

		route("/members/:username/friends", "account/pages/friends.tsx"),
		route("/members/:username/teas", "account/pages/my-teas.tsx"),
		route("/members/:username/teas/:teaId", "account/pages/my-teas-item.tsx"),

		...prefix("/me", [route("/teas", "pages/tea/tea-list.tsx")]),
	]),

	layout("auth/components/AdminGuard.tsx", [
		route("/refs", "pages/refs.tsx"),
		...prefix("/admin", [route("/", "pages/admin/home.tsx"), route("/members", "pages/admin/members.tsx")]),
	]),
] satisfies RouteConfig;
