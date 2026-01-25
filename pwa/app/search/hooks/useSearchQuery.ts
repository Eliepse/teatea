import { useInfiniteQuery } from "@tanstack/react-query";
import { getApi } from "~/utils/api";
import type { ApiPaginatedCollection, Tea, TeaFamily, TeaType } from "~t/types";
import { createContext, useContext } from "react";
import { throwNotImplemented } from "~/utils/function";

export type SearchFilters = {
	q?: string;
	origin?: string;
	family?: TeaFamily;
	type?: TeaType["slug"];
	cultivar?: string | number;
	distinctByLevel?: 1 | 2 | 3;
};

export const SE_CONTEXT = createContext<{
	filters: SearchFilters;
	patchFilters: (patch: SearchFilters) => void;
	searchType: ItemType;
}>({
	filters: {},
	patchFilters: throwNotImplemented,
	searchType: "tea_types",
});

type ItemType = "teas" | "tea_types";

export function useSearchQuery(type: ItemType, filters?: SearchFilters) {
	const query = useInfiniteQuery({
		queryFn: async ({ queryKey, pageParam }) => {
			let filters = queryKey[2] as SearchFilters;
			const type = queryKey[1] as ItemType;

			if (!filters.origin) {
				filters = { ...filters, distinctByLevel: 1 };
			}

			const response = await getApi<ApiPaginatedCollection<Tea | TeaType>>(
				pageParam ? pageParam : `/${type}`,
				pageParam ? {} : filters,
			);

			return await response.json();
		},
		queryKey: ["search", type, { ...filters, itemsPerPage: 10, sort: "popularity" }],
		getPreviousPageParam: (lastPage) => lastPage.view.previous,
		getNextPageParam: (lastPage) => lastPage.view.next,
		initialPageParam: "",
	});

	return { query, isTeaTypes: "tea_types" === type, isTeas: "teas" === type };
}

export function useSEContext() {
	return useContext(SE_CONTEXT);
}
