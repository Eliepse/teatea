import { useInfiniteQuery } from "@tanstack/react-query";
import { getApi } from "~/utils/api";
import type { ApiPaginatedCollection, Tea, TeaFamily, TeaType } from "~t/types";
import { createContext, useContext } from "react";
import { throwNotImplemented } from "~/utils/function";

export type SearchFilters = {
	q?: string;
	originPath?: string;
	family?: TeaFamily;
};

export const SE_CONTEXT = createContext<{ filters: SearchFilters; patchFilters: (patch: SearchFilters) => void }>({
	filters: {},
	patchFilters: throwNotImplemented,
});

export function useSearchQuery(filters?: SearchFilters) {
	const query = useInfiniteQuery({
		queryFn: async ({ queryKey, pageParam }) => {
			const filters = queryKey[1];
			if (typeof filters === "string") {
				throw new Error("Invalid search");
			}

			const resourceType = searchTypeOrTea(filters);
			const response = await getApi<ApiPaginatedCollection<Tea | TeaType>>(
				pageParam ? pageParam : `/${resourceType}`,
				pageParam ? {} : filters,
			);

			return await response.json();
		},
		queryKey: ["search", { ...filters, itemsPerPage: 10, sort: "popularity" }],
		getPreviousPageParam: (lastPage) => lastPage.view.previous,
		getNextPageParam: (lastPage) => lastPage.view.next,
		initialPageParam: "",
	});

	const typeOrTea = searchTypeOrTea(filters);
	return { query, isTeaTypes: "tea_types" === typeOrTea, isTeas: "teas" === typeOrTea };
}

function searchTypeOrTea(filters?: SearchFilters): "teas" | "tea_types" {
	if (filters?.originPath) {
		return "teas";
	}

	return "tea_types";
}

export function useSEContext() {
	return useContext(SE_CONTEXT);
}
