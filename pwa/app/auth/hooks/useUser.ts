import type { User } from "~t/types";
import { fetchApi } from "~/utils/api";
import { useQuery } from "@tanstack/react-query";

async function fetchSelf(): Promise<User> {
	return await (await fetchApi<User>("/members/me")).json();
}

const QUERY_TTL = 15 * 60 * 1000;

export function useUser() {
	return useQuery({
		queryFn: fetchSelf,
		queryKey: ["user:me"],
		staleTime: QUERY_TTL,
		gcTime: QUERY_TTL,
	});
}
