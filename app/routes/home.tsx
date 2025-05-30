import type { Route } from "./+types/home";
import { TeaSearch } from "~/components/search/tea-search/tea-search";

export function meta({}: Route.MetaArgs) {
	return [{ title: "Teatea" }];
}

export default function Home(props: Route.ComponentProps) {
	return <TeaSearch onSelect={console.debug} />;
}
