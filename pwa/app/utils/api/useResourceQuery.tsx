import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "~/utils/api";
import type { Iri, Resource } from "~t/types";

export function useResourceQuery<T extends Resource>(iri: Iri | undefined | null) {
	return useQuery({
		queryFn: async (ctx) => {
			if (!ctx.queryKey[0]) {
				return undefined;
			}

			return await (await fetchApi<T>(ctx.queryKey[0])).json();
		},
		queryKey: [iri],
		enabled: !!iri,
	});
}
