import type { Origin } from "~t/types";
import { fetchApi } from "~/utils/api";
import { useQuery } from "@tanstack/react-query";

async function fetchOriginsKeyByPath(): Promise<{ [key: string]: Origin }> {
	const data = await (await fetchApi("/origins")).json();
	return Object.fromEntries(data.member.map((origin: Origin) => [origin.path.join("."), origin]));
}

export function useOriginByPath() {
	return useQuery({
		queryFn: fetchOriginsKeyByPath,
		queryKey: ["origins", "keyByPath"]
	});
}
