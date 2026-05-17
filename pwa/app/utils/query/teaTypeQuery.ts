import type { SearchFilters } from "~/catalog/hooks/useSearchQuery";
import { getApi } from "~/utils/api";
import type { ApiPaginatedCollection, TeaType } from "~t/types";
import { queryOptions } from "@tanstack/react-query";

type Filters = Pick<SearchFilters, "family" | "q" | "origin"> & { distinctOrigins?: boolean };

export async function queryTypesSearch(filters: Filters, page: { itemsPerPage?: number }) {
	const originFilterNodes = filters.origin?.split(".")?.length ?? 1;
	const queryFilters = {
		...filters,
		distinctByLevel: filters.distinctOrigins ? (originFilterNodes > 1 ? 3 : 1) : undefined,
	};

	const res = await getApi<ApiPaginatedCollection<TeaType>>("/tea_types", { ...queryFilters, ...page });
	return await res.json();
}

export function makeTypeSearchQueryOpt(filters: Filters, limit = 8) {
	return queryOptions({
		queryFn: async () => await queryTypesSearch(filters, { itemsPerPage: limit }),
		queryKey: ["search", "tea_types", { ...filters, itemsPerPage: limit }],
		staleTime: 60_000,
	});
}
