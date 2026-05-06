import type { SearchFilters } from "~/catalog/hooks/useSearchQuery";
import { getApi } from "~/utils/api";
import type { ApiPaginatedCollection, Tea } from "~t/types";
import { queryOptions } from "@tanstack/react-query";

export async function queryTeaSearch(filters?: SearchFilters, page?: { itemsPerPage?: number }) {
	const originFilterNodes = filters?.origin?.split(".")?.length ?? 1;
	const queryFilters = { ...filters, distinctByLevel: originFilterNodes > 1 ? 3 : 1 };

	const res = await getApi<ApiPaginatedCollection<Tea>>("/teas", { ...queryFilters, ...page });
	return await res.json();
}

export function makeTeaSearchQueryOpt(filters: SearchFilters, limit = 8) {
	return queryOptions({
		queryFn: async () => await queryTeaSearch(filters, { itemsPerPage: limit }),
		queryKey: ["search", "teas", { ...filters, itemsPerPage: limit }],
		staleTime: 60000,
	});
}
