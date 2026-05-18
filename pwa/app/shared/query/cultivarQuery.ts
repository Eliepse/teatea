import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";
import { getApi } from "~/utils/api";
import type { ApiPaginatedCollection, Business, Cultivar } from "~t/types";
import type { Pagination } from "~t/query";

export async function queryCultivars(filters?: { q?: string }, pagination?: Pagination) {
	const queryParams = {
		...filters,
		...({ itemsPerPage: 8, ...pagination } satisfies Pagination),
	};

	return await (await getApi<ApiPaginatedCollection<Business>>("/api/cultivars", queryParams)).json();
}

export function makeCultivarQueryOpt(cultivar?: Partial<Pick<Cultivar, "@id" | "id">>) {
	const iri = cultivar?.["@id"] ?? `/cultivars/${cultivar?.id}`;

	return queryOptions({
		queryFn: async () => await (await getApi<Cultivar>(iri)).json(),
		queryKey: ["cultivars", iri],
		staleTime: 7 * 24 * 60_000,
		enabled: !!cultivar?.["@id"] || !!cultivar?.id,
	});
}

export function makeCultivarSearchInfiniteOpt(filters: { q?: string }, pagination?: Pick<Pagination, "itemsPerPage">) {
	return infiniteQueryOptions({
		queryFn: async ({ pageParam }) => {
			if (pageParam) {
				return await (await getApi<ApiPaginatedCollection<Business>>(pageParam)).json();
			}

			return await queryCultivars(filters, pagination);
		},
		queryKey: ["cultivars", "infinite", filters, pagination],
		staleTime: 60_000,
		getPreviousPageParam: (lastPage) => lastPage.view.previous,
		getNextPageParam: (lastPage) => lastPage.view.next,
		initialPageParam: "",
	});
}
