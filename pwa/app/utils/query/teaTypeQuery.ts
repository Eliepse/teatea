import type { SearchFilters } from "~/catalog/hooks/useSearchQuery";
import { getApi } from "~/utils/api";
import type { ApiPaginatedCollection, TeaType } from "~t/types";
import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";
import type { Pagination } from "~t/query";

type Filters = Pick<SearchFilters, "family" | "q" | "origin"> & { distinctOrigins?: boolean };

export async function queryTypesSearch({ distinctOrigins, ...filters }: Filters, pagination: Pagination) {
	const originFilterNodes = filters.origin?.split(".")?.length ?? 1;
	const queryParams = {
		...filters,
		...({ itemsPerPage: 8, ...pagination } satisfies Pagination),
		distinctByLevel: distinctOrigins ? (originFilterNodes > 1 ? 3 : 1) : undefined,
	};

	return await (await getApi<ApiPaginatedCollection<TeaType>>("/tea_types", queryParams)).json();
}

export function makeTypeSearchQueryOpt(filters: Filters, pagination: Pagination) {
	return queryOptions({
		queryFn: async () => await queryTypesSearch(filters, pagination),
		queryKey: ["search", "tea_types", filters, pagination],
		staleTime: 60_000,
	});
}

export function makeTypeSearchInfiniteOpt(filters: Filters, pagination: Pick<Pagination, "itemsPerPage">) {
	return infiniteQueryOptions({
		queryFn: async ({ pageParam }) => {
			if (pageParam) {
				return await (await getApi<ApiPaginatedCollection<TeaType>>(pageParam)).json();
			}

			return await queryTypesSearch(filters, pagination);
		},
		queryKey: ["search", "tea_types", "infinite", filters, pagination],
		staleTime: 60_000,
		getPreviousPageParam: (lastPage) => lastPage.view.previous,
		getNextPageParam: (lastPage) => lastPage.view.next,
		initialPageParam: "",
	});
}
