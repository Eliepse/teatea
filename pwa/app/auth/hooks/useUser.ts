import type { User } from "~t/types";
import { fetchApi } from "~/utils/api";
import { useQuery } from "@tanstack/react-query";

async function fetchSelf(): Promise<User> {
	return await (await fetchApi("/users/me")).json();
}

export function useUser() {
	return useQuery({
		queryFn: fetchSelf,
		queryKey: ["user:me"],
	});
}
