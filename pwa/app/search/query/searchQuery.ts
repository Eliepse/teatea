import { getApi } from "~/utils/api";
import type { ApiPaginatedCollection, Tea, TeaType } from "~t/types";
import type { SearchFilters } from "~/search/hooks/useSearchQuery";
import { infiniteQueryOptions } from "@tanstack/react-query";

export type ItemType = "teas" | "tea_types";

export async function querySearch(type: ItemType, filters: SearchFilters) {
	const originFilterNodes = filters.origin?.split(".")?.length ?? 1;
	const queryFilters = { ...filters, distinctByLevel: originFilterNodes > 1 ? 3 : 1 };

	const url = "teas" === type ? "/teas" : "/tea_types";
	const response = await getApi<ApiPaginatedCollection<Tea | TeaType>>(url, queryFilters);
	return await response.json();
}

export function makeSearchInfinitQueryOpt(type: ItemType, filters?: SearchFilters) {
	return infiniteQueryOptions({
		queryFn: async ({ queryKey, pageParam }) => {
			if (pageParam) {
				return await (await getApi<ApiPaginatedCollection<Tea | TeaType>>(pageParam)).json();
			}

			return querySearch(queryKey[1] as ItemType, queryKey[2] as SearchFilters);
		},
		queryKey: ["search", type, { ...filters, itemsPerPage: 10, sort: "popularity" }],
		getPreviousPageParam: (lastPage) => lastPage.view.previous,
		getNextPageParam: (lastPage) => lastPage.view.next,
		initialPageParam: "",
	});
}
