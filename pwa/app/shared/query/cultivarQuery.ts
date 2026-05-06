import { queryOptions } from "@tanstack/react-query";
import { getApi } from "~/utils/api";
import type { Cultivar } from "~t/types";

export function makeCultivarQueryOpt(id?: number) {
	return queryOptions({
		queryFn: async () => {
			if (!id) {
				return null;
			}

			return await (await getApi<Cultivar>(`/cultivars/${id}`)).json();
		},
		queryKey: ["cultivars", id],
		staleTime: 7 * 24 * 60_000,
		enabled: !!id,
	});
}
