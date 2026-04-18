import { useInfiniteQuery } from "@tanstack/react-query";
import type { TeaFamily, TeaType } from "~t/types";
import { createContext, useContext } from "react";
import { throwNotImplemented } from "~/utils/function";
import { type ItemType, makeSearchInfinitQueryOpt } from "~/search/query/searchQuery";

export type SearchFilters = {
	q?: string;
	origin?: string;
	family?: TeaFamily;
	type?: TeaType["slug"];
	cultivar?: string | number;
	distinctByLevel?: 1 | 2 | 3;
	year?: number;
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

export function useSearchQuery(type: ItemType, filters?: SearchFilters) {
	const query = useInfiniteQuery(makeSearchInfinitQueryOpt(type, filters));
	return { query, isTeaTypes: "tea_types" === type, isTeas: "teas" === type };
}

export function useSEContext() {
	return useContext(SE_CONTEXT);
}
