import { queryOptions } from "@tanstack/react-query";
import { getApi } from "~/utils/api";
import type { Origin } from "~t/types";

export function makeOriginQueryOpt(path?: string) {
	return queryOptions({
		queryFn: async () => {
			if (!path) {
				return null;
			}

			return await (await getApi<Origin>(`/origins/${path}`)).json();
		},
		queryKey: ["origins", path],
		staleTime: 7 * 24 * 60_000,
	});
}
