import type { Business } from "~t/types";
import { getApi } from "~/utils/api";
import { queryOptions } from "@tanstack/react-query";

export async function queryBusiness(iri: Business["@id"]) {
	return await (await getApi<Business>(iri)).json();
}

export function makeBusinessQueryOpt(iri?: Business["@id"]) {
	return queryOptions({
		queryFn: async () => {
			if (!iri) {
				return null;
			}

			return await queryBusiness(iri);
		},
		queryKey: [iri],
		staleTime: 60 * 60_000,
		enabled: !!iri,
	});
}
