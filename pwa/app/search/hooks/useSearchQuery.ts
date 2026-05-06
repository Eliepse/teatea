import type { TeaFamily, TeaType } from "~t/types";
import { createContext, useContext } from "react";
import { throwNotImplemented } from "~/utils/function";

export type SearchFilters = {
	q?: string;
	origin?: string;
	rootOrigin?: string;
	family?: TeaFamily;
	type?: TeaType["slug"];
	cultivar?: number;
	distinctByLevel?: 1 | 2 | 3;
	year?: number;
};

export const SE_CONTEXT = createContext<{
	filters: SearchFilters;
	patchFilters: (patch: SearchFilters) => void;
	rootOrigin?: string;
	loading: boolean;
}>({
	filters: {},
	patchFilters: throwNotImplemented,
	loading: true,
});

export function useSEContext() {
	return useContext(SE_CONTEXT);
}
