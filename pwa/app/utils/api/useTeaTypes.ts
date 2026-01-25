import { type ApiCollection, type TeaFamily, type TeaType } from "~t/types";
import { fetchApi } from "~/utils/api";
import { type QueryFunctionContext, useQuery } from "@tanstack/react-query";

type TeaTypesFilters = {
	origin?: string;
	family?: TeaFamily;
	distinctByLevel?: 1 | 2 | 3;
};

async function fetchTypesByFamily(args: QueryFunctionContext<[string, TeaTypesFilters]>) {
	const filters = args.queryKey[1] ?? {};
	const searchParams = new URLSearchParams();

	if (filters.origin) {
		searchParams.append("origin", filters.origin);
	}

	if (filters.family) {
		searchParams.append("family", filters.family);
	}

	const params = searchParams.size ? `?${searchParams}` : "";
	return await (await fetchApi<ApiCollection<TeaType>>(`/tea_types${params}`)).json();
}

export function useTeaTypes(filters?: TeaTypesFilters) {
	return useQuery({
		queryFn: fetchTypesByFamily,
		queryKey: ["tea_types", filters ?? {}],
	});
}
