import type { Business } from "~t/types";
import { getApi } from "~/utils/api";
import { queryOptions } from "@tanstack/react-query";

export async function queryBusiness(iri: Business["@id"]) {
	return await (await getApi<Business>(iri)).json();
}

export function makeBusinessQueryOpt(business?: Partial<Pick<Business, "@id" | "id">>) {
	const iri = business?.["@id"];

	return queryOptions({
		queryFn: async () => {
			if (!iri && !business?.id) {
				return null;
			}

			return await queryBusiness(iri ?? `/businesses/${business.id}`);
		},
		queryKey: [iri],
		staleTime: 60 * 60_000,
		enabled: !!iri || !!business?.id,
	});
}
