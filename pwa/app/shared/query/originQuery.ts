import { queryOptions } from "@tanstack/react-query";
import { getApi } from "~/utils/api";
import type { ApiCollection, Origin } from "~t/types";
import type { Pagination } from "~t/query";

export function makeOriginQueryOpt(origin?: Partial<Pick<Origin, "@id" | "path">>) {
	const iri = origin?.["@id"] ?? `/origins/${origin?.path}`;

	return queryOptions({
		queryFn: async () => await (await getApi<Origin>(iri)).json(),
		queryKey: ["origins", iri],
		staleTime: 7 * 24 * 60_000,
		enabled: !!origin?.path || !!origin?.["@id"],
	});
}

export function makePopularOriginQueryOpt(pagination: Pagination) {
	return queryOptions({
		queryFn: async () => {
			const params = { limit: pagination.itemsPerPage ?? 3 };
			const filters = { ...params, sort: "popularity", level: 1 };
			const data = await (await getApi<ApiCollection<Origin>>("/origins", filters)).json();
			return data.member;
		},
		queryKey: ["origins", "populars", pagination],
		staleTime: 24 * 60 * 60_000,
		refetchOnMount: false,
	});
}
