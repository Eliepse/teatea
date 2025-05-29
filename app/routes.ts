import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route("/refs", "routes/refs.tsx"),
    route("/add-tea", "routes/add-tea.tsx"),
    route("/api/search", "api/search.ts"),
    route("/api/filters", "api/filters.ts"),
] satisfies RouteConfig;
