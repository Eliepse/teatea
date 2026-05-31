import type { Pagination } from "~t/query";
import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";
import { getApi } from "~/utils/api";
import type { ApiPaginatedCollection, Cultivar } from "~t/types";

export async function queryCultviar(iri: Cultivar["@id"]) {
	return await (await getApi<Cultivar>(iri)).json();
}

export async function queryCultivars(filters?: { q?: string }, pagination?: Pagination) {
	const queryParams = {
		...filters,
		...({ itemsPerPage: 8, ...pagination } satisfies Pagination),
	};

	return await (await getApi<ApiPaginatedCollection<Cultivar>>("/api/cultivars", queryParams)).json();
}

export function makeCultivarQueryOpt(cultivar?: Partial<Pick<Cultivar, "@id" | "id">>) {
	const iri = cultivar?.["@id"] ? cultivar["@id"] : `/cultivars/${cultivar?.id}`;

	return queryOptions({
		queryFn: async () => (iri ? await queryCultviar(iri) : null),
		queryKey: [iri],
		staleTime: 60 * 60_000,
		enabled: !!cultivar?.["@id"] || !!cultivar?.id,
	});
}

export function makeCultivarInfiniteOpt(filters: { q?: string }, pagination?: Pick<Pagination, "itemsPerPage">) {
	return infiniteQueryOptions({
		queryFn: async ({ pageParam }) => {
			if (pageParam) {
				return await (await getApi<ApiPaginatedCollection<Cultivar>>(pageParam)).json();
			}

			return await queryCultivars(filters, pagination);
		},
		queryKey: ["search", "cultivar", "infinite", filters, pagination],
		staleTime: 60_000,
		getPreviousPageParam: (lastPage) => lastPage.view.previous,
		getNextPageParam: (lastPage) => lastPage.view.next,
		initialPageParam: "",
	});
}
