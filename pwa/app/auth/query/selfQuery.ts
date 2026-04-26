import { queryOptions } from "@tanstack/react-query";
import { getApi } from "~/utils/api";
import type { User } from "~t/types";

export async function querySelf() {
	return await (await getApi<User>("/me")).json();
}

export function makeSelfQueryOpt() {
	return queryOptions({
		queryFn: async () => await querySelf(),
		queryKey: ["member:self"],
		staleTime: 15 * 60_000,
	});
}
