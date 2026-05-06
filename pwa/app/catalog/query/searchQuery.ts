import { getApi } from "~/utils/api";
import type { ApiPaginatedCollection, Tea } from "~t/types";
import type { SearchFilters } from "~/catalog/hooks/useSearchQuery";
import { infiniteQueryOptions } from "@tanstack/react-query";
import { queryTeaSearch } from "~/utils/query/teaQuery";

export function makeSearchInfinitQueryOpt(filters?: SearchFilters) {
	return infiniteQueryOptions({
		queryFn: async ({ pageParam }) => {
			if (pageParam) {
				return await (await getApi<ApiPaginatedCollection<Tea>>(pageParam)).json();
			}

			return queryTeaSearch(filters);
		},
		queryKey: ["search", "teas", { ...filters, itemsPerPage: 15, sort: "popularity" }],
		getPreviousPageParam: (lastPage) => lastPage.view.previous,
		getNextPageParam: (lastPage) => lastPage.view.next,
		initialPageParam: "",
	});
}
