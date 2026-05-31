import type { SearchFilters } from "~/catalog/hooks/useSearchQuery";
import { getApi } from "~/utils/api";
import type { ApiPaginatedCollection, Tea } from "~t/types";
import { queryOptions } from "@tanstack/react-query";
import { extractId } from "~/utils/resource";
import { parseIntSafe } from "~/utils/math";
import type { NewTeaData } from "~/catalog/mutation/createTeaMutation";

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

export function makeCountSimilarTeasQueryOpt(filters: Partial<NewTeaData>) {
	return queryOptions({
		queryFn: async () => {
			if (typeof filters.origin === "object") {
				return 0;
			}

			if (typeof filters.business === "object") {
				return 0;
			}

			if (typeof filters.cultivar === "object") {
				return 0;
			}

			const res = await getApi<ApiPaginatedCollection<Tea>>("/teas", {
				...filters,
				type: extractId(filters.type),
				origin: extractId(filters.origin),
				cultivar: parseIntSafe(extractId(filters.cultivar)),
				business: parseIntSafe(extractId(filters.business)),
				exactMatch: true,
				itemsPerPage: 1,
			});

			return (await res.json()).totalItems;
		},
		queryKey: ["find_similar", filters],
	});
}
