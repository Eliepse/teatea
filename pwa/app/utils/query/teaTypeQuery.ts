import type { SearchFilters } from "~/search/hooks/useSearchQuery";
import { getApi } from "~/utils/api";
import type { ApiPaginatedCollection, TeaType } from "~t/types";
import { queryOptions } from "@tanstack/react-query";

export async function queryTypesSearch(
	filters: Pick<SearchFilters, "family" | "q" | "origin">,
	page: { itemsPerPage?: number },
) {
	const originFilterNodes = filters.origin?.split(".")?.length ?? 1;
	const queryFilters = { ...filters, distinctByLevel: originFilterNodes > 1 ? 3 : 1 };

	const res = await getApi<ApiPaginatedCollection<TeaType>>("/tea_types", { ...queryFilters, ...page });
	return await res.json();
}

export function makeTypeSearchQueryOpt(filters: Pick<SearchFilters, "family" | "q" | "origin">, limit = 8) {
	return queryOptions({
		queryFn: async () => await queryTypesSearch(filters, { itemsPerPage: limit }),
		queryKey: ["search", "tea_types", { ...filters, itemsPerPage: limit }],
		staleTime: 60000,
	});
}
