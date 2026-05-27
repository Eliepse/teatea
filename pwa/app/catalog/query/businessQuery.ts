import type { Pagination } from "~t/query";
import { infiniteQueryOptions } from "@tanstack/react-query";
import { getApi } from "~/utils/api";
import type { ApiPaginatedCollection, Business } from "~t/types";
import { queryBusinesses } from "~/utils/query/businessQuery";

export function makeBusinessInfiniteOpt(filters: { q?: string }, pagination?: Pick<Pagination, "itemsPerPage">) {
	return infiniteQueryOptions({
		queryFn: async ({ pageParam }) => {
			if (pageParam) {
				return await (await getApi<ApiPaginatedCollection<Business>>(pageParam)).json();
			}

			return await queryBusinesses(filters, pagination);
		},
		queryKey: ["search", "business", "infinite", filters, pagination],
		staleTime: 60_000,
		getPreviousPageParam: (lastPage) => lastPage.view.previous,
		getNextPageParam: (lastPage) => lastPage.view.next,
		initialPageParam: "",
	});
}
