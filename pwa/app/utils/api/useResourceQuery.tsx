import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "~/utils/api";
import type { Iri, Resource } from "~t/types";

export function useResourceQuery<T extends Pick<Resource, "@id">>(
	iri: Iri | number | undefined | null,
	prefix?: string,
) {
	return useQuery({
		queryFn: async (ctx) => {
			let iri = ctx.queryKey[0];

			if (!iri) {
				return undefined;
			}

			iri = typeof iri === "number" ? iri.toFixed(0) : iri;

			// Add prefix if not detected
			if (undefined !== prefix && !iri.includes("/")) {
				iri = prefix + iri;
			}

			return await (await fetchApi<T>(iri)).json();
		},
		queryKey: [iri],
		enabled: !!iri,
	});
}
